#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_ledger.py — Buku besar audit per paragraf. Pengungkit hemat terbesar.

Masalah yang diselesaikan: hard-read v118.2 membaca 3.407 paragraf. Antara
v118.1 dan v118.2 hanya 13 paragraf yang berubah. Tanpa catatan, audit
berikutnya membaca 3.408 lagi — mengulang pekerjaan yang hasilnya sudah
diketahui, dengan biaya penuh.

Buku besar ini menyimpan sidik jari isi tiap paragraf beserta hasil auditnya.
Di versi berikutnya, yang perlu dibaca hanyalah paragraf yang sidik jarinya
berubah, plus yang memang belum pernah diaudit.

Bedanya dengan pmn_diff.py: diff membandingkan DUA versi. Buku besar menyimpan
keadaan KUMULATIF — paragraf yang diaudit di v118.2 tetap tercatat teraudit di
v118.5, selama isinya tidak berubah.

Yang TIDAK disimpan: teks paragraf. Hanya hash. Berkasnya kecil dan tidak
menggandakan naskah.

Pakai:
    python pmn_ledger.py status v118.2       # berapa teraudit / basi / belum
    python pmn_ledger.py pending v118.2      # daftar yang perlu dibaca
    python pmn_ledger.py mark v118.2 --all --catatan "hard-read lengkap"
    python pmn_ledger.py mark v118.2 --para 3367D0F0 --vonis perlu-perbaikan
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
from datetime import date
from pathlib import Path

import pmn_docx as P

# Buku besar tinggal di private/: ia keadaan kerja, bukan bagian aplikasi.
# Bisa dibangun ulang kapan saja dengan `mark`, jadi tidak fatal kalau hilang.
BERKAS = Path(__file__).resolve().parents[3] / "private" / "docs" / "ledger.json"


def sidik(teks: str) -> str:
    """Sidik jari isi paragraf, kebal beda spasi/baris."""
    return hashlib.sha256(" ".join(teks.split()).encode("utf-8")).hexdigest()[:16]


def muat() -> dict:
    if BERKAS.exists():
        return json.loads(BERKAS.read_text(encoding="utf-8"))
    return {"versi_berkas": 1, "paragraf": {}}


def simpan(data: dict) -> None:
    BERKAS.parent.mkdir(parents=True, exist_ok=True)
    BERKAS.write_text(
        json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True), encoding="utf-8"
    )


def klasifikasi(doc: P.Doc, buku: dict) -> dict[str, list[P.Para]]:
    """Bagi paragraf jadi: teraudit / basi / belum-pernah."""
    catatan = buku["paragraf"]
    hasil: dict[str, list[P.Para]] = {"teraudit": [], "basi": [], "belum": []}
    for p in doc.body():
        if p.kind == "toc":
            continue
        c = catatan.get(p.para_id)
        if c is None:
            hasil["belum"].append(p)
        elif c.get("sidik") != sidik(p.text):
            hasil["basi"].append(p)
        else:
            hasil["teraudit"].append(p)
    return hasil


def cmd_status(doc: P.Doc, buku: dict) -> int:
    h = klasifikasi(doc, buku)
    total = sum(len(v) for v in h.values())
    print("=" * 72)
    print(f"  buku besar audit — {doc.path.name}")
    print("=" * 72)
    for label, warna in (("teraudit", "\033[92m"), ("basi", "\033[93m"), ("belum", "\033[91m")):
        n = len(h[label])
        persen = (n / total * 100) if total else 0
        print(f"  {warna}{label:<10}\033[0m {n:>5}  ({persen:5.1f}%)")
    perlu = len(h["basi"]) + len(h["belum"])
    print("-" * 72)
    print(f"  perlu dibaca: {perlu} dari {total} paragraf", end="")
    if total and perlu < total:
        print(f"  —  hemat {100 - perlu / total * 100:.1f}%")
    else:
        print()
    print("=" * 72)
    if not buku["paragraf"]:
        print("\n  Buku besar masih kosong. Setelah satu audit menyeluruh, catat dengan:")
        print(f"    python pmn_ledger.py mark {doc.path.name} --all --catatan \"...\"")
    return 0


def cmd_pending(doc: P.Doc, buku: dict, batas: int) -> int:
    h = klasifikasi(doc, buku)
    perlu = h["basi"] + h["belum"]
    perlu.sort(key=lambda p: p.index)
    if not perlu:
        print("Tidak ada yang perlu dibaca — semua paragraf teraudit dan tidak berubah.")
        return 0
    print(f"# {len(perlu)} paragraf perlu dibaca ({len(h['basi'])} basi, {len(h['belum'])} belum pernah)\n")
    for p in perlu[:batas]:
        catatan = buku["paragraf"].get(p.para_id, {})
        tanda = f"basi sejak {catatan.get('versi', '?')}" if catatan else "belum pernah"
        lok = f"{p.part} §{p.section}" if p.section else p.part
        print(f"[{p.para_id}] idx={p.index}  {lok}  ({tanda})")
        print(f"    {p.preview(96)}")
    if len(perlu) > batas:
        print(f"\n… {len(perlu) - batas} lagi. Pakai --batas untuk menampilkan lebih banyak.")
    return 0


def cmd_mark(doc: P.Doc, buku: dict, args) -> int:
    if not args.all and not args.para:
        print("Sebutkan --all atau --para <paraId> [<paraId> ...]", file=sys.stderr)
        return 1

    sasaran = (
        [p for p in doc.body() if p.kind != "toc"]
        if args.all
        else [p for p in doc.paras if p.para_id in {x.upper() for x in args.para}]
    )
    if not sasaran:
        print("Tidak ada paragraf yang cocok.", file=sys.stderr)
        return 1

    versi = doc.path.stem.split("_v")[-1]
    for p in sasaran:
        buku["paragraf"][p.para_id] = {
            "sidik": sidik(p.text),
            "versi": f"v{versi}",
            "tanggal": date.today().isoformat(),
            "vonis": args.vonis,
            "catatan": args.catatan or "",
            "seksi": p.section,
        }
    simpan(buku)
    print(f"Tercatat {len(sasaran)} paragraf sebagai '{args.vonis}' pada v{versi}.")
    print(f"Buku besar: {BERKAS}")
    return 0


def main() -> int:
    ap = argparse.ArgumentParser(description="Buku besar audit paragraf PMN.")
    sub = ap.add_subparsers(dest="perintah", required=True)

    for nama in ("status", "pending", "mark"):
        s = sub.add_parser(nama)
        s.add_argument("versi", nargs="?", default="v118.2")
        if nama == "pending":
            s.add_argument("--batas", type=int, default=40)
        if nama == "mark":
            s.add_argument("--all", action="store_true", help="tandai seluruh paragraf")
            s.add_argument("--para", nargs="+", help="paraId tertentu")
            s.add_argument("--vonis", default="bersih",
                           help="bersih | perlu-perbaikan | ditunda")
            s.add_argument("--catatan", help="konteks singkat")

    args = ap.parse_args()
    P.stdout_utf8()
    doc = P.load(P.resolve(args.versi))
    buku = muat()

    if args.perintah == "status":
        return cmd_status(doc, buku)
    if args.perintah == "pending":
        return cmd_pending(doc, buku, args.batas)
    return cmd_mark(doc, buku, args)


if __name__ == "__main__":
    sys.exit(main())
