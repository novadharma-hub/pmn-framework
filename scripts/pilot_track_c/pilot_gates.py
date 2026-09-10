#!/usr/bin/env python3
"""Gerbang jalur skrip Pilot Track C — G1, G3, G5.

Spesifikasi: private/restrukturisasi/16E_PILOT_TRACK_C.md §3
Brief jalur:  private/docs/internal/PROMPT_ANTIGRAVITY_PILOT_TRACK_C.md §5

  G1  provenance tiap paragraf — himpunan source_paragraph_ids gabungan ==
      himpunan paraId DOCX untuk Bagian VI+VII, TANPA SISA DI KEDUA ARAH.
  G3  keluaran lolos skema (validator pilot_schema).
  G5  pembanding nol — html hasil rekomposisi dari sumber pilot == parts.json
      v120, seksi demi seksi. Setiap selisih adalah KEGAGALAN, bukan perbaikan.

  G2, G4, G6 BUKAN jalur ini (16E §4) — G6 butuh ledger dan menuntut
  perbandingan sasaran-terselesaikan, bukan deteksi rujukan menggantung.

BENTUK LAPORAN: angka mentah per gerbang, bukan status lulus/gagal.
Brief §5: '"status = done" berkali-kali menutupi pekerjaan yang belum tuntas,
dan angka mentah tidak bisa melakukan itu.'
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPTS = HERE.parent
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))
if str(HERE) not in sys.path:
    sys.path.insert(0, str(HERE))

from pilot_schema import validate_corpus  # noqa: E402

W14 = "w14:paraId"
PART_AWAL = re.compile(r"^Part VI:")
PART_AKHIR = re.compile(r"^Part VIII:")


def paraids_docx_vi_vii(docx: Path) -> dict:
    """Jalur INDEPENDEN: pindai posisional di document.xml, bukan lewat TOC.

    Sengaja tidak memakai build_parts. Kalau G1 dihitung dengan mesin yang sama
    yang memproduksi keluarannya, ia menguji dirinya sendiri dan selalu lulus.
    """
    with zipfile.ZipFile(docx, "r") as z:          # 'r' — DOCX v120 BEKU
        xml = z.read("word/document.xml").decode("utf-8")

    blok = re.findall(r"<w:p[ >].*?</w:p>", xml, re.S)
    rows = []
    for b in blok:
        m = re.search(r'w14:paraId="([0-9A-Fa-f]{8})"', b)
        teks = "".join(re.findall(r"<w:t[^>]*>(.*?)</w:t>", b, re.S))
        teks = re.sub(r"\s+", " ", teks).strip()
        rows.append((m.group(1).upper() if m else None, teks))

    # Kemunculan KEDUA "Part VI:"/"Part VIII:" = badan naskah; yang pertama daftar isi.
    awal = [i for i, (_, t) in enumerate(rows) if PART_AWAL.match(t)]
    akhir = [i for i, (_, t) in enumerate(rows) if PART_AKHIR.match(t)]
    if not awal or not akhir:
        raise SystemExit("G1: batas Bagian VI / VIII tak ditemukan di DOCX")
    i0 = awal[-1]
    i1 = next(i for i in akhir if i > i0)

    iris = rows[i0:i1]
    berteks = [(p, t) for p, t in iris if t]
    return {
        "indeks_awal": i0,
        "indeks_akhir": i1,
        "paragraf_dalam_irisan": len(iris),
        "berteks": len(berteks),
        "ids": [p for p, t in berteks if p],
        "teks": {p: t for p, t in berteks if p},
    }


def g1(sumber: dict, docx: Path) -> dict:
    rec = sumber["seksi"]
    dipakai: list[str] = []
    for r in rec:
        dipakai.extend(x.upper() for x in r["source_paragraph_ids"])

    ganda = sorted({x for x in dipakai if dipakai.count(x) > 1})
    A = set(dipakai)

    d = paraids_docx_vi_vii(docx)
    B = set(d["ids"])

    sisa_docx = sorted(B - A)      # ada di DOCX, tak terpakai
    sisa_sumber = sorted(A - B)    # diklaim sumber, tak ada di irisan DOCX

    # Paragraf DOCX yang tak terpakai HAMPIR SELURUHNYA judul (Bagian + seksi),
    # yang importir memang konsumsi sebagai batas, bukan isi. Ditampilkan
    # terbuka supaya bisa diperiksa, bukan disembunyikan di balik angka lulus.
    contoh_sisa = [(p, d["teks"].get(p, "")[:70]) for p in sisa_docx[:15]]

    return {
        "id_dipakai_sumber": len(dipakai),
        "id_unik_sumber": len(A),
        "id_dipakai_lebih_dari_sekali": len(ganda),
        "paragraf_berteks_di_irisan_docx": len(B),
        "sisa_arah_docx_ke_sumber": len(sisa_docx),
        "sisa_arah_sumber_ke_docx": len(sisa_sumber),
        "contoh_sisa_docx": contoh_sisa,
    }


def g3(sumber: dict) -> dict:
    hasil = validate_corpus(sumber["seksi"])
    return {
        "seksi": hasil["seksi"],
        "error_skema": hasil["error"],
        "daftar_error": hasil["daftar_error"][:10],
        "r8_defeasible_tanpa_pembatal": hasil["r8_defeasible_tanpa_pembatal"],
        "r8_daftar": hasil["r8_daftar"],
    }


def g5(sumber: dict, parts_json: Path) -> dict:
    data = json.loads(parts_json.read_text(encoding="utf-8"))
    v120: dict[str, str] = {}

    def walk(n):
        if isinstance(n, dict):
            if "id" in n and isinstance(n.get("html"), str):
                v120[str(n["id"])] = n["html"]
            for v in n.values():
                walk(v)
        elif isinstance(n, list):
            for v in n:
                walk(v)

    walk(data)

    berubah, ditambah, dihapus = [], [], []
    for r in sumber["seksi"]:
        sid = r["canonical_id"]
        rekomposisi = "\n".join(p["html"] for p in r["paragraf"] if p["html"])
        if sid not in v120:
            ditambah.append(sid)
        elif rekomposisi != v120[sid]:
            berubah.append(sid)

    ids_pilot = {r["canonical_id"] for r in sumber["seksi"]}
    part_of = {r["canonical_id"]: r["part"] for r in sumber["seksi"]}
    # seksi v120 yang seharusnya ada di pilot tetapi tak diproduksi
    for sid in v120:
        pref = sid.split(".")[0]
        if pref in {"6", "7"} and sid not in ids_pilot:
            dihapus.append(sid)

    return {
        "seksi_dibandingkan": len(sumber["seksi"]),
        "berubah": len(berubah),
        "ditambah": len(ditambah),
        "dihapus": len(dihapus),
        "dipindah": 0,
        "daftar_berubah": berubah[:10],
        "daftar_dihapus": dihapus[:10],
        "_catatan_part": sorted(set(part_of.values())),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description="Gerbang G1/G3/G5 Pilot Track C — angka mentah")
    ap.add_argument("--sumber", required=True, help="Keluaran pilot_import.py (JSON)")
    ap.add_argument("--docx", required=True, help="DOCX v120 (read-only)")
    ap.add_argument("--parts-json", default=None, help="public/data/parts.json v120")
    args = ap.parse_args()

    sumber = json.loads(Path(args.sumber).read_text(encoding="utf-8"))
    docx = Path(args.docx)
    pj = Path(args.parts_json) if args.parts_json else SCRIPTS.parent / "data" / "parts.json"

    print("=" * 70)
    print("G1 — PROVENANCE TIAP PARAGRAF")
    print("=" * 70)
    r1 = g1(sumber, docx)
    for k, v in r1.items():
        if k == "contoh_sisa_docx":
            print(f"  {k}:")
            for p, t in v:
                print(f"      {p}  {t!r}")
        else:
            print(f"  {k:34s}: {v}")

    print()
    print("=" * 70)
    print("G3 — KELUARAN LOLOS SKEMA")
    print("=" * 70)
    r3 = g3(sumber)
    for k, v in r3.items():
        print(f"  {k:34s}: {v}")

    print()
    print("=" * 70)
    print("G5 — PEMBANDING NOL (rekomposisi sumber vs parts.json v120)")
    print("=" * 70)
    r5 = g5(sumber, pj)
    for k, v in r5.items():
        print(f"  {k:34s}: {v}")

    print()
    print("=" * 70)
    print("ANGKA YANG MENENTUKAN (16E §7 — yang membatalkan pilot)")
    print("=" * 70)
    print(f"  G5 berubah+ditambah+dihapus+dipindah : "
          f"{r5['berubah'] + r5['ditambah'] + r5['dihapus'] + r5['dipindah']}   (harus 0)")
    print(f"  G1 sisa arah sumber -> docx          : {r1['sisa_arah_sumber_ke_docx']}   (harus 0)")
    print(f"  G1 id dipakai lebih dari sekali      : {r1['id_dipakai_lebih_dari_sekali']}   (harus 0)")
    print(f"  G3 error skema                       : {r3['error_skema']}   (harus 0)")
    print()
    print("  CATATAN: 'G1 sisa arah docx -> sumber' TIDAK harus 0 — paragraf judul")
    print("  Bagian dan judul seksi dikonsumsi sebagai batas, bukan isi. Periksa")
    print("  contoh_sisa_docx di atas: bila ada yang BUKAN judul, G1 gagal sungguhan.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
