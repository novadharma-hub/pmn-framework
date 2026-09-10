#!/usr/bin/env python3
"""Kompiler Pilot Track C (F4) — sumber ber-provenance → korpus gabungan.

Spesifikasi: private/restrukturisasi/16E_PILOT_TRACK_C.md §3 (G3) dan §4 langkah 2.

APA YANG BERKAS INI SELESAIKAN
  G3 berbunyi DUA syarat: keluaran lolos skema, DAN `pmn_check` atas korpus
  gabungan (24 Bagian lama + 2 terkonversi) tetap BERSIH. `pilot_gates.py`
  hanya menjalankan syarat pertama. Syarat kedua butuh kompiler, dan inilah
  kompilernya.

CARA G3(b) DIJALANKAN SUNGGUHAN, BUKAN DIGANTI
  `pmn_check` tidak menerima JSON — ia hanya membaca DOCX lewat pmn_docx.load().
  Tetapi pemeriksaannya bekerja atas objek `Doc`, bukan atas berkas. Maka
  kompiler ini MENYUSUN `Doc` gabungan:

      Bagian I-V, VIII-XVII  ->  paragraf dari DOCX, apa adanya (belum dikonversi)
      Bagian VI, VII         ->  paragraf DIREKONSTRUKSI dari sumber pilot

  lalu memanggil KEENAM fungsi pemeriksaan `pmn_check` yang sama, tanpa
  menyalinnya. Kalau format sumber kehilangan sesuatu yang pmn_check ukur,
  vonis korpus gabungan akan berbeda dari vonis v120 — dan itu kegagalan.

  Pembandingnya dijalankan di dalam proses yang sama: vonis DOCX murni versus
  vonis gabungan. Selisih apa pun ditampilkan per temuan.

BATAS
  Ini bukan kompiler produksi. Ia tidak menghasilkan situs; ia menghasilkan
  korpus yang bisa diperiksa. G4 (reader menampilkan Book -> Part -> Section)
  tetap di luar jangkauannya dan tetap jalur gerbang, bukan jalur skrip ini.
"""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
SCRIPTS = HERE.parent
for p in (str(SCRIPTS), str(HERE), str(SCRIPTS / "pmn_tools")):
    if p not in sys.path:
        sys.path.insert(0, p)

import import_pmn_docx as imp          # noqa: E402
import pmn_docx as P                   # noqa: E402
import pmn_check as C                  # noqa: E402

PILOT_PARTS = ("VI", "VII")


def teks_polos(html_frag: str) -> str:
    """html paragraf -> teks polos, sepadan dengan P._para_text().

    JANGAN meruntuhkan spasi berurutan. Versi pertama fungsi ini memakai
    re.sub(r"\\s+", " ", ...) dan melaporkan 36 paragraf "tak cocok". Ketiga
    puluh enam itu ternyata SPASI GANDA yang naskahnya memang punya
    (mis. "framework:  Power"), dipertahankan di DOCX DAN di parts.json v120
    DAN di html sumber pilot. Yang membuangnya adalah pembanding ini sendiri.

    Pelajarannya sama dengan yang berulang di proyek ini: alat ukurnya yang
    salah, bukan naskahnya. Meruntuhkan spasi di sini akan membuat gerbang
    melaporkan kegagalan yang ia ciptakan sendiri.
    """
    t = re.sub(r"<br\s*/?>", " ", html_frag)
    t = re.sub(r"<[^>]+>", "", t)
    t = (t.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
          .replace("&quot;", '"').replace("&#x27;", "'").replace("&#39;", "'")
          .replace("&nbsp;", " "))
    return t.strip()


def doc_gabungan(doc: P.Doc, sumber: dict) -> tuple[P.Doc, dict]:
    """Ganti paragraf Bagian VI+VII dengan rekonstruksi dari sumber pilot."""
    dari_sumber: dict[str, str] = {}
    for rec in sumber.get("seksi", []):
        for p in rec.get("paragraf", []):
            if p.get("paraId"):
                dari_sumber[p["paraId"].upper()] = teks_polos(p["html"])
    for b in sumber.get("bagian", []):
        for p in b.get("paragraf", []):
            if p.get("paraId"):
                dari_sumber[p["paraId"].upper()] = teks_polos(p["html"])

    diganti, tak_cocok, tak_ketemu = 0, [], 0
    beda_isi: list[tuple[str, str, str]] = []
    for para in doc.paras:
        if para.part not in PILOT_PARTS:
            continue
        pid = (para.para_id or "").upper()
        if pid not in dari_sumber:
            # judul Bagian/seksi memang tidak dibawa sebagai isi
            if para.kind in ("part", "section"):
                continue
            tak_ketemu += 1
            continue
        baru = dari_sumber[pid]
        if baru != para.text:
            tak_cocok.append((pid, para.text[:60], baru[:60]))
        if re.sub(r"\s+", " ", baru).strip() != re.sub(r"\s+", " ", para.text).strip():
            beda_isi.append((pid, para.text[:60], baru[:60]))
        para.text = baru
        diganti += 1

    return doc, {
        "paragraf_diganti_dari_sumber": diganti,
        "isi_pilot_tak_ada_di_sumber": tak_ketemu,
        "teks_tak_cocok_persis": len(tak_cocok),
        "teks_beda_ISI": len(beda_isi),
        "contoh_beda_isi": beda_isi[:5],
    }


