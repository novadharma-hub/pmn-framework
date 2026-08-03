#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_vault.py — Hasilkan vault Obsidian dari naskah. Baca-saja, sekali pakai buang.

DOCX tetap sumber kebenaran. Vault ini **artefak yang dihasilkan** — dibuang dan
dibuat ulang tiap versi. Jangan mengeditnya: editannya akan hilang di regenerasi
berikutnya, persis seperti mengedit data/parts.json.

Gunanya tiga:

  1. Rujukan silang jadi tautan sungguhan. Di DOCX, "17.7b" cuma teks — nol
     anchor di seluruh naskah, dan itulah sebabnya 10 xref basi selamat melewati
     dua penomoran ulang. Di sini tautannya hidup, jadi yang putus langsung
     kelihatan (Obsidian menandainya) dan terdaftar di _tautan-putus.md.

  2. Graph view memperlihatkan bentuk argumen: mana yang jadi simpul, mana yang
     menggantung tanpa rujukan masuk.

  3. Vale dan perkakas prosa lain jalan native di Markdown.

Sekaligus ini uji coba gratis untuk kemungkinan memindahkan sumber kebenaran ke
Markdown suatu saat: konverternya sudah ada dan sudah terbukti di naskah nyata.

Pakai:
    python pmn_vault.py v118.2
    python pmn_vault.py v118.2 --keluar D:\path\ke\vault
