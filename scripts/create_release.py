# -*- coding: utf-8 -*-
"""Buat GitHub Release PMN dengan aset PDF/MD via GitHub CLI (gh).

Tag dan aset diderivasi otomatis dari data/version.json (ditulis importer dari
nama DOCX) dan isi dist/ — tidak ada input CLI yang mengalir ke subprocess.
Catatan: argumen baris perintah diabaikan; 00_PMN_WORKSPACE.bat tetap kompatibel.

Catatan PDF: kalau PDF versi terkini tidak ada (mis. konversi Word gagal),
release tetap dibuat dengan aset Markdown saja — tanpa PDF.
"""
import json
import os
import subprocess


def _resolve_release_inputs():
    """Derivasi tag + aset dari artefak build, bukan dari input eksternal."""
    with open(os.path.join("data", "version.json"), encoding="utf-8") as f:
        tag = json.load(f)["version"]
    pdf = os.path.join("dist", f"PMN_Framework_{tag}.pdf")
    md = os.path.join("dist", f"PMN_Framework_{tag}.md")
    if not os.path.isfile(md):
        raise FileNotFoundError(f"aset Markdown tidak ditemukan: {md}")
    if not os.path.isfile(pdf):
        print(f"[WARN] PDF belum tersedia ({pdf}) — release dibuat tanpa aset PDF.")
        pdf = None
    return tag, pdf, md


def _find_gh():
    """Lokasi gh.exe: PATH dulu, lalu lokasi instalasi standar."""
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
        return "gh"
    except (subprocess.CalledProcessError, FileNotFoundError):
        for path in (
            r"C:\Program Files\GitHub CLI\gh.exe",
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "GitHub CLI", "gh.exe"),
        ):
            if os.path.exists(path):
                return path
    return None


def create_github_release(tag_name, pdf_path, md_path):
    print(f"[*] Creating GitHub Release for tag: {tag_name}...")

    gh_path = _find_gh()
    if gh_path is None:
        print("[ERROR] GitHub CLI (gh) not found. Please install it to use automated releases.")
        return False

    assets = [pdf_path] if pdf_path else []
    try:
        # argv list literal — tanpa shell; --generate-notes membuat changelog
        subprocess.run([
            gh_path, "release", "create", tag_name,
            "--title", f"PMN Framework {tag_name}",
            "--generate-notes",
            *assets, md_path,
        ], check=True)
        print(f"[v] GitHub Release {tag_name} created and assets uploaded successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to create GitHub release: {e}")
        return False


if __name__ == "__main__":
    try:
        tag, pdf, md = _resolve_release_inputs()
    except (FileNotFoundError, KeyError, json.JSONDecodeError) as exc:
        print(f"[ERROR] Input release tidak lengkap: {exc}")
        raise SystemExit(1)
    if not create_github_release(tag, pdf, md):
        raise SystemExit(1)
