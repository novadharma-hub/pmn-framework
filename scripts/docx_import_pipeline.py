"""
PMN DOCX Import Pipeline - Staged & Validated Approach

This module introduces a multi-stage pipeline for importing PMN manuscripts
from DOCX into the modular JSON format.

Goal:
- Make the import process more observable
- Fail early with clear diagnostics
- Add validation layers between DOCX and final JSON output
- Prepare the ground for a proper Document Structure Contract

Current status: 6 stages implemented.
Focus: Structural integrity + Content quality + Early cross-reference checks.
These stages are designed to run before or alongside the main importer.
"""

from __future__ import annotations

import os
import re
import zipfile
import xml.etree.ElementTree as ET
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

# Reuse some utilities from the existing importer when possible
# (we import specific functions to avoid circular issues for now)
try:
    from import_pmn_docx import (
        NS,
        W_NS,
        normalize_space,
        strip_control_chars,
        paragraph_class,
        paragraph_html,
        parse_part_heading,
        parse_section_heading,
    )
except ImportError:
    # Fallback definitions if direct import fails during early development
    NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
    W_NS = "{%s}" % NS["w"]

    def normalize_space(text: str) -> str:
        return re.sub(r"\s+", " ", text).strip()

    def strip_control_chars(text: str) -> str:
        return re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", text)

    def paragraph_class(para): return None
    def paragraph_html(para): return ""
    def parse_part_heading(text): return None
    def parse_section_heading(text): return (text, text)


@dataclass
class PipelineIssue:
    stage: str
    severity: str          # "error" or "warning"
    code: str
    message: str
    context: dict[str, Any] = field(default_factory=dict)


@dataclass
class PipelineResult:
    stage: str
    success: bool
    data: Any = None
    issues: list[PipelineIssue] = field(default_factory=list)

    def has_errors(self) -> bool:
        return any(i.severity == "error" for i in self.issues)

    def has_warnings(self) -> bool:
        return any(i.severity == "warning" for i in self.issues)


@dataclass
class ImportReport:
    """Final aggregated report of the entire import process."""
    overall_success: bool
    stages: list[PipelineResult]
    total_errors: int = 0
    total_warnings: int = 0

    def summary(self) -> str:
        status = "SUCCESS" if self.overall_success else "FAILED"
        return (
            f"Import {status} | "
            f"Errors: {self.total_errors} | Warnings: {self.total_warnings}"
        )

    def print_detailed_report(self):
        print("\n" + "=" * 70)
        print(f"  STAGED DOCX IMPORT REPORT")
        print("=" * 70)
        print(f"Overall Status : {'SUCCESS' if self.overall_success else 'FAILED'}")
        print(f"Total Errors   : {self.total_errors}")
        print(f"Total Warnings : {self.total_warnings}")
        print("-" * 70)

        for stage_result in self.stages:
            status_icon = "✓" if stage_result.success else "✗"
            print(f"\n{status_icon} Stage: {stage_result.stage}")
            if not stage_result.issues:
                print("    No issues.")
            for issue in stage_result.issues:
                prefix = "  [ERROR]" if issue.severity == "error" else "  [WARN] "
                print(f"{prefix} [{issue.code}] {issue.message}")
        print("\n" + "=" * 70)


# =============================================================================
# STAGE 1: Raw Paragraph Extraction
# =============================================================================

def stage_1_extract_paragraphs(docx_path: Path) -> PipelineResult:
    """Stage 1: Extract raw paragraphs from the DOCX file."""
    issues: list[PipelineIssue] = []
    paragraphs = []

    try:
        with zipfile.ZipFile(docx_path) as archive:
            document_xml = archive.read("word/document.xml")
        root = ET.fromstring(document_xml)

        for para in root.findall(".//w:p", NS):
            text = "".join(node.text or "" for node in para.findall(".//w:t", NS))
            text = normalize_space(text)
            if text:
                paragraphs.append({"element": para, "text": text})

    except Exception as e:
        issues.append(PipelineIssue(
            stage="extract_paragraphs",
            severity="error",
            code="EXTRACTION_FAILED",
            message=str(e)
        ))
        return PipelineResult(stage="1_extract", success=False, issues=issues)

    return PipelineResult(
        stage="1_extract",
        success=True,
        data=paragraphs,
        issues=issues
    )


# =============================================================================
# STAGE 2: Structural Sanity Checks (Critical Validations)
# =============================================================================

