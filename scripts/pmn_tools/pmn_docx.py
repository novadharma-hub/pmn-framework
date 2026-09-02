#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
pmn_docx.py — Lapisan baca DOCX bersama untuk seluruh perkakas PMN.

Semua perkakas lain (pmn_index, pmn_check, pmn_diff, pmn_extract, pmn_edit)
memakai modul ini supaya definisi "paragraf", "paraId", dan "seksi" cuma ada
di satu tempat. Kalau parser naskah berubah, cukup ubah di sini.

paraId adalah atribut w14:paraId milik Word — pengenal stabil per paragraf yang
bertahan lintas versi selama paragrafnya tidak dihapus/dibuat ulang. Itu yang
membuat pembaruan bedah (surgical) mungkin: AI cukup menyebut paraId, tidak
perlu mengutip ulang seluruh teks.
"""
from __future__ import annotations

import re
import sys
import zipfile
from dataclasses import dataclass, field
from pathlib import Path
from xml.etree import ElementTree as ET  # dipakai untuk anotasi tipe saja

from lxml import etree as _LXML_ETREE

# Parser terjaga: entitas eksternal dimatikan (XXE), tanpa akses jaringan.
# remove_comments/remove_pis menyamakan perilaku dengan ElementTree, supaya
# hasil _para_text dan _para_markdown identik dengan versi sebelumnya.
_XML_GUARDED_PARSER = _LXML_ETREE.XMLParser(
    resolve_entities=False, no_network=True, huge_tree=False,
    remove_comments=True, remove_pis=True,
)

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
W14 = "http://schemas.microsoft.com/office/word/2010/wordml"
NS = {"w": W, "w14": W14}

DOC_XML = "word/document.xml"

# Pola struktur naskah PMN. Harus sinkron dengan public/scripts/import_pmn_docx.py
# (baris 75 & 77 di sana) — kalau salah satu berubah, yang lain ikut.
RE_PART = re.compile(r"^Part\s+([IVXLC]+)\s*:\s*(.+)$")
RE_SECTION = re.compile(r"^([0-9]+(?:\.[0-9A-Za-z-]+)*)\s+(.+)$")

# Judul tanpa nomor yang tetap dihitung sebagai seksi. Sama dengan
# SPECIAL_HEADINGS di import_pmn_docx.py:72.
SPECIAL_HEADINGS = {
    "Preface",
    "How to Read This Document",
    "Coda",
    "Intellectual Debts",
    "Bibliography",
}


@dataclass
class Para:
    """Satu paragraf naskah."""

    index: int  # urutan 0-based di document.xml
    para_id: str  # w14:paraId, mis. "27B90CDE"
    text: str  # teks polos, run sudah digabung
    style: str  # nama style Word, mis. "Heading1" / "Normal"
    md: str = ""  # teks yang sama dalam Markdown (bold/italic dipertahankan)

    # Diisi oleh assign_structure()
    part: str = ""  # mis. "XVII"
    part_title: str = ""
    section: str = ""  # mis. "17.7b"
    section_title: str = ""
    kind: str = "body"  # "part" | "section" | "body"

    @property
    def words(self) -> int:
        return len(self.text.split())

    def preview(self, n: int = 70) -> str:
        t = " ".join(self.text.split())
        return t if len(t) <= n else t[: n - 1] + "…"


@dataclass
class Doc:
    path: Path
    paras: list[Para] = field(default_factory=list)

    def by_id(self, para_id: str) -> Para | None:
        return self._id_map.get(para_id.upper())

    def __post_init__(self) -> None:
        self._id_map = {p.para_id: p for p in self.paras}

    def reindex(self) -> None:
        self._id_map = {p.para_id: p for p in self.paras}

    @property
    def duplicate_ids(self) -> list[str]:
        seen, dupes = set(), []
        for p in self.paras:
            if p.para_id in seen:
                dupes.append(p.para_id)
            seen.add(p.para_id)
        return dupes

    def sections(self) -> list[Para]:
        return [p for p in self.paras if p.kind == "section"]

    def parts(self) -> list[Para]:
        return [p for p in self.paras if p.kind == "part"]

    def body(self) -> list[Para]:
        return [p for p in self.paras if p.kind != "toc"]

    def toc(self) -> list[Para]:
        return [p for p in self.paras if p.kind == "toc"]

    def section_ids(self) -> set[str]:
        return {p.section for p in self.paras if p.kind == "section"}


def _para_text(p_el: ET.Element) -> str:
    """Gabungkan semua run jadi teks polos, hormati tab dan line-break."""
    out: list[str] = []
    for node in p_el.iter():
        tag = node.tag
        if tag == f"{{{W}}}t":
            out.append(node.text or "")
        elif tag == f"{{{W}}}tab":
            out.append("\t")
        elif tag in (f"{{{W}}}br", f"{{{W}}}cr"):
            out.append("\n")
    return "".join(out)


def _para_markdown(p_el: ET.Element) -> str:
    """Ubah satu paragraf jadi Markdown, mempertahankan bold dan italic.

    Naskah ini memakai bold secara semantik, bukan hiasan — banyak paragraf
    dibuka dengan label tebal ("Negative feedback (stabilizing): ..."). Kalau
    diratakan jadi teks polos, penanda struktur itu hilang.

    Run yang formatnya sama digabung dulu, supaya tidak menghasilkan
    "**a****b**" yang tidak dirender Markdown.
    """
    potongan: list[tuple[bool, bool, str]] = []
    for r in p_el.iter(f"{{{W}}}r"):
        rPr = r.find(f"{{{W}}}rPr")
        bold = italic = False
        if rPr is not None:
            b, i = rPr.find(f"{{{W}}}b"), rPr.find(f"{{{W}}}i")
            bold = b is not None and b.get(f"{{{W}}}val") not in ("0", "false")
            italic = i is not None and i.get(f"{{{W}}}val") not in ("0", "false")
        teks = []
        for node in r.iter():
            if node.tag == f"{{{W}}}t":
                teks.append(node.text or "")
            elif node.tag == f"{{{W}}}tab":
                teks.append("\t")
            elif node.tag in (f"{{{W}}}br", f"{{{W}}}cr"):
                teks.append("\n")
        isi = "".join(teks)
        if not isi:
            continue
        if potongan and potongan[-1][0] == bold and potongan[-1][1] == italic:
            potongan[-1] = (bold, italic, potongan[-1][2] + isi)
        else:
            potongan.append((bold, italic, isi))

    keluar = []
    for bold, italic, isi in potongan:
        # Penanda harus menempel ke teks, spasi tepi dikeluarkan dari penanda.
        inti = isi.strip()
        if not inti:
            keluar.append(isi)
            continue
        kiri = isi[: len(isi) - len(isi.lstrip())]
        kanan = isi[len(isi.rstrip()):]
        tanda = "***" if (bold and italic) else "**" if bold else "*" if italic else ""
        keluar.append(f"{kiri}{tanda}{inti}{tanda}{kanan}")
    return "".join(keluar)


def _para_style(p_el: ET.Element) -> str:
    pPr = p_el.find(f"{{{W}}}pPr")
    if pPr is None:
        return ""
    pStyle = pPr.find(f"{{{W}}}pStyle")
    if pStyle is None:
        return ""
    return pStyle.get(f"{{{W}}}val", "")


def find_body_start(paras: list[Para]) -> int:
    """
    Indeks paragraf pertama isi naskah — semua sebelumnya adalah daftar isi.

    Aturannya disalin dari import_pmn_docx.py:87-90 (pemunculan KEDUA kata
    "Preface"): yang pertama entri daftar isi, yang kedua judul isi. Kalau
    aturan di sana berubah, ubah juga di sini — dua definisi yang berbeda
    akan membuat nomor paragraf perkakas ini meleset dari pipeline.
    """
    hits = [i for i, p in enumerate(paras) if " ".join(p.text.split()) == "Preface"]
    if len(hits) >= 2:
        return hits[1]
    return hits[0] if hits else 0


def assign_structure(paras: list[Para]) -> None:
    """Tempelkan konteks Part/Section ke tiap paragraf secara berurutan."""
    body_start = find_body_start(paras)
    part = part_title = section = section_title = ""
    for p in paras:
        stripped = " ".join(p.text.split())
        if p.index < body_start:
            p.kind = "toc"
            continue
        m_part = RE_PART.match(stripped)
        m_sec = RE_SECTION.match(stripped)
        if m_part:
            part, part_title = m_part.group(1), m_part.group(2).strip()
            section = section_title = ""
            p.kind = "part"
        elif stripped in SPECIAL_HEADINGS:
            section, section_title = stripped, stripped
            if stripped in ("Preface", "Coda", "Intellectual Debts", "Bibliography"):
                part, part_title = stripped, stripped
            p.kind = "section"
        elif m_sec and len(stripped) < 200:
            # Batas panjang mencegah paragraf isi yang kebetulan diawali angka
            # (mis. "1990 adalah tahun…") dikira judul seksi.
            section, section_title = m_sec.group(1), m_sec.group(2).strip()
            p.kind = "section"
        p.part, p.part_title = part, part_title
        p.section, p.section_title = section, section_title


def load(path: str | Path) -> Doc:
    """Baca DOCX jadi objek Doc. Tidak mengubah berkas apa pun."""
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"DOCX tidak ditemukan: {path}")
    with zipfile.ZipFile(path) as z:
        xml = z.read(DOC_XML)
    root = _LXML_ETREE.fromstring(xml, _XML_GUARDED_PARSER)
    body = root.find(f"{{{W}}}body")
    if body is None:
        raise ValueError(f"document.xml tanpa <w:body>: {path}")

    paras: list[Para] = []
    for i, p_el in enumerate(body.iter(f"{{{W}}}p")):
        pid = p_el.get(f"{{{W14}}}paraId", "")
        paras.append(
            Para(
                index=i,
                para_id=pid.upper(),
                text=_para_text(p_el),
                style=_para_style(p_el),
                md=_para_markdown(p_el),
            )
        )
    assign_structure(paras)
    return Doc(path=path, paras=paras)


def resolve(spec: str | Path) -> Path:
    """Terima path DOCX langsung, atau tag versi seperti 'v118.1' / '118_2'."""
    p = Path(spec)
    if p.suffix.lower() == ".docx" and p.exists():
        return p
    tag = str(spec).lstrip("vV")
    root = Path(__file__).resolve().parents[3]  # pmn_tools -> scripts -> private -> pmn-workspace
    cands = list(root.glob(f"private/**/PMN_Framework_v{tag}.docx"))
    if not cands:
        alt = tag.replace(".", "_")
        cands = list(root.glob(f"private/**/PMN_Framework_v{alt}.docx"))
    if not cands:
        raise FileNotFoundError(f"Tidak menemukan DOCX untuk '{spec}'")
    # Pilih yang paling baru kalau ada beberapa salinan
    return max(cands, key=lambda c: c.stat().st_mtime)


def stdout_utf8() -> None:
    """Windows console default cp1252 — naskah ini penuh en-dash dan kutip miring."""
    if sys.platform.startswith("win"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
        except AttributeError:
            pass


if __name__ == "__main__":
    stdout_utf8()
    target = sys.argv[1] if len(sys.argv) > 1 else "v118.2"
    d = load(resolve(target))
    print(f"{d.path.name}")
    print(f"  paragraf total : {len(d.paras)}")
    print(f"  daftar isi     : {len(d.toc())}")
    print(f"  paragraf isi   : {len(d.body())}")
    print(f"  paraId ganda   : {len(d.duplicate_ids)}")
    print(f"  Part           : {len(d.parts())}")
    print(f"  Seksi          : {len(d.sections())}")
