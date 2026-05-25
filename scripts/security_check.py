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
    return path.relative_to(ROOT).as_posix()


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


def check_docx_metadata() -> list[str]:
    findings: list[str] = []
    
    # Resolusi jalur dinamis untuk pmn-workspace
    private_docx_dir = ROOT.parent / "private" / "docx_source"
    if not private_docx_dir.exists() and os.path.exists(r"D:\pmn-workspace\private\docx_source"):
        private_docx_dir = Path(r"D:\pmn-workspace\private\docx_source")
        
    paths = list((ROOT / "docs").glob("*.docx")) + list((ROOT / "docx_source").glob("*.docx"))
    if private_docx_dir.exists():
        paths += list(private_docx_dir.glob("*.docx"))
        
    personal_re = re.compile(r"\b(ali\s+ikhsan|ali|ikhsan)\b", re.IGNORECASE)
    for path in paths:
        try:
            with zipfile.ZipFile(path) as archive:
                for xml_name in ("docProps/core.xml", "docProps/app.xml"):
                    if xml_name not in archive.namelist():
                        continue
                    text = archive.read(xml_name).decode("utf-8", errors="ignore")
                    if personal_re.search(text):
                        findings.append(f"{rel(path)}: personal term found in {xml_name}")
        except (OSError, zipfile.BadZipFile) as exc:
            findings.append(f"{rel(path)}: could not inspect DOCX metadata ({exc})")
    return findings


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


def check_ignore_contract() -> list[str]:
    ignore_path = ROOT / ".gitignore"
    text = ignore_path.read_text(encoding="utf-8", errors="ignore") if ignore_path.exists() else ""
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
    checks = {
        "Possible secrets/config references": check_secret_patterns(),
        "Tracked Python cache files": check_tracked_cache(),
        "DOCX metadata personal terms": check_docx_metadata(),
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

    print("=" * 68)
    if failed:
        print("Security check completed with warnings. Review before public push.")
        return 1

    print("Security check passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