def stage_2_structural_sanity_check(paragraphs: list[dict]) -> PipelineResult:
    """
    Stage 2: Run critical structural checks based on known fragile assumptions.
    This is where we catch the most dangerous issues early.
    """
    issues: list[PipelineIssue] = []

    texts = [p["text"] for p in paragraphs]

    # === Critical Check 1: "Contents" existence ===
    if "Contents" not in texts:
        issues.append(PipelineIssue(
            stage="structural_sanity",
            severity="error",
            code="MISSING_CONTENTS",
            message="Could not find a paragraph with exact text 'Contents'. "
                    "This is required to locate the Table of Contents."
        ))

    # === Critical Check 2: Preface count (very dangerous assumption) ===
    preface_count = texts.count("Preface")
    if preface_count < 2:
        issues.append(PipelineIssue(
            stage="structural_sanity",
            severity="error",
            code="INSUFFICIENT_PREFACE",
            message=f"Found only {preface_count} paragraph(s) with text 'Preface'. "
                    "The importer currently requires at least 2 (the second one marks body start)."
        ))
    elif preface_count > 2:
        issues.append(PipelineIssue(
            stage="structural_sanity",
            severity="warning",
            code="MULTIPLE_PREFACE",
            message=f"Found {preface_count} occurrences of 'Preface'. "
                    "The importer uses the second occurrence as body start. "
                    "Verify this is still correct."
        ))

    # === Check for Part headings (basic existence) ===
    part_headings = [t for t in texts if parse_part_heading(t)]
    if len(part_headings) == 0:
        issues.append(PipelineIssue(
            stage="structural_sanity",
            severity="error",
            code="NO_PART_HEADINGS",
            message="No valid Part headings found (expected format: 'Part [Roman]: Title')."
        ))

    success = not any(i.severity == "error" for i in issues)

    return PipelineResult(
        stage="2_structural_sanity",
        success=success,
        data=paragraphs,   # pass through for next stage
        issues=issues
    )


# =============================================================================
# STAGE 3: Heading Validation (Prepared for Structure Contract)
# =============================================================================

def stage_3_heading_validation(paragraphs: list[dict]) -> PipelineResult:
    """
    Stage 3: Validate headings against expected patterns.
    This is where we will later plug in the Document Structure Contract.
    """
    issues: list[PipelineIssue] = []

    for para in paragraphs:
        text = para["text"]

        # Check Part headings
        if text.startswith("Part "):
            if not parse_part_heading(text):
                issues.append(PipelineIssue(
                    stage="heading_validation",
                    severity="warning",
                    code="NON_STANDARD_PART_HEADING",
                    message=f"Part heading does not match expected pattern: '{text}'",
                    context={"text": text}
                ))

        # Check section headings that look numbered but fail parsing
        if re.match(r"^\d", text) and not parse_section_heading(text)[0]:
            issues.append(PipelineIssue(
                stage="heading_validation",
                severity="warning",
                code="UNEXPECTED_SECTION_FORMAT",
                message=f"Text starts with number but failed section parsing: '{text}'",
                context={"text": text}
            ))

    success = not any(i.severity == "error" for i in issues)

    return PipelineResult(
        stage="3_heading_validation",
        success=success,
        data=paragraphs,
        issues=issues
    )


# =============================================================================
# STAGE 4: Editorial Placeholder & Draft Detection
# =============================================================================

PLACEHOLDER_KEYWORDS = [
    "draft", "instruction", "todo", "fixme", "placeholder",
    "chicago author-date", "author-date format", "insert here"
]

def stage_4_placeholder_detection(paragraphs: list[dict]) -> PipelineResult:
    """
    Stage 4: Detect leftover editorial notes, drafts, and common placeholders.
    This directly addresses many of the warnings we saw during v117.2 compile.
    """
    issues: list[PipelineIssue] = []

    for para in paragraphs:
        text_lower = para["text"].lower()
        for keyword in PLACEHOLDER_KEYWORDS:
            if keyword in text_lower:
                issues.append(PipelineIssue(
                    stage="placeholder_detection",
                    severity="warning",
                    code="EDITORIAL_PLACEHOLDER",
                    message=f"Potential editorial placeholder detected: '{keyword}'",
                    context={"text": para["text"][:120]}
                ))
                break  # avoid duplicate warnings for same paragraph

    success = not any(i.severity == "error" for i in issues)

    return PipelineResult(
        stage="4_placeholder_detection",
        success=success,
        data=paragraphs,
        issues=issues
    )


# =============================================================================
# STAGE 5: List & Formatting Integrity Check
# =============================================================================

def stage_5_formatting_integrity(paragraphs: list[dict]) -> PipelineResult:
    """
    Stage 5: Detect common formatting problems that often appear after
    heavy Word + AI editing (merged list entries, broken bold chains, etc.).
    """
    issues: list[PipelineIssue] = []

    for para in paragraphs:
        text = para["text"]
        # Very rough heuristic: many consecutive <strong> tags often indicate merged list items
        strong_count = text.lower().count("<strong>")
        if strong_count >= 5:
            issues.append(PipelineIssue(
                stage="formatting_integrity",
                severity="warning",
                code="POSSIBLE_MERGED_LIST",
                message=f"Paragraph has {strong_count} <strong> tags. Possible merged list or broken formatting.",
                context={"text": text[:150]}
            ))

    success = not any(i.severity == "error" for i in issues)

    return PipelineResult(
        stage="5_formatting_integrity",
        success=success,
        data=paragraphs,
        issues=issues
    )


