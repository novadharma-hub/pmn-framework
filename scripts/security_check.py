# -*- coding: utf-8 -*-
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import zipfile
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

SECRET_ASSIGNMENT_RE = re.compile(
    r"\b(api[_-]?key|secret|token|password|passwd|bearer|authorization|"
    r"bot_token|chat_id|service_role)\b\s*[:=]",
    re.IGNORECASE,
)

SECRET_VALUE_RE = re.compile(
    r"(sk-[A-Za-z0-9_-]{20,}|AIza[0-9A-Za-z_-]{20,}|ghp_[0-9A-Za-z_]{20,}|"
    r"github_pat_[0-9A-Za-z_]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)",
    re.IGNORECASE,
)

EXCLUDED_DIRS = {
    ".git",
    "node_modules",
    "backups",
    "__pycache__",
    "dist",
}

EXCLUDED_FILES = {
    "index.html",
    "index.html.bak",
    "pmn_corpus_for_ai.md",
    "LENGKAPI_DIAGNOSIS_UNTUK_AI.md",
}

TEXT_EXTS = {
    ".bat",
    ".css",
    ".env",
    ".example",
    ".html",
    ".js",
    ".json",
    ".md",
    ".py",
    ".sql",
    ".txt",
    ".jsx",
    ".toml",
    ".yml",
    ".yaml",
}


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return os.path.relpath(path, ROOT).replace("\\", "/")


def run_git(args: list[str]) -> str:
    proc = subprocess.run(
        ["git", *args],
        cwd=ROOT,
        text=True,
        capture_output=True,
        encoding="utf-8",
        errors="replace",
    )
    return (proc.stdout + proc.stderr).strip()


def iter_text_files():
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        if any(part in EXCLUDED_DIRS for part in path.relative_to(ROOT).parts):
            continue
        if path.name in EXCLUDED_FILES:
            continue
        if path.suffix.lower() in {".docx", ".pdf", ".zip", ".png", ".jpg", ".jpeg", ".gif", ".ico", ".pyc"}:
            continue
        if path.suffix.lower() in TEXT_EXTS or path.name.startswith(".env"):
            yield path


def check_secret_patterns() -> list[str]:
    findings: list[str] = []
    for path in iter_text_files():
        try:
            lines = path.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        for number, line in enumerate(lines, start=1):
            if SECRET_ASSIGNMENT_RE.search(line) or SECRET_VALUE_RE.search(line):
                # Allow documented placeholder examples.
                lower = line.lower()
                if "your-" in lower or "placeholder" in lower:
                    continue
                if "env.get(" in line or "id-token: write" in lower:
                    continue
                if line.lstrip().startswith("def "):
                    continue
                if line.lstrip().startswith("if "):
                    continue
                findings.append(f"{rel(path)}:{number}: possible secret/config reference")
    return findings


def check_tracked_cache() -> list[str]:
    output = run_git(["ls-files"])
    bad = []
    for line in output.splitlines():
        if "__pycache__" in line or line.endswith(".pyc"):
            bad.append(line)
    return bad


def check_metadata_leaks() -> tuple[list[str], list[str]]:
    critical_findings: list[str] = []
    info_findings: list[str] = []
    
    private_dir = ROOT.parent / "private"
    if not private_dir.exists() and os.path.exists(r"D:\pmn-workspace\private"):
        private_dir = Path(r"D:\pmn-workspace\private")
        
    paths: list[Path] = []
    for ext in ("*.docx", "*.pdf"):
        paths.extend(ROOT.rglob(ext))
        if private_dir.exists():
            paths.extend(private_dir.glob(ext))
            for sub_folder in ("docx_source", "clean_outputs", "raw_inputs"):
                sub_path = private_dir / sub_folder
                if sub_path.exists():
                    paths.extend(sub_path.glob(ext))
                    
    unique_paths = []
    seen = set()
    for p in paths:
        try:
            resolved = p.resolve()
        except OSError:
            resolved = p
        if resolved not in seen:
            seen.add(resolved)
            unique_paths.append(resolved)
            
    personal_re = re.compile(r"\b(ali\s+ikhsan|ali|ikhsan)\b", re.IGNORECASE)
    
    for path in unique_paths:
        rel_str = rel(path)
        is_private = "private" in rel_str.lower() or "backup" in rel_str.lower()
        findings_list = info_findings if is_private else critical_findings
        
        ext = path.suffix.lower()
        if ext == ".docx":
            try:
                with zipfile.ZipFile(path) as archive:
                    for xml_name in ("docProps/core.xml", "docProps/app.xml"):
                        if xml_name not in archive.namelist():
                            continue
                        text = archive.read(xml_name).decode("utf-8", errors="ignore")
                        if personal_re.search(text):
                            findings_list.append(f"{rel_str}: personal term found in {xml_name}")
            except (OSError, zipfile.BadZipFile) as exc:
                findings_list.append(f"{rel_str}: could not inspect DOCX metadata ({exc})")
        elif ext == ".pdf":
            try:
                import pypdf
                reader = pypdf.PdfReader(path)
                meta = reader.metadata
                if meta:
                    for key, val in meta.items():
                        if personal_re.search(str(val)):
                            findings_list.append(f"{rel_str}: personal term found in PDF metadata [{key}]: {val}")
            except ImportError:
                try:
                    content = path.read_bytes()
                    for term in (b"ali", b"ikhsan"):
                        if term in content.lower():
                            findings_list.append(f"{rel_str}: potential personal term found in raw PDF content")
                            break
                except Exception as exc:
                    findings_list.append(f"{rel_str}: could not inspect PDF metadata ({exc})")
            except Exception as exc:
                findings_list.append(f"{rel_str}: could not inspect PDF metadata ({exc})")
                
    return critical_findings, info_findings


