#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_diff.py — Bandingkan dua versi naskah di level paragraf. Nol token AI.

Diff biasa membandingkan baris; itu tidak berguna untuk DOCX karena satu
paragraf adalah satu baris raksasa dan pergeseran kecil menghasilkan laporan
yang tak terbaca.

Perkakas ini membandingkan lewat **paraId** (atribut w14:paraId milik Word),
pengenal yang bertahan lintas versi selama paragrafnya tidak dihapus dan
dibuat ulang. Jadi "berubah", "ditambah", "dihapus", dan "dipindah" bisa
dibedakan dengan tepat — bukan ditebak dari kemiripan teks.

Gunanya dua:
  1. Verifikasi rilis — hasilnya harus cocok satu-satu dengan changelog.
     Kalau changelog bilang 12 paragraf berubah tapi diff menemukan 15,
     ada tiga perubahan yang tidak disengaja.
  2. Bahan buku besar hash — hanya paragraf yang berubah yang perlu
     dibaca ulang di audit berikutnya.

Pakai:
    python pmn_diff.py v118.1 v118.2
    python pmn_diff.py v118.1 v118.2 --isi      # tampilkan teks sebelum/sesudah
    python pmn_diff.py v118.1 v118.2 --json
"""
from __future__ import annotations

import argparse
import difflib
import json
import sys
from dataclasses import dataclass, asdict

import pmn_docx as P


@dataclass
class Perubahan:
    jenis: str        # "berubah" | "ditambah" | "dihapus" | "dipindah"
    para_id: str
    seksi: str
    part: str
    sebelum: str = ""
    sesudah: str = ""
    idx_lama: int = -1
    idx_baru: int = -1


def _rapikan(teks: str) -> str:
    return " ".join(teks.split())


def bandingkan(lama: P.Doc, baru: P.Doc, ambang_pindah: int = 3) -> list[Perubahan]:
    """Bandingkan dua dokumen lewat paraId.

    `ambang_pindah` mencegah banjir laporan: menambah satu paragraf di awal
    menggeser indeks semua paragraf sesudahnya. Yang dilaporkan "dipindah"
    hanya yang bergeser melebihi pergeseran wajar akibat sisipan.
    """
    peta_lama = {p.para_id: p for p in lama.paras if p.para_id}
    peta_baru = {p.para_id: p for p in baru.paras if p.para_id}

    out: list[Perubahan] = []

    for pid, p_baru in peta_baru.items():
        p_lama = peta_lama.get(pid)
        if p_lama is None:
            out.append(Perubahan(
                "ditambah", pid, p_baru.section, p_baru.part,
                sesudah=_rapikan(p_baru.text), idx_baru=p_baru.index,
            ))
            continue
        t_lama, t_baru = _rapikan(p_lama.text), _rapikan(p_baru.text)
        if t_lama != t_baru:
            out.append(Perubahan(
                "berubah", pid, p_baru.section, p_baru.part,
                sebelum=t_lama, sesudah=t_baru,
                idx_lama=p_lama.index, idx_baru=p_baru.index,
            ))

    for pid, p_lama in peta_lama.items():
        if pid not in peta_baru:
            out.append(Perubahan(
                "dihapus", pid, p_lama.section, p_lama.part,
                sebelum=_rapikan(p_lama.text), idx_lama=p_lama.index,
            ))

    # Pergeseran dasar akibat sisipan/hapusan sebelum paragraf ini
    geser_dasar = len(baru.paras) - len(lama.paras)
    for pid, p_baru in peta_baru.items():
        p_lama = peta_lama.get(pid)
        if p_lama is None or _rapikan(p_lama.text) != _rapikan(p_baru.text):
            continue
        geser = (p_baru.index - p_lama.index) - geser_dasar
        if abs(geser) > ambang_pindah:
            out.append(Perubahan(
                "dipindah", pid, p_baru.section, p_baru.part,
                idx_lama=p_lama.index, idx_baru=p_baru.index,
            ))

    urut = {"berubah": 0, "ditambah": 1, "dihapus": 2, "dipindah": 3}
    out.sort(key=lambda c: (urut[c.jenis], c.idx_baru if c.idx_baru >= 0 else c.idx_lama))
    return out


def cetak_beda_kata(sebelum: str, sesudah: str, lebar: int = 100) -> None:
    """Tampilkan hanya bagian yang berubah, bukan seluruh paragraf."""
    a, b = sebelum.split(), sesudah.split()
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b).get_opcodes():
        if tag == "equal":
            continue
        kiri = " ".join(a[max(0, i1 - 6):i1])
        kanan = " ".join(b[j2:j2 + 6])
        hapus = " ".join(a[i1:i2])
        tambah = " ".join(b[j1:j2])
        print(f"      …{kiri}", end=" ")
        if hapus:
            print(f"\033[91m[-{hapus}]\033[0m", end=" ")
        if tambah:
            print(f"\033[92m[+{tambah}]\033[0m", end=" ")
        print(f"{kanan}…"[:lebar])


def main() -> int:
    ap = argparse.ArgumentParser(description="Bandingkan dua versi naskah PMN per paragraf.")
    ap.add_argument("lama", help="versi lama, mis. v118.1")
    ap.add_argument("baru", help="versi baru, mis. v118.2")
    ap.add_argument("--isi", action="store_true", help="tampilkan perubahan kata")
    ap.add_argument("--json", action="store_true", help="keluaran JSON")
    args = ap.parse_args()

    P.stdout_utf8()
    d_lama = P.load(P.resolve(args.lama))
    d_baru = P.load(P.resolve(args.baru))
    beda = bandingkan(d_lama, d_baru)

    if args.json:
        print(json.dumps({
            "lama": d_lama.path.name,
            "baru": d_baru.path.name,
            "paragraf_lama": len(d_lama.paras),
            "paragraf_baru": len(d_baru.paras),
            "perubahan": [asdict(c) for c in beda],
        }, ensure_ascii=False, indent=2))
        return 0

    hitung = {j: sum(1 for c in beda if c.jenis == j) for j in ("berubah", "ditambah", "dihapus", "dipindah")}

    print("=" * 76)
    print(f"  {d_lama.path.name}  ->  {d_baru.path.name}")
    print(f"  {len(d_lama.paras)} paragraf  ->  {len(d_baru.paras)} paragraf")
    print("=" * 76)
    print(f"  berubah {hitung['berubah']}   ditambah {hitung['ditambah']}   "
          f"dihapus {hitung['dihapus']}   dipindah {hitung['dipindah']}")

    warna = {"berubah": "\033[93m", "ditambah": "\033[92m",
             "dihapus": "\033[91m", "dipindah": "\033[96m"}
    jenis_kini = None
    for c in beda:
        if c.jenis != jenis_kini:
            jenis_kini = c.jenis
            print(f"\n{warna[c.jenis]}{c.jenis.upper()}\033[0m")
        lok = f"{c.part} §{c.seksi}" if c.seksi else c.part
        print(f"  [{c.para_id}] {lok}")
        if c.jenis == "dipindah":
            print(f"      idx {c.idx_lama} -> {c.idx_baru}")
        elif args.isi and c.jenis == "berubah":
            cetak_beda_kata(c.sebelum, c.sesudah)
        elif args.isi:
            teks = c.sesudah or c.sebelum
            print(f"      {teks[:150]}")

    print("\n" + "=" * 76)
    return 0


if __name__ == "__main__":
    sys.exit(main())
