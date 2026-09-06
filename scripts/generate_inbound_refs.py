# -*- coding: utf-8 -*-
"""Generator matriks rujukan silang masuk (ci.json) dan keluar (rel.json) untuk PMN.

Memakai pola regex persis dari alat_graf_rujukan.py:
    POLA = r"\b(\d{1,2}\.\d{1,2}[a-z]?(?:-[ivx]+)?)\b"

Batas kata di kedua ujung menjamin seksi induk (mis. 3.4) tidak mencocoki
anak (mis. 3.4b), dan angka di akhir kalimat (mis. 10.11.) tertangkap dengan tepat.
"""
import glob
import html as H
import io
import json
import os
import re
import shutil
import sys
from collections import defaultdict

SCRIPTS_DIR = os.path.dirname(os.path.abspath(__file__))
PUBLIC_DIR = os.path.dirname(SCRIPTS_DIR)
DATA_DIR = os.path.join(PUBLIC_DIR, "data")
PARTS_DIR = os.path.join(DATA_DIR, "parts")
STATIC_DATA_DIR = os.path.join(PUBLIC_DIR, "public_static", "data")

POLA = re.compile(r"\b(\d{1,2}\.\d{1,2}[a-z]?(?:-[ivx]+)?)\b")


def teks(s):
    return H.unescape(re.sub(r"<[^>]+>", " ", s.get("html", "") or ""))


def muat():
    idx = {}
    for f in sorted(glob.glob(os.path.join(PARTS_DIR, "part_*.json"))):
        try:
            d = json.load(io.open(f, encoding="utf-8"))
        except Exception as e:
            print(f"LEWAT {os.path.basename(f)}: {e}", file=sys.stderr)
            continue
        if not isinstance(d, list):
            continue
        for s in d:
            if isinstance(s, dict) and "id" in s:
                idx[str(s["id"])] = s
    return idx


def bangun_graf(idx):
    masuk = defaultdict(set)
    keluar = defaultdict(set)
    for k, s in idx.items():
        t = teks(s)
        for m in POLA.findall(t):
            if m in idx and m != k:
                masuk[m].add(k)
                keluar[k].add(m)
    return masuk, keluar


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    idx = muat()
    if not idx:
        print(f"[ERROR] Tidak ada data di {PARTS_DIR}", file=sys.stderr)
        return 1

    masuk, keluar = bangun_graf(idx)

    ci_map = {k: sorted(masuk.get(k, ())) for k in sorted(idx)}
    rel_map = {k: sorted(keluar.get(k, ())) for k in sorted(idx)}

    # Tulis ke public/data/
    ci_path = os.path.join(DATA_DIR, "ci.json")
    rel_path = os.path.join(DATA_DIR, "rel.json")

    with open(ci_path, "w", encoding="utf-8") as f:
        json.dump(ci_map, f, ensure_ascii=False, indent=2)

    with open(rel_path, "w", encoding="utf-8") as f:
        json.dump(rel_map, f, ensure_ascii=False, indent=2)

    print(f"[OK] {ci_path} dan {rel_path} diperbarui ({len(ci_map)} seksi).")

    # Sinkronisasi ke public_static/data/
    if os.path.isdir(STATIC_DATA_DIR):
        shutil.copy2(ci_path, os.path.join(STATIC_DATA_DIR, "ci.json"))
        shutil.copy2(rel_path, os.path.join(STATIC_DATA_DIR, "rel.json"))
        print(f"[OK] Disinkronkan ke {STATIC_DATA_DIR}")

    # Verifikasi statistik
    nol_masuk = [k for k, v in ci_map.items() if len(v) == 0]
    print(f"Statistik: {len(ci_map)} seksi | Nol rujukan masuk: {len(nol_masuk)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())