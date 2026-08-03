#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_check.py — Audit mekanis naskah PMN. Nol token AI.

Yang dikerjakan mesin di sini adalah yang pada v118.2 ditemukan dengan membaca
3.407 paragraf satu per satu: xref basi, entri daftar pustaka tak terkutip,
ID ganda, dan salah hitung judul. Semuanya deterministik — tidak ada gunanya
membakar konteks model untuk pekerjaan yang regex bisa lakukan dengan benar.

Tujuannya bukan menggantikan pembacaan, tapi mengecilkan yang perlu dibaca.

Pakai:
    python pmn_check.py                 # versi terbaru
    python pmn_check.py v118.2          # versi tertentu
    python pmn_check.py v118.2 --json   # keluaran mesin

Kode keluar: 1 kalau ada ERROR, 0 kalau hanya WARNING/bersih.
"""
from __future__ import annotations

import argparse
import json
import re
import unicodedata
import sys
from collections import defaultdict
from dataclasses import dataclass, asdict

import pmn_docx as P

# Bentuk ID seksi PMN: 1.1, 1.6b, 3.8c, 7.3c-i, 15.15, 17.7c-ii
RE_XREF = re.compile(r"\b(\d{1,2}\.\d{1,3}[a-z]?(?:-[ivx]+)?)\b")

# "Part I-b", "Part XII-b" — label part, termasuk yang sudah tidak ada
RE_PART_REF = re.compile(r"\bPart\s+([IVXLC]+(?:-[a-z])?)\b")

# Judul yang mengklaim jumlah: "Five Entry Points by Reader Intent"
RE_COUNT_HEADING = re.compile(
    r"^(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten)\s+([A-Z][\w-]*(?:\s+[\w-]+){0,4})$"
)
ANGKA_KATA = {
    "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
    "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
}

# Angka yang mirip ID seksi tapi bukan — jangan dilaporkan sebagai xref rusak.
BUKAN_XREF = re.compile(r"\bv?\d{2,4}\.\d+\b")  # versi (118.2), tahun desimal

# Kata-kunci yang menandai angka sesudahnya adalah RUJUKAN seksi, bukan angka
# biasa. Diambil dari bentuk xref nyata yang diperbaiki di v118.2:
#   "the analysis in 17.5a"   "Section 17.5d addresses"   "Start with 17.5"
#   "Connection to 17.6"      "the transmission problem (17.6)"
RE_CUE_XREF = re.compile(
    r"(?:sections?|§|see|parts?|in|to|with|at|per|and|,|\()\s*$",
    re.IGNORECASE,
)


@dataclass
class Temuan:
    tingkat: str      # "ERROR" | "WARN"
    jenis: str
    lokasi: str       # paraId
    seksi: str
    pesan: str


def _tanpa_diakritik(s: str) -> str:
    """Rockström -> Rockstrom. Badan teks tidak selalu memakai diakritik."""
    return "".join(
        c for c in unicodedata.normalize("NFKD", s) if not unicodedata.combining(c)
    )


def _nama_entri(entry: str) -> tuple[str, list[str]]:
    """Ambil bagian nama dari satu entri daftar pustaka.

    Formatnya tidak seragam — ada yang bermarga ('Turchin, Peter. 2009.'), ada
    yang nama tunggal ('Kautilya. c. 300 BCE.'), gelar ('Leo XIII. 1891.'),
    nama Arab/Tionghoa ('Ibn Khaldun.', 'Zhao Tingyang.'), dan nama ganda
    dalam kurung ('Ibn Rushd (Averroes).').

    Balikkan (nama_penuh, token_pencarian). Entri dianggap terkutip kalau SALAH
    SATU token muncul di badan teks — sengaja longgar, supaya lebih baik
    melewatkan satu yatim daripada menuduh entri yang sebenarnya dikutip.
    """
    # Nama berakhir di koma atau titik, mana yang lebih dulu.
    potong = len(entry)
    for tanda in (",", "."):
        i = entry.find(tanda)
        if i != -1:
            potong = min(potong, i)
    nama = entry[:potong].strip()

    # Nama alternatif dalam kurung ikut jadi token: 'Ibn Rushd (Averroes)'
    kandidat = re.sub(r"[()]", " ", nama)
    token = [
        t for t in re.findall(r"[A-Za-zÀ-ÿ'’-]+", kandidat)
        if len(t) >= 4 and t.lower() not in {"ibn", "abd", "al", "van", "den", "der"}
    ]
    return nama, token or [nama]


def cek_id_ganda(doc: P.Doc) -> list[Temuan]:
    """ID seksi ganda = tampil dua kali di reader, xref ke sana jadi ambigu."""
    out: list[Temuan] = []
    lihat: dict[str, list[P.Para]] = defaultdict(list)
    for p in doc.sections():
        lihat[p.section].append(p)
    for sid, paras in lihat.items():
        if len(paras) > 1:
            ids = ", ".join(x.para_id for x in paras)
            out.append(Temuan(
                "ERROR", "id-seksi-ganda", ids, sid,
                f"seksi '{sid}' muncul {len(paras)}x — biasanya judul tanpa nomor "
                f"yang teksnya sama dengan judul bernomor",
            ))
    for pid in doc.duplicate_ids:
        out.append(Temuan("ERROR", "paraid-ganda", pid, "", f"paraId {pid} dipakai lebih dari sekali"))
    return out


def cek_xref(doc: P.Doc) -> list[Temuan]:
    """Rujukan ke ID seksi yang tidak ada — inilah yang dominan di v118.2.

    Angka yang berbentuk seperti ID seksi belum tentu rujukan. Naskah ini penuh
    formula, jadi "T = 3.3, which exceeds the threshold of 2.8" akan cocok pola
    tapi jelas bukan xref. Karena itu dipersyaratkan ada kata-kunci rujukan
    tepat sebelum angkanya. Lebih baik melewatkan satu xref basi daripada
    membanjiri laporan dengan angka biasa — checker yang berisik akan diabaikan.
    """
    sah = doc.section_ids()
    # Prefiks yang sah juga: "17.7" boleh merujuk kelompok 17.7b/17.7c
    prefiks = {s.rsplit(".", 1)[0] for s in sah} | {
        re.sub(r"[a-z]?(-[ivx]+)?$", "", s) for s in sah
    }
    out: list[Temuan] = []
    for p in doc.paras:
        if p.kind == "toc" or p.part == "Bibliography":
            continue
        teks = " ".join(p.text.split())
        for m in RE_XREF.finditer(teks):
            ref = m.group(1)
            if ref in sah or ref in prefiks:
                continue
            if BUKAN_XREF.search(m.group(0)):
                continue
            if not RE_CUE_XREF.search(teks[max(0, m.start() - 30): m.start()]):
                continue  # angka biasa, bukan rujukan
            awal = max(0, m.start() - 45)
            out.append(Temuan(
                "ERROR", "xref-mati", p.para_id, p.section,
                f"'{ref}' tidak ada — \"…{teks[awal:m.end() + 25]}…\"",
            ))
    return out


def cek_judul_bertabrakan(doc: P.Doc) -> list[Temuan]:
    """Judul TANPA nomor yang teksnya sama persis dengan judul seksi bernomor.

    Inilah akar duplikat 7.3c-ii, dan tidak terlihat kalau hanya memeriksa DOCX
    secara struktural: parser ini membaca 1445 sebagai paragraf biasa. Duplikat
    baru lahir di import_pmn_docx.py, yang mencocokkan judul telanjang dengan
    entri daftar isi lalu membuka seksi itu untuk KEDUA kalinya.

    Jadi periksa penyebabnya, bukan akibatnya.
    """
    judul_bernomor = {
        " ".join(p.section_title.split()): p for p in doc.sections() if p.section_title
    }
    out: list[Temuan] = []
    for p in doc.body():
        if p.kind != "body":
            continue
        teks = " ".join(p.text.split())
        if not teks or len(teks) > 140 or teks.endswith((".", "?", ":", "”", '"')):
            continue
        kembar = judul_bernomor.get(teks)
        if kembar is None or kembar.index == p.index:
            continue
        # Urutan menentukan dampak: importer membuka seksi saat mencocokkan judul
        # telanjang dengan daftar isi. Kalau judul telanjang datang DULUAN, seksi
        # dibuka di situ lalu dibuka lagi saat judul bernomor tiba -> duplikat.
        # Kalau datang sesudahnya, seksi sudah terbuka dan tidak ada yang tergandakan.
        if p.index < kembar.index:
            out.append(Temuan(
                "ERROR", "judul-bertabrakan", p.para_id, p.section,
                f"judul tanpa nomor identik dengan '{kembar.section} {teks}' "
                f"[{kembar.para_id}] dan muncul SEBELUMNYA — importer membuat seksi "
                f"{kembar.section} DUA KALI. Perbaikannya: bedakan salah satu judul.",
            ))
        else:
            out.append(Temuan(
                "WARN", "judul-diulang", p.para_id, p.section,
                f"judul tanpa nomor mengulang '{kembar.section} {teks}' "
                f"[{kembar.para_id}]. Tidak menggandakan seksi (muncul sesudahnya), "
                f"tapi dua judul identik di satu naskah membingungkan pembaca.",
            ))
    return out


def cek_part_ref(doc: P.Doc) -> list[Temuan]:
    """Rujukan ke Part yang tidak ada lagi — mis. 'Part XII-b', 'Part I-b'."""
    sah = {p.part for p in doc.parts()} | {"I-b"}  # I-b hanya utk deteksi, bukan sah
    sah.discard("I-b")
    out: list[Temuan] = []
    for p in doc.paras:
        if p.kind == "toc":
            continue
        teks = " ".join(p.text.split())
        for m in RE_PART_REF.finditer(teks):
            label = m.group(1)
            if label in sah:
                continue
            out.append(Temuan(
                "ERROR", "part-hantu", p.para_id, p.section,
                f"'Part {label}' tidak ada dalam struktur sekarang",
            ))
    return out


def cek_hitungan_judul(doc: P.Doc) -> list[Temuan]:
    """'Five Entry Points' padahal ada enam — kesalahan v118.2 yang khas."""
    out: list[Temuan] = []
    body = doc.body()
    for i, p in enumerate(body):
        teks = " ".join(p.text.split())
        m = RE_COUNT_HEADING.match(teks)
        if not m:
            continue
        diklaim = ANGKA_KATA[m.group(1).lower()]
        # Hitung sub-judul setelahnya sampai judul seksi/part berikutnya
        nyata = 0
        for q in body[i + 1: i + 80]:
            if q.kind in ("section", "part"):
                break
            t = " ".join(q.text.split())
            if t and len(t) < 110 and not t.endswith((".", "?", ":", "”", '"')):
                nyata += 1
        if nyata and nyata != diklaim:
            out.append(Temuan(
                "WARN", "hitungan-judul", p.para_id, p.section,
                f"'{teks}' mengklaim {diklaim}, terhitung {nyata} sub-judul menyusul",
            ))
    return out


def cek_bibliography(doc: P.Doc) -> list[Temuan]:
    """Entri daftar pustaka yang namanya tak pernah muncul di badan teks."""
    entri = [p for p in doc.paras if p.part == "Bibliography" and p.kind == "body"]
    badan = _tanpa_diakritik("\n".join(
        p.text for p in doc.paras
        if p.part != "Bibliography" and p.kind != "toc"
    ))
    out: list[Temuan] = []
    terlihat: set[str] = set()
    for p in entri:
        teks = " ".join(p.text.split())
        if len(teks) < 12:
            continue
        nama, token = _nama_entri(teks)
        if not nama or nama in terlihat:
            continue
        terlihat.add(nama)
        dikutip = any(
            re.search(rf"\b{re.escape(_tanpa_diakritik(t))}\b", badan, re.IGNORECASE)
            for t in token
        )
        if not dikutip:
            out.append(Temuan(
                "WARN", "bibliography-yatim", p.para_id, "Bibliography",
                f"'{nama}' ada di daftar pustaka tapi tidak dikutip di badan teks",
            ))
    return out


PEMERIKSAAN = [
    ("ID ganda",          cek_id_ganda),
    ("Xref",              cek_xref),
    ("Judul bertabrakan", cek_judul_bertabrakan),
    ("Rujukan Part",      cek_part_ref),
    ("Hitungan judul",    cek_hitungan_judul),
    ("Daftar pustaka",    cek_bibliography),
]


def main() -> int:
    ap = argparse.ArgumentParser(description="Audit mekanis naskah PMN.")
    ap.add_argument("versi", nargs="?", default="v118.2", help="mis. v118.2 atau path DOCX")
    ap.add_argument("--json", action="store_true", help="keluaran JSON untuk perkakas lain")
    args = ap.parse_args()

    P.stdout_utf8()
    doc = P.load(P.resolve(args.versi))

    semua: list[Temuan] = []
    for _, fn in PEMERIKSAAN:
        semua.extend(fn(doc))

    if args.json:
        print(json.dumps({
            "berkas": doc.path.name,
            "paragraf": len(doc.paras),
            "temuan": [asdict(t) for t in semua],
        }, ensure_ascii=False, indent=2))
        return 1 if any(t.tingkat == "ERROR" for t in semua) else 0

    errors = [t for t in semua if t.tingkat == "ERROR"]
    warns = [t for t in semua if t.tingkat == "WARN"]

    print("=" * 72)
    print(f"  pmn_check — {doc.path.name}")
    print(f"  {len(doc.paras)} paragraf, {len(doc.parts())} part, {len(doc.sections())} seksi")
    print("=" * 72)

    for tingkat, daftar, warna in (("ERROR", errors, "\033[91m"), ("WARN", warns, "\033[93m")):
        if not daftar:
            continue
        print(f"\n{warna}{tingkat} ({len(daftar)})\033[0m")
        for t in daftar:
            lok = f"{t.seksi} [{t.lokasi}]" if t.seksi else f"[{t.lokasi}]"
            print(f"  {t.jenis:<20} {lok}")
            print(f"    {t.pesan}")

    print("\n" + "=" * 72)
    if errors:
        print(f"  \033[91m{len(errors)} ERROR\033[0m, {len(warns)} warning")
    elif warns:
        print(f"  \033[92m0 error\033[0m, {len(warns)} warning")
    else:
        print("  \033[92mBERSIH\033[0m")
    print("=" * 72)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