def periksa(doc: P.Doc) -> list:
    semua = []
    for _, fn in C.PEMERIKSAAN:
        semua.extend(fn(doc))
    return semua


def ringkas(temuan: list) -> dict:
    err = [t for t in temuan if t.tingkat == "ERROR"]
    wrn = [t for t in temuan if t.tingkat == "WARN"]
    return {"error": len(err), "warn": len(wrn),
            "sidik": sorted(f"{t.tingkat}|{t.jenis}|{t.seksi}|{t.lokasi}" for t in temuan)}


def main() -> int:
    ap = argparse.ArgumentParser(description="Kompiler pilot + G3(b) korpus gabungan")
    ap.add_argument("--sumber", required=True)
    ap.add_argument("--docx", default=None)
    ap.add_argument("--keluaran", default=None, help="tulis korpus terkompilasi (JSON)")
    args = ap.parse_args()

    P.stdout_utf8()
    sumber = json.loads(Path(args.sumber).read_text(encoding="utf-8"))
    docx = P.resolve(args.docx or "v120")

    print("=" * 70)
    print("GARIS DASAR — pmn_check atas DOCX v120 murni")
    print("=" * 70)
    base_doc = P.load(docx)
    base = ringkas(periksa(base_doc))
    print(f"  paragraf {len(base_doc.paras)} · part {len(base_doc.parts())} · "
          f"seksi {len(base_doc.sections())}")
    print(f"  ERROR {base['error']} · WARN {base['warn']}")

    print()
    print("=" * 70)
    print("KORPUS GABUNGAN — 15 Bagian dari DOCX + Bagian VI & VII dari sumber pilot")
    print("=" * 70)
    merged_doc = P.load(docx)
    merged_doc, stat = doc_gabungan(merged_doc, sumber)
    for k, v in stat.items():
        if k == "contoh_beda_isi":
            for pid, a, b in v:
                print(f"      {pid}\n        DOCX  : {a!r}\n        sumber: {b!r}")
        else:
            print(f"  {k:32s}: {v}")
    merged = ringkas(periksa(merged_doc))
    print(f"  ERROR {merged['error']} · WARN {merged['warn']}")

    print()
    print("=" * 70)
    print("G3(b) — VONIS")
    print("=" * 70)
    sama = base["sidik"] == merged["sidik"]
    hilang = [s for s in base["sidik"] if s not in merged["sidik"]]
    baru = [s for s in merged["sidik"] if s not in base["sidik"]]
    print(f"  temuan v120 murni      : {len(base['sidik'])}")
    print(f"  temuan korpus gabungan : {len(merged['sidik'])}")
    print(f"  temuan HILANG          : {len(hilang)}  {hilang[:3]}")
    print(f"  temuan BARU            : {len(baru)}  {baru[:3]}")
    print(f"  teks beda ISI          : {stat['teks_beda_ISI']}   (harus 0)")
    print(f"  teks beda persis       : {stat['teks_tak_cocok_persis']}   "
          f"(informasi saja - spasi berurutan)")
    print()
    if sama and merged["error"] == 0 and stat["teks_beda_ISI"] == 0:
        print("  Korpus gabungan BERSIH dan vonisnya IDENTIK dengan v120.")
        print("  Format sumber tidak kehilangan apa pun yang pmn_check ukur.")
    else:
        print("  SELISIH TERDETEKSI — format sumber mengubah sesuatu. Periksa di atas.")

    if args.keluaran:
        out = Path(args.keluaran)
        out.parent.mkdir(parents=True, exist_ok=True)
        korpus = []
        for part in sorted({p.part for p in merged_doc.paras if p.part}):
            seksi = {}
            for p in merged_doc.paras:
                if p.part != part or not p.section:
                    continue
                seksi.setdefault(p.section, {"id": p.section, "title": p.section_title,
                                             "paragraf": []})
                if p.kind == "body":
                    seksi[p.section]["paragraf"].append(
                        {"paraId": p.para_id, "text": p.text})
            korpus.append({"part": part, "seksi": list(seksi.values()),
                           "terkonversi": part in PILOT_PARTS})
        out.write_text(json.dumps({"_korpus": "gabungan pilot F4",
                                   "_terkonversi": list(PILOT_PARTS),
                                   "part": korpus}, ensure_ascii=False, indent=2),
                       encoding="utf-8")
        print(f"\nkorpus terkompilasi: {out}")

    return 0 if merged["error"] == 0 and stat["teks_beda_ISI"] == 0 else 1


if __name__ == "__main__":
    raise SystemExit(main())