"""
from __future__ import annotations

import argparse
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

import pmn_docx as P
from pmn_check import RE_XREF, RE_CUE_XREF

BAWAAN = Path(__file__).resolve().parents[3] / "private" / "vault"

# Karakter yang tidak boleh ada di nama berkas Windows.
RE_HARAM = re.compile(r'[<>:"/\\|?*]')


def nama_aman(teks: str, batas: int = 80) -> str:
    bersih = RE_HARAM.sub("", " ".join(teks.split())).strip(" .")
    return bersih[:batas].strip() or "tanpa-judul"


def nama_berkas(sec: P.Para) -> str:
    if sec.section == sec.section_title:      # Preface, Coda, Bibliography, dst
        return nama_aman(sec.section_title)
    return nama_aman(f"{sec.section} {sec.section_title}")


def nama_folder(part: str, part_title: str) -> str:
    if part == part_title:
        return nama_aman(part_title)
    return nama_aman(f"Part {part} - {part_title}", 60)


def tautkan(md: str, peta: dict[str, str]) -> tuple[str, list[str]]:
    """Ubah rujukan seksi jadi [[wikilink]]. Balikkan (teks, daftar rujukan mati).

    Memakai syarat konteks yang sama dengan pmn_check: naskah ini penuh formula,
    jadi "threshold of 2.8" tidak boleh berubah jadi tautan.
    """
    putus: list[str] = []
    keluar: list[str] = []
    ujung = 0
    for m in RE_XREF.finditer(md):
        ref = m.group(1)
        if not RE_CUE_XREF.search(md[max(0, m.start() - 30): m.start()]):
            continue
        keluar.append(md[ujung:m.start()])
        if ref in peta:
            keluar.append(f"[[{peta[ref]}|{ref}]]")
        else:
            keluar.append(ref)
            putus.append(ref)
        ujung = m.end()
    keluar.append(md[ujung:])
    return "".join(keluar), putus


def bangun(doc: P.Doc, keluar: Path) -> dict:
    seksi = doc.sections()
    peta = {s.section: nama_berkas(s) for s in seksi}

    # Kelompokkan paragraf per seksi
    isi: dict[str, list[P.Para]] = defaultdict(list)
    urutan: list[P.Para] = []
    for s in seksi:
        urutan.append(s)
    for p in doc.body():
        if p.kind == "body" and p.section:
            isi[p.section].append(p)

    if keluar.exists():
        shutil.rmtree(keluar)
    keluar.mkdir(parents=True)

    semua_putus: list[tuple[str, str]] = []
    dibuat = 0

    for i, s in enumerate(urutan):
        folder = keluar / nama_folder(s.part, s.part_title)
        folder.mkdir(exist_ok=True)
        paras = isi.get(s.section, [])

        sebelum = urutan[i - 1] if i > 0 else None
        sesudah = urutan[i + 1] if i + 1 < len(urutan) else None

        badan: list[str] = []
        para_ids: list[str] = []
        for p in paras:
            teks, putus = tautkan(" ".join(p.md.split()), peta)
            badan.append(teks)
            para_ids.append(p.para_id)
            semua_putus.extend((s.section, r) for r in putus)

        fm = [
            "---",
            f'aliases: ["{s.section}"]' if s.section != s.section_title else "aliases: []",
            f'part: "{s.part}"',
            f'part_title: "{s.part_title}"',
            f'section: "{s.section}"',
            f'title: "{s.section_title}"',
            f"paragraphs: {len(paras)}",
            f"words: {sum(p.words for p in paras)}",
            f'heading_para_id: "{s.para_id}"',
            "para_ids:",
            *[f"  - {pid}" for pid in para_ids],
            "---",
            "",
        ]
        judul = s.section_title if s.section == s.section_title else f"{s.section} {s.section_title}"
        badan_lengkap = [f"# {judul}", ""]
        badan_lengkap += [b + "\n" for b in badan]
        nav = []
        if sebelum:
            nav.append(f"← [[{nama_berkas(sebelum)}]]")
        if sesudah:
            nav.append(f"[[{nama_berkas(sesudah)}]] →")
        if nav:
            badan_lengkap += ["", "---", "", " · ".join(nav), ""]

        (folder / f"{nama_berkas(s)}.md").write_text(
            "\n".join(fm) + "\n".join(badan_lengkap), encoding="utf-8"
        )
        dibuat += 1

    # Indeks
    baris = [
        "# PMN Framework — vault navigasi",
        "",
        f"Dihasilkan dari `{doc.path.name}`. **Baca-saja** — dibuat ulang tiap versi,",
        "editan di sini akan hilang. Sumber kebenaran tetap DOCX.",
        "",
        f"{len(doc.parts())} Part · {len(seksi)} seksi · {len(doc.body())} paragraf",
        "",
    ]
    part_kini = None
    for s in urutan:
        if s.part != part_kini:
            part_kini = s.part
            judul_part = s.part_title if s.part == s.part_title else f"Part {s.part}: {s.part_title}"
            baris += ["", f"## {judul_part}", ""]
        baris.append(f"- [[{nama_berkas(s)}]]")
    (keluar / "README.md").write_text("\n".join(baris) + "\n", encoding="utf-8")

    # Laporan tautan putus
    if semua_putus:
        lap = ["# Tautan putus", "", "Rujukan silang yang tidak menemukan seksi tujuan.", ""]
        per_ref: dict[str, list[str]] = defaultdict(list)
        for asal, ref in semua_putus:
            per_ref[ref].append(asal)
        for ref, asal in sorted(per_ref.items()):
            lap.append(f"- **{ref}** — dirujuk dari §{', §'.join(sorted(set(asal)))}")
        (keluar / "_tautan-putus.md").write_text("\n".join(lap) + "\n", encoding="utf-8")

    return {"berkas": dibuat, "putus": len(set(r for _, r in semua_putus))}


def main() -> int:
    ap = argparse.ArgumentParser(description="Hasilkan vault Obsidian dari naskah PMN.")
    ap.add_argument("versi", nargs="?", default="v118.2")
    ap.add_argument("--keluar", type=Path, default=BAWAAN)
    args = ap.parse_args()

    P.stdout_utf8()
    doc = P.load(P.resolve(args.versi))
    hasil = bangun(doc, args.keluar)

    print("=" * 72)
    print(f"  vault dibuat dari {doc.path.name}")
    print("=" * 72)
    print(f"  berkas seksi : {hasil['berkas']}")
    print(f"  tautan putus : {hasil['putus']}")
    print(f"  lokasi       : {args.keluar}")
    print("=" * 72)
    print("\n  Buka folder itu sebagai vault di Obsidian.")
    print("  JANGAN diedit — dibuat ulang tiap versi.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
