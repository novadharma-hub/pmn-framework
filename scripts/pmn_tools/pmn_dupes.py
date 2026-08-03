#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_dupes.py — Cari pengulangan makna di seluruh naskah. Lokal, nol token AI.

Masalah yang diselesaikan: tiga dari empat keputusan editorial yang menunggu di
OPEN_ITEMS.md adalah jenis yang sama — materi yang sama ditulis dua atau tiga
kali di tempat berbeda:

  Decision B  5.6b / 5.6c    tiga pass kerangka empat-indikator yang sama
  Decision C  Part VII       tiga versi capture sequence
  Decision D  §3.9 vs Urban  dinamika demografi dibahas dua kali

Semuanya ditemukan dengan membaca 3.407 paragraf. Padahal duplikasi semantik
justru yang paling mudah dicari mesin: hitung vektor makna tiap paragraf sekali,
lalu bandingkan semuanya dengan semuanya. Di RTX 2050 hitungannya detik, dan
tidak ada satu token API pun yang terpakai.

Yang ini TIDAK bisa dilakukan: menilai apakah pengulangan itu disengaja.
Naskah PMN memang punya konvensi "Compressed Core" (§15.15) — menulis ulang
secara padat itu praktik sadar. Jadi keluarannya kandidat untuk dibaca, bukan
vonis.

Pakai:
    python pmn_dupes.py v118.2
    python pmn_dupes.py v118.2 --ambang 0.80 --jarak 30
    python pmn_dupes.py v118.2 --isi          # tampilkan cuplikan
    python pmn_dupes.py v118.2 --json
"""
from __future__ import annotations

import argparse
import json
import sys

import pmn_docx as P

MODEL = "sentence-transformers/all-MiniLM-L6-v2"

# Paragraf pendek (judul, label) selalu mirip satu sama lain tanpa berarti apa-apa.
MIN_KATA = 25

# Paragraf bertetangga secara alami mirip — prosa yang mengalir memang begitu.
# Tapi jangan terlalu galak: pengulangan Decision D (§3.9 youth-bulge dan aging
# population dibahas dua kali) berjarak hanya 7 paragraf. Filter 20 melewatkannya.
JARAK_MIN = 5

# Dikalibrasi terhadap v118.2 dengan jarak 5:
#   0.80 -> 72 pasangan   0.82 -> 31   0.85 -> 15
# 0.80 menangkap ketiga kasus yang sudah diketahui (Decision B, C, D) dengan
# jumlah yang masih terbaca sekali duduk.
AMBANG = 0.80


def muat_model(quiet: bool = False):
    from sentence_transformers import SentenceTransformer
    import torch

    perangkat = "cuda" if torch.cuda.is_available() else "cpu"
    if not quiet:
        nama = torch.cuda.get_device_name(0) if perangkat == "cuda" else "CPU"
        print(f"  model  : {MODEL}", file=sys.stderr)
        print(f"  hitung : {nama}", file=sys.stderr)
    return SentenceTransformer(MODEL, device=perangkat)


def cari(doc: P.Doc, ambang: float, jarak: int, min_kata: int, quiet: bool = False):
    """Balikkan pasangan paragraf berjauhan yang maknanya sangat mirip."""
    import torch

    kandidat = [
        p for p in doc.body()
        if p.kind == "body" and p.words >= min_kata
    ]
    if not quiet:
        print(f"  paragraf dibanding: {len(kandidat)} (dari {len(doc.body())})", file=sys.stderr)

    model = muat_model(quiet)
    vektor = model.encode(
        [" ".join(p.text.split()) for p in kandidat],
        batch_size=64,
        convert_to_tensor=True,
        normalize_embeddings=True,
        show_progress_bar=not quiet,
    )

    # Vektor sudah dinormalkan, jadi perkalian titik = kemiripan kosinus.
    mirip = vektor @ vektor.T
    mirip.fill_diagonal_(-1.0)
    # Ambil segitiga atas saja supaya tiap pasangan muncul sekali.
    mirip = torch.triu(mirip, diagonal=1)

    idx_a, idx_b = torch.where(mirip >= ambang)
    hasil = []
    for i, j in zip(idx_a.tolist(), idx_b.tolist()):
        pa, pb = kandidat[i], kandidat[j]
        if abs(pa.index - pb.index) < jarak:
            continue  # bertetangga: kemiripan wajar
        hasil.append({
            "skor": round(float(mirip[i, j]), 4),
            "a": {"para_id": pa.para_id, "idx": pa.index, "part": pa.part,
                  "seksi": pa.section, "teks": " ".join(pa.text.split())},
            "b": {"para_id": pb.para_id, "idx": pb.index, "part": pb.part,
                  "seksi": pb.section, "teks": " ".join(pb.text.split())},
        })
    hasil.sort(key=lambda r: -r["skor"])
    return hasil


def main() -> int:
    ap = argparse.ArgumentParser(description="Cari pengulangan makna di naskah PMN.")
    ap.add_argument("versi", nargs="?", default="v118.2")
    ap.add_argument("--ambang", type=float, default=AMBANG, help=f"kemiripan minimal (default {AMBANG})")
    ap.add_argument("--jarak", type=int, default=JARAK_MIN, help=f"jarak paragraf minimal (default {JARAK_MIN})")
    ap.add_argument("--min-kata", type=int, default=MIN_KATA)
    ap.add_argument("--batas", type=int, default=25)
    ap.add_argument("--isi", action="store_true", help="tampilkan cuplikan teks")
    ap.add_argument("--json", action="store_true")
    args = ap.parse_args()

    P.stdout_utf8()
    doc = P.load(P.resolve(args.versi))
    hasil = cari(doc, args.ambang, args.jarak, args.min_kata, quiet=args.json)

    if args.json:
        print(json.dumps({"berkas": doc.path.name, "ambang": args.ambang,
                          "pasangan": hasil}, ensure_ascii=False, indent=2))
        return 0

    print("\n" + "=" * 78)
    print(f"  pengulangan makna — {doc.path.name}")
    print(f"  ambang {args.ambang}, jarak minimal {args.jarak} paragraf")
    print("=" * 78)

    if not hasil:
        print("\n  Tidak ada pasangan di atas ambang. Turunkan --ambang untuk menyaring lebih longgar.")
        return 0

    print(f"\n  {len(hasil)} pasangan ditemukan\n")
    for r in hasil[:args.batas]:
        a, b = r["a"], r["b"]
        la = f"{a['part']} §{a['seksi']}" if a["seksi"] else a["part"]
        lb = f"{b['part']} §{b['seksi']}" if b["seksi"] else b["part"]
        print(f"  \033[93m{r['skor']:.3f}\033[0m  {la}  [{a['para_id']}] idx={a['idx']}")
        print(f"         {lb}  [{b['para_id']}] idx={b['idx']}")
        if args.isi:
            print(f"           A: {a['teks'][:150]}…")
            print(f"           B: {b['teks'][:150]}…")
        print()

    if len(hasil) > args.batas:
        print(f"  … {len(hasil) - args.batas} pasangan lagi (--batas untuk lebih banyak)\n")

    print("=" * 78)
    print("  Ini kandidat, bukan vonis. Dua sumber positif palsu yang wajar:")
    print("   - Konvensi ringkasan padat (§15.15 'The Compressed Core') memang disengaja.")
    print("   - Paralelisme struktural: §10.7b/c/d masing-masing menerapkan analisis")
    print("     yang sama pada tradisi politik berbeda, jadi saling mirip secara sah.")
    print("=" * 78)
    return 0


if __name__ == "__main__":
    sys.exit(main())
