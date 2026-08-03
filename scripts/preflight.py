#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
preflight.py — Periksa semua prasyarat SEBELUM pipeline rilis dijalankan.

Alasan berkas ini ada: pada rilis v118.2, `requirements.txt` tersimpan sebagai
UTF-16 sehingga pip tidak bisa membacanya. Akibatnya `pywin32` tak pernah
terpasang, konversi DOCX->PDF gagal -- dan karena `00_PMN_WORKSPACE.bat`
memperlakukan kegagalan PDF sebagai WARNING, pipeline tetap berjalan sampai
selesai dan menghasilkan rilis tanpa PDF. Tidak ada yang berteriak.

Prinsipnya: gagal di depan dengan pesan jelas, bukan gagal separuh jalan
dengan artefak yang tampak lengkap.

Keluar dengan kode 1 kalau ada masalah yang membatalkan rilis.
Peringatan yang tidak fatal keluar dengan kode 0.

Pakai:
    python scripts/preflight.py                       # periksa semuanya
    python scripts/preflight.py --docx <nama.docx>    # + validasi nama berkas
"""
from __future__ import annotations

import argparse
import importlib
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

# Nama DOCX yang benar. Garis bawah sebagai pemisah versi (v118_2) membuat
# 00_PMN_WORKSPACE.bat:174 menghasilkan VERSION_TAG "v118_2" -- dan penjaga
# findstr di baris 177 tetap meloloskannya, jadi gagalnya senyap.
RE_DOCX_NAME = re.compile(r"^PMN_Framework_v\d+(?:\.\d+)*\.docx$", re.IGNORECASE)

# modul -> (nama paket pip, untuk apa, fatal?)
MODULES = {
    "docx":            ("python-docx",   "membaca naskah DOCX",              True),
    "lxml":            ("lxml",          "parser XML untuk python-docx",     True),
    "pypdf":           ("pypdf",         "membersihkan metadata PDF",        True),
    "requests":        ("requests",      "strip_metadata_and_backup.py",     True),
    "win32com.client": ("pywin32",       "konversi DOCX->PDF via MS Word",   True),
    "dotenv":          ("python-dotenv", "membaca .env",                     False),
}

GREEN, YELLOW, RED, DIM, RESET = "\033[92m", "\033[93m", "\033[91m", "\033[90m", "\033[0m"

problems: list[str] = []
warnings: list[str] = []


def ok(msg: str) -> None:
    print(f"  {GREEN}[v]{RESET} {msg}")


def fail(msg: str, fix: str) -> None:
    print(f"  {RED}[X]{RESET} {msg}")
    print(f"      {DIM}-> {fix}{RESET}")
    problems.append(msg)


def warn(msg: str, fix: str) -> None:
    print(f"  {YELLOW}[!]{RESET} {msg}")
    print(f"      {DIM}-> {fix}{RESET}")
    warnings.append(msg)


def check_modules() -> None:
    print("\n[1/5] Modul Python")
    for module, (package, purpose, fatal) in MODULES.items():
        try:
            importlib.import_module(module)
            ok(f"{module:<18} ({purpose})")
        except ImportError:
            msg = f"{module} tidak ada -- {purpose} akan gagal"
            fix = f"pip install {package}   (atau: pip install -r requirements.txt)"
            (fail if fatal else warn)(msg, fix)


def check_requirements_encoding() -> None:
    """requirements.txt UTF-16 terbaca sebagai sampah oleh pip -- inilah akar v118.2."""
    print("\n[2/5] requirements.txt")
    req = Path(__file__).resolve().parents[2] / "requirements.txt"
    if not req.exists():
        warn("requirements.txt tidak ditemukan", f"seharusnya di {req}")
        return
    raw = req.read_bytes()
    if raw.startswith((b"\xff\xfe", b"\xfe\xff")):
        fail(
            "requirements.txt ber-encoding UTF-16 -- pip TIDAK bisa membacanya",
            "simpan ulang sebagai UTF-8 tanpa BOM",
        )
    elif raw.startswith(b"\xef\xbb\xbf"):
        warn("requirements.txt punya BOM UTF-8", "simpan tanpa BOM agar aman")
    else:
        ok("encoding UTF-8, terbaca pip")


def check_word() -> None:
    """Konversi PDF memakai otomasi COM -- butuh MS Word betulan terpasang."""
    print("\n[3/5] MS Word (untuk konversi PDF)")
    try:
        import win32com.client  # noqa: F401
    except ImportError:
        return  # sudah dilaporkan di langkah 1
    try:
        word = win32com.client.Dispatch("Word.Application")
        version = word.Version
        word.Quit()
        ok(f"MS Word {version} tersedia")
    except Exception as exc:
        fail(
            f"MS Word tidak bisa dijalankan: {exc}",
            "pasang MS Word, atau lewati PDF dan unggah manual",
        )


def check_gh() -> None:
    print("\n[4/5] GitHub CLI (untuk membuat Release)")
    gh = shutil.which("gh") or next(
        (p for p in (
            r"C:\Program Files\GitHub CLI\gh.exe",
            os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "GitHub CLI", "gh.exe"),
        ) if os.path.exists(p)),
        None,
    )
    if not gh:
        warn("gh tidak ditemukan", "pasang GitHub CLI, atau buat Release manual")
        return
    try:
        res = subprocess.run([gh, "auth", "status"], capture_output=True, text=True, timeout=30)
        if res.returncode == 0:
            account = next(
                (l.split("account")[-1].strip().split()[0]
                 for l in (res.stdout + res.stderr).splitlines() if "Logged in" in l),
                "?",
            )
            ok(f"gh terautentikasi (akun {account})")
        else:
            warn("gh belum login", "jalankan: gh auth login")
    except Exception as exc:
        warn(f"status gh tidak terbaca: {exc}", "cek manual: gh auth status")


def check_docx_name(name: str | None) -> None:
    print("\n[5/5] Nama berkas DOCX")
    if not name:
        print(f"  {DIM}(dilewati -- tidak ada --docx){RESET}")
        return
    base = os.path.basename(name)
    if RE_DOCX_NAME.match(base):
        tag = "v" + base.split("_v")[-1][: -len(".docx")]
        ok(f"{base}  ->  VERSION_TAG = {tag}")
        return
    salah = base.replace(".docx", "").split("_v")[-1]
    benar = salah.replace("_", ".")
    fail(
        f"'{base}' akan menghasilkan VERSION_TAG yang salah",
        f"ganti nama jadi PMN_Framework_v{benar}.docx  "
        f"(pakai TITIK, bukan garis bawah -- penjaga di .bat tidak menangkap ini)",
    )


def _enable_ansi_windows() -> None:
    """Nyalakan pemrosesan escape ANSI di console Windows lama.

    Lewat API kernel32 langsung, bukan os.system("") -- idiom itu memanggil
    shell tanpa alasan.
    """
    import ctypes

    kernel32 = ctypes.windll.kernel32
    handle = kernel32.GetStdHandle(-11)  # STD_OUTPUT_HANDLE
    mode = ctypes.c_uint32()
    if kernel32.GetConsoleMode(handle, ctypes.byref(mode)):
        kernel32.SetConsoleMode(handle, mode.value | 0x0004)  # VIRTUAL_TERMINAL_PROCESSING


def main() -> int:
    ap = argparse.ArgumentParser(description="Periksa prasyarat pipeline rilis PMN.")
    ap.add_argument("--docx", help="Nama berkas DOCX yang akan diimpor")
    args = ap.parse_args()

    if sys.platform.startswith("win"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            _enable_ansi_windows()
        except Exception:
            pass

    print("=" * 68)
    print("  PREFLIGHT — prasyarat pipeline rilis PMN")
    print("=" * 68)

    check_modules()
    check_requirements_encoding()
    check_word()
    check_gh()
    check_docx_name(args.docx)

    print("\n" + "=" * 68)
    if problems:
        print(f"  {RED}GAGAL — {len(problems)} masalah harus dibereskan dulu:{RESET}")
        for p in problems:
            print(f"    - {p}")
        print(f"\n  {DIM}Rilis dibatalkan. Perbaiki di atas, lalu jalankan lagi.{RESET}")
        print("=" * 68)
        return 1

    if warnings:
        print(f"  {YELLOW}LOLOS dengan {len(warnings)} peringatan{RESET} — rilis bisa lanjut,")
        print(f"  {DIM}tapi bagian yang diperingatkan mungkin perlu dikerjakan manual.{RESET}")
    else:
        print(f"  {GREEN}SEMUA PRASYARAT TERPENUHI{RESET}")
    print("=" * 68)
    return 0


if __name__ == "__main__":
    sys.exit(main())