# =============================================================================
# STAGE 6: Cross-Reference Validation (Basic)
# =============================================================================

def stage_6_cross_reference_validation(paragraphs: list[dict]) -> PipelineResult:
    """
    Stage 6: Basic cross-reference validation.
    Looks for patterns that look like section references (e.g. 1.2, 15.3, 3.4b)
    and checks if they appear as actual headings in the document.

    This is a lightweight version. A more powerful version would run after
    parts are fully built.
    """
    issues: list[PipelineIssue] = []

    # Collect all potential section IDs from headings
    known_ids = set()
    for para in paragraphs:
        text = para["text"]
        match = re.match(r"^([0-9]+(?:\.[0-9A-Za-z-]+)*)", text)
        if match:
            known_ids.add(match.group(1))

    # Look for references in body text
    ref_pattern = re.compile(r"\b(\d+(?:\.\d+[A-Za-z]?)*)\b")

    for para in paragraphs:
        text = para["text"]
        # Skip obvious headings
        if re.match(r"^(\d+|Part |Preface|Coda|Bibliography)", text):
            continue

        for match in ref_pattern.finditer(text):
            ref = match.group(1)
            # Only flag references that look like real section numbers
            if "." in ref and ref not in known_ids:
                # Avoid false positives on years, decimals, etc.
                if len(ref) > 2 and not re.match(r"^\d{4}$", ref):
                    issues.append(PipelineIssue(
                        stage="cross_reference_validation",
                        severity="warning",
                        code="POSSIBLE_BROKEN_XREF",
                        message=f"Possible broken cross-reference: '{ref}' not found as heading.",
                        context={"text": text[:120]}
                    ))

    success = not any(i.severity == "error" for i in issues)

    return PipelineResult(
        stage="6_cross_reference_validation",
        success=success,
        data=paragraphs,
        issues=issues
    )


# =============================================================================
# Main Orchestrator (for now)
# =============================================================================

def run_staged_import(docx_path: Path, verbose: bool = True) -> ImportReport:
    """
    Run the full staged import pipeline.
    This is the new recommended entry point for importing.
    """
    stages: list[PipelineResult] = []

    # Stage 1
    r1 = stage_1_extract_paragraphs(docx_path)
    stages.append(r1)
    if verbose:
        print(f"[Stage 1] Extraction: {'OK' if r1.success else 'FAILED'} | Issues: {len(r1.issues)}")

    if not r1.success:
        return ImportReport(overall_success=False, stages=stages)

    paragraphs = r1.data

    # Stage 2
    r2 = stage_2_structural_sanity_check(paragraphs)
    stages.append(r2)
    if verbose:
        print(f"[Stage 2] Structural Sanity: {'OK' if r2.success else 'FAILED'} | Issues: {len(r2.issues)}")

    if r2.has_errors():
        return ImportReport(overall_success=False, stages=stages)

    # Stage 3
    r3 = stage_3_heading_validation(paragraphs)
    stages.append(r3)
    if verbose:
        print(f"[Stage 3] Heading Validation: {'OK' if r3.success else 'FAILED'} | Issues: {len(r3.issues)}")

    # Stage 4 - Editorial placeholders
    r4 = stage_4_placeholder_detection(paragraphs)
    stages.append(r4)
    if verbose:
        print(f"[Stage 4] Placeholder Detection: {'OK' if r4.success else 'FAILED'} | Issues: {len(r4.issues)}")

    # Stage 5 - Formatting integrity
    r5 = stage_5_formatting_integrity(paragraphs)
    stages.append(r5)
    if verbose:
        print(f"[Stage 5] Formatting Integrity: {'OK' if r5.success else 'FAILED'} | Issues: {len(r5.issues)}")

    # Stage 6 - Cross-reference validation
    r6 = stage_6_cross_reference_validation(paragraphs)
    stages.append(r6)
    if verbose:
        print(f"[Stage 6] Cross-Reference Validation: {'OK' if r6.success else 'FAILED'} | Issues: {len(r6.issues)}")

    # Note: Full transformation to JSON parts still happens in the original importer for now.
    # These stages are meant to run as pre-checks or post-checks.

    overall_success = all(s.success for s in stages)
    total_errors = sum(1 for s in stages for i in s.issues if i.severity == "error")
    total_warnings = sum(1 for s in stages for i in s.issues if i.severity == "warning")

    return ImportReport(
        overall_success=overall_success,
        stages=stages,
        total_errors=total_errors,
        total_warnings=total_warnings
    )


if __name__ == "__main__":
    # Simple manual test
    import sys
    if len(sys.argv) > 1:
        path = Path(sys.argv[1])
        report = run_staged_import(path)
        print("\n" + report.summary())
    else:
        print("Usage: python docx_import_pipeline.py <path-to-docx>")