def check_json_validity() -> list[str]:
    findings: list[str] = []
    for path in [ROOT / "data", ROOT / "data" / "parts"]:
        if not path.exists():
            continue
        for json_path in path.glob("*.json"):
            try:
                json.loads(json_path.read_text(encoding="utf-8"))
            except Exception as exc:
                findings.append(f"{rel(json_path)}: invalid JSON ({exc})")
    return findings


def is_private_public_layout() -> bool:
    """Detect if we are running inside the recommended pmn-workspace layout.

    Handles two common cases:
    1. Running from the workspace public folder (direct)
    2. Running from the git repo junction (D:\\pmn-framework)
    """
    try:
        candidates = []

        # Case 1: Script is inside a 'public' folder
        if ROOT.name.lower() == "public":
            candidates.append(ROOT.parent / "private")

        # Case 2: Current ROOT might be the junction target (D:\pmn-framework)
        # Check if there is a known private sibling at workspace level
        # Try going up one level from ROOT
        candidates.append(ROOT.parent / "private")

        # Also check the classic D:\pmn-workspace location as fallback
        candidates.append(Path(r"D:\pmn-workspace\private"))

        for private_dir in candidates:
            if private_dir.exists():
                # Additional sanity: look for known private subfolders
                if (private_dir / "backups").exists() or (private_dir / "docs").exists():
                    return True
        return False
    except Exception:
        return False


def check_ignore_contract() -> list[str]:
    ignore_path = ROOT / ".gitignore"
    text = ignore_path.read_text(encoding="utf-8", errors="ignore") if ignore_path.exists() else ""

    if is_private_public_layout():
        # In the recommended private/public layout, many sensitive folders
        # (raw_inputs, backups, LENGKAPI_DIAGNOSIS, etc.) live in private/.
        # We only require the minimal set that should still be present in the
        # public .gitignore.
        required = [
            ".env",
            "__pycache__/",
            "*.pyc",
            "*.bak",           # Still good to ignore in public
            "index.html.bak",
        ]
    else:
        # Legacy single-folder mode: keep the original strict expectations
        required = [
            ".env",
            "docs/raw_inputs/",
            "docs/clean_outputs/",
            "backups/",
            "LENGKAPI_DIAGNOSIS_UNTUK_AI.md",
            "__pycache__/",
            "*.pyc",
        ]

    return [item for item in required if item not in text]


def main() -> int:
    crit_metadata, info_metadata = check_metadata_leaks()
    
    checks = {
        "Possible secrets/config references": check_secret_patterns(),
        "Tracked Python cache files": check_tracked_cache(),
        "Public metadata leaks (Critical)": crit_metadata,
        "Invalid JSON files": check_json_validity(),
        "Missing .gitignore rules": check_ignore_contract(),
    }

    print("=" * 68)
    print("PMN SECURITY CHECK")
    print("=" * 68)

    failed = False
    for name, findings in checks.items():
        if findings:
            failed = True
            print(f"\n[WARN] {name}: {len(findings)}")
            for item in findings[:20]:
                print(f"  - {item}")
            if len(findings) > 20:
                print(f"  ... {len(findings) - 20} more")
        else:
            print(f"[OK] {name}")

    if info_metadata:
        print(f"\n[INFO] Private metadata files (Safe / ignored): {len(info_metadata)}")
        for item in info_metadata[:10]:
            print(f"  - {item}")
        if len(info_metadata) > 10:
            print(f"  ... {len(info_metadata) - 10} more")

    print("=" * 68)
    if failed:
        print("Security check completed with warnings. Review before public push.")
        return 1

    print("Security check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
