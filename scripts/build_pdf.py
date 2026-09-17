#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
build_pdf.py — Regenerate PMN_Latest.pdf from the canonical part data.

WHY THIS EXISTS
---------------
Until 2026-09-15, PMN_Latest.pdf was byte-identical to PMN_Framework_v118.6.pdf
(5 September). Every text fix shipped to the site left the direct-download PDF
silently stale. A PDF that disagrees with the site is worse than no PDF: it is
the artifact a careful reader trusts most. a5b45f3 fixed that by making the PDF
a build output.

WHAT CHANGED 2026-09-17, AND WHY IT IS NOT A COSMETIC EDIT
----------------------------------------------------------
a5b45f3 rendered from `pmn_corpus_for_ai.md`. That file is a FLATTENING built
for AI ingestion: every <strong> and <em> is already gone by the time it
exists. The PDF inherited the flattening, and the result was blamed on
reportlab. It was never reportlab.

Measured on the v126 data:

    pmn_corpus_for_ai.md      0 bold      1 italic   (the flattening)
    data/parts.json        1,684 bold  1,174 italic  (what the site renders)

This script now reads `data/parts.json` — the same source the React reader
renders — so 2,858 emphasis spans survive into the PDF instead of being
discarded. It also recovers what the corpus path could not express at all:
full part titles, per-section ids, a contents table, and a PDF outline.

THE SOURCE HAD TO BE parts.json, NOT data/parts/*.json
------------------------------------------------------
The split per-part files are bare section lists. Five parts carry
`preamble_html` (10 blocks, ~8,045 characters) that exists ONLY in the
monolithic `data/parts.json`. Building from the split files would have dropped
that text with no error and no diff anyone would read. Checked before writing,
not after.

THE CONTENTS TABLE IS BUILT IN TWO DETERMINISTIC PASSES, NOT multiBuild
-----------------------------------------------------------------------
reportlab's TableOfContents resolves page numbers by rebuilding until the
numbers stop moving. With 256 entries it never settled: "Index entries not
resolved after 10 passes". The feedback loop is real — the contents table's own
length shifts every page number, which can change the contents table's length.

Tuning it until a build happens to converge would leave a build that can stop
converging when the manuscript grows. So the loop is removed instead:

    pass 1  render the book with no contents table; record (level, text, page)
    pass 2  lay out the contents table alone to learn how many pages it takes
    pass 3  render the book with the contents table, every recorded page
            number shifted by exactly that many pages

Page numbers sit in a fixed-width right-aligned column, so a number gaining a
digit cannot re-wrap a line. The offset is therefore exact by construction and
the build cannot fail to converge.

TYPOGRAPHY: VENDORED FONTS ARE OPTIONAL, BY DESIGN
--------------------------------------------------
The deploy runner is ubuntu-latest. Georgia — what the old Word export used —
is a proprietary Microsoft face: present on the author's machine, absent on the
runner, and not redistributable. Depending on it would reproduce the exact
failure class that already cost three silent deploys (CI without reportlab).

So fonts are DETECT-AND-FALL-BACK. If OFL faces are vendored under
`assets/fonts/`, they are embedded; if not, the base-14 Times family is used
and the build still succeeds. A missing font can never become a build failure.

The faces looked for are the ones the site already loads from Google Fonts —
Lora and Libre Baskerville, both SIL Open Font License — so an embedded build
wears the same face as the reader, which is a better target than imitating an
export that had gone stale anyway.

VERSION IS READ, NEVER WRITTEN IN
---------------------------------
`TITLE` used to be the literal string "PMN Framework v120". It was the sixth
hardcoded-v120 found on 2026-09-17, and it was stamped into the Title metadata
of the v126 PDF. The version now comes from data/version.json.

AUTHORSHIP: PEN NAME EVERYWHERE, REAL NAME NOWHERE
--------------------------------------------------
Until 2026-09-17 every metadata field read "Anonymous" and the cover carried no
byline, while the site and llms.txt named the author four times over. That was
not protection, it was an inconsistency: the same name sat one click from the
file. Worse for a document meant to be cited, `/Author: Anonymous` enters every
reference manager as an author literally called "Anonymous".

Nova's rule, 2026-09-17: no real name anywhere; the pen name "Nova Dharma" is
the only name used. So /Author and the cover now carry the pen name, and
/Creator, /Producer and /Subject stay "Anonymous" because those are TOOL
fields — filling them only adds a fingerprint of the machine that built the
file, which is the thing actually worth withholding.

PIPELINE POSITION
-----------------
  DOCX (canonical, private)  ->  data/parts.json  ->  modularizer compile
  ->  pmn_corpus_for_ai.md   ->  [THIS SCRIPT]    ->  dist/PMN_Latest.pdf
  ->  npm run build          ->  dist/ (deployed)

STALENESS GUARD
---------------
Compares the mtime of what this script actually READS (data/parts.json) against
the PDF, plus the canonical DOCX against parts.json. A guard that watches a file
the script no longer reads is not a guard.

USAGE
-----
    python build_pdf.py              # regenerate only if stale
    python build_pdf.py --force      # regenerate regardless
    python build_pdf.py --check      # only report staleness, no write

Exit codes: 0 success/current, 1 error, 2 stale-and-regenerated.
"""

import argparse
import html as htmlmod
import json
import os
import re
import sys
import tempfile
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import (
        Paragraph, Spacer, PageBreak, KeepTogether, Flowable,
        Table, TableStyle, BaseDocTemplate, PageTemplate, Frame,
        NextPageTemplate,
    )
except ImportError:
    print("[ERROR] reportlab is not installed. Run: pip install reportlab",
          file=sys.stderr)
    sys.exit(1)


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
PARTS = REPO_ROOT / "data" / "parts.json"
VERSION_JSON = REPO_ROOT / "data" / "version.json"
CORPUS = REPO_ROOT / "pmn_corpus_for_ai.md"
FONT_DIR = REPO_ROOT / "assets" / "fonts"

OUT_PRIMARY = REPO_ROOT / "dist" / "PMN_Latest.pdf"
OUT_MIRROR = REPO_ROOT / "public_static" / "PMN_Latest.pdf"
OUT_MD = REPO_ROOT / "dist" / "PMN_Latest.md"


def _docx_kanonik():
    """DOCX kanonik = versi TERTINGGI di clean_outputs, bukan nama yang dikeraskan.

    T4.1 semula menuliskan v120 apa adanya. Kenaikan ke v121 mematahkannya diam-diam:
    penjaga akan membandingkan korpus terhadap berkas LAMA dan selalu lolos.
    Penjaga yang namanya dikeraskan berhenti menjaga pada rilis berikutnya.
    """
    d = REPO_ROOT.parent / "private" / "clean_outputs"

    def kunci(q):
        m = re.search(r"PMN_Framework_v(\d+(?:[._]\d+)*)\.docx$", q.name, re.I)
        return tuple(int(x) for x in re.split(r"[._]", m.group(1))) if m else ()

    c = (sorted(d.glob("PMN_Framework_v*.docx"), key=kunci, reverse=True)
         if d.exists() else [])
    return c[0] if c else d / "PMN_Framework_v120.docx"


DOCX = _docx_kanonik()


def versi() -> str:
    """Version label from the single authoritative file. Never a literal."""
    try:
        return json.loads(VERSION_JSON.read_text(encoding="utf-8"))["version"]
    except Exception as e:
        print(f"[ERROR] cannot read {VERSION_JSON}: {e}", file=sys.stderr)
        sys.exit(1)


# --------------------------------------------------------------------------
# Palette — the site's LIGHT theme (src/index.css), which is the print theme.
#
# The page itself stays white. The light theme's #eee3d0 "warm amber paper" is
# right on a screen and wrong across hundreds of sheets: a full-bleed tint is
# ink the reader pays for on every page they print. The palette is spent on
# structure instead — rules, part numerals, section ids, running heads.
# --------------------------------------------------------------------------
INK = HexColor("#170e08")
INK2 = HexColor("#2b1b10")
ACC = HexColor("#8b1e14")
ACC2 = HexColor("#6a1610")
MUTE = HexColor("#533a21")
RULE = HexColor("#bda882")
TINT = HexColor("#dccdac")


# --------------------------------------------------------------------------
# Fonts — detect and fall back. See module docstring.
# --------------------------------------------------------------------------
# The site splits the two roles (style.css): Libre Baskerville sets headings,
# Lora sets body. The PDF follows the same split rather than using one face for
# everything, so a reader who knows the site recognises the document.
#
# Both are SIL OFL. google/fonts ships them ONLY as variable fonts, and
# reportlab cannot select a weight axis — it renders the default instance. So
# static masters are cut locally with fontTools (OFL permits modification) and
# vendored under assets/fonts/ with each family's OFL.txt.
#
# THE TRAP THAT COST AN HOUR, RECORDED SO IT IS NOT REPEATED: cutting the
# statics with `updateFontNames=False` leaves Lora-Bold.ttf carrying the
# internal PostScript name "Lora-Regular". Two font resources in the PDF then
# share one BaseFont, the renderer resolves both to the same embedded face, and
# bold is REGISTERED but never bold. Nothing errors. Measured ink coverage of
# "HHnnoo" was 1.00x against regular where Times-Bold is 1.53x; after
# `updateFontNames=True` it is 1.60x. Metadata said 700 the whole time.
KELUARGA = {
    "Lora": ("Lora-Regular.ttf", "Lora-Bold.ttf",
             "Lora-Italic.ttf", "Lora-BoldItalic.ttf"),
    "LibreBaskerville": ("LibreBaskerville-Regular.ttf",
                         "LibreBaskerville-Bold.ttf",
                         "LibreBaskerville-Italic.ttf",
                         "LibreBaskerville-BoldItalic.ttf"),
}

BASE14 = ("Times-Roman", "Times-Bold", "Times-Italic", "Times-BoldItalic")

_FONT_CACHE = []


def _daftar(family):
    """Register one vendored family. Returns its 4 names, or None."""
    berkas = KELUARGA.get(family)
    if not berkas:
        return None
    paths = [FONT_DIR / f for f in berkas]
    if not all(p.exists() for p in paths):
        return None
    try:
        names = []
        for suffix, p in zip(("", "-Bold", "-Italic", "-BoldItalic"), paths):
            n = family + suffix
            pdfmetrics.registerFont(TTFont(n, str(p)))
            names.append(n)
        pdfmetrics.registerFontFamily(
            family, normal=names[0], bold=names[1],
            italic=names[2], boldItalic=names[3])
        return tuple(names)
    except Exception as e:
        print(f"[warn] vendored font {family} unusable, falling back: {e}")
        return None


def daftarkan_font():
    """Resolve the body and heading faces, each falling back on its own.

    Returns (body4, head2, embedded: bool). Any failure degrades to base-14
    rather than raising: on the deploy runner a missing font must cost
    typography, never the build.
    """
    if _FONT_CACHE:
        return _FONT_CACHE[0]
    body = _daftar("Lora")
    head = _daftar("LibreBaskerville")
    tertanam = bool(body or head)
    body = body or BASE14
    head2 = (head[0], head[1]) if head else (body[0], body[1])
    hasil = (body, head2, tertanam)
    _FONT_CACHE.append(hasil)
    return hasil


# --------------------------------------------------------------------------
# HTML -> reportlab inline markup
#
# The part data contains exactly three tags: <p>, <strong>, <em> (verified
# across all 21 parts before this was written). <strong>/<em> become <b>/<i>,
# which reportlab's paragraph parser understands. Anything else is dropped —
# and COUNTED, because a construct silently dropped is how the emphasis went
# missing in the first place. An unexpected tag fails the build.
# --------------------------------------------------------------------------
KEEP = {"strong": "b", "em": "i", "b": "b", "i": "i"}
DIBUANG = {}

_TAG = re.compile(r"<\s*(/?)\s*([a-zA-Z][a-zA-Z0-9]*)[^>]*>")


def html_ke_rl(frag: str) -> str:
    """Convert one HTML fragment to reportlab inline markup, losing nothing."""
    def ganti(m):
        tutup, nama = m.group(1), m.group(2).lower()
        if nama in KEEP:
            return "\x00%s%s\x01" % (tutup, KEEP[nama])
        if nama != "p":
            DIBUANG[nama] = DIBUANG.get(nama, 0) + 1
        return ""

    s = _TAG.sub(ganti, frag)
    s = htmlmod.unescape(s)
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = s.replace("\x00", "<").replace("\x01", ">")
    return re.sub(r"[ \t]+", " ", s).strip()


def paragraf_dari(html_field) -> list:
    """Split an html field into paragraph strings in reportlab markup."""
    raw = "".join(html_field) if isinstance(html_field, list) else (html_field or "")
    keluar = []
    for bagian in re.split(r"</\s*p\s*>", raw):
        t = html_ke_rl(bagian)
        if t:
            keluar.append(t)
    return keluar


# --------------------------------------------------------------------------
# Flowables
# --------------------------------------------------------------------------
class Garis(Flowable):
    """A hairline rule."""

    def __init__(self, lebar, tebal=0.6, warna=RULE, spasi=3):
        Flowable.__init__(self)
        self.lebar, self.tebal, self.warna, self.spasi = lebar, tebal, warna, spasi
        self.width, self.height = lebar, tebal + spasi

    def draw(self):
        self.canv.setStrokeColor(self.warna)
        self.canv.setLineWidth(self.tebal)
        self.canv.line(0, self.spasi, self.lebar, self.spasi)


class PitaPart(Flowable):
    """The tinted band that opens a part.

    It carries the part label rather than sitting empty, and it marks the page
    so the running head can be suppressed here: a part-opening page showing the
    PREVIOUS part's name in its header is worse than showing none, and that is
    what a header drawn at page START would print.
    """

    def __init__(self, lebar, label, font_bold, tinggi=20 * mm):
        Flowable.__init__(self)
        self.width, self.height = lebar, tinggi
        self.label, self.font_bold = label, font_bold

    def draw(self):
        c = self.canv
        c.setFillColor(TINT)
        c.rect(0, 0, self.width, self.height, stroke=0, fill=1)
        c.setFillColor(ACC)
        c.rect(0, 0, self.width, 1.8, stroke=0, fill=1)
        if self.label:
            c.setFillColor(ACC2)
            c.setFont(self.font_bold, 10)
            c.drawString(5 * mm, 6.5 * mm, self.label)
        c._pmn_buka = True


# --------------------------------------------------------------------------
# Document template: running heads, folios, outline, recorded headings
# --------------------------------------------------------------------------
class DokumenPMN(BaseDocTemplate):
    """Carries running-head state, records headings, writes PDF bookmarks."""

    def __init__(self, *a, **kw):
        self.font = kw.pop("font")
        self.outline = kw.pop("outline", True)
        self.offset_hal = kw.pop("offset_hal", 0)
        BaseDocTemplate.__init__(self, *a, **kw)
        self.rekam = []
        self.part_kini = ""
        self.seksi_kini = ""

    def afterFlowable(self, flowable):
        nama = getattr(getattr(flowable, "style", None), "name", "")
        if nama not in ("PMNPart", "PMNSec"):
            return
        level = 0 if nama == "PMNPart" else 1
        teks = flowable.getPlainText()
        self.rekam.append((level, teks, self.page))
        if level == 0:
            self.part_kini, self.seksi_kini = teks, ""
        else:
            self.seksi_kini = teks
        if self.outline:
            kunci = "pmn-%d" % len(self.rekam)
            self.canv.bookmarkPage(kunci)
            self.canv.addOutlineEntry(teks, kunci, level=level, closed=1)


def hias_halaman(canv, doc):
    """Running head, hairline, and folio — drawn at page END.

    Drawing this at page START would read the heading state left over from the
    PREVIOUS page, which is wrong in the two places it shows: a part-opening
    page would carry the previous part's name, and the contents pages would
    draw a hairline with nothing above it. At page end the state describes the
    page that was actually just filled.
    """
    canv.saveState()
    l = doc.leftMargin
    r = doc.pagesize[0] - doc.rightMargin
    atas = doc.pagesize[1] - doc.topMargin + 7 * mm

    buka = getattr(canv, "_pmn_buka", False)
    canv._pmn_buka = False

    # No head on a part-opening page (book convention), and none where there
    # is no heading to name — the rule is not drawn either, so no orphan line.
    if not buka and doc.part_kini:
        canv.setFont(doc.font[2], 7.6)
        canv.setFillColor(MUTE)
        canv.drawString(l, atas, (doc.part_kini or "")[:60])
        canv.drawRightString(r, atas, (doc.seksi_kini or "")[:46])
        canv.setStrokeColor(RULE)
        canv.setLineWidth(0.5)
        canv.line(l, atas - 2.4 * mm, r, atas - 2.4 * mm)

    canv.setFont(doc.font[0], 8.4)
    canv.setFillColor(MUTE)
    canv.drawCentredString((l + r) / 2.0, doc.bottomMargin - 10 * mm,
                           str(canv.getPageNumber()))
    canv.restoreState()


def polos(canv, doc):
    return


# --------------------------------------------------------------------------
# Styles
# --------------------------------------------------------------------------
def gaya(font, head):
    reg, bold, ital, bi = font
    hreg, hbold = head
    body = ParagraphStyle(
        "body", fontName=reg, fontSize=10.3, leading=14.8,
        alignment=4, spaceAfter=7, textColor=INK)
    return {
        "body": body,
        "sec": ParagraphStyle(
            "PMNSec", parent=body, fontName=hbold, fontSize=11.6, leading=15,
            spaceBefore=15, spaceAfter=2, alignment=0, textColor=ACC2,
            keepWithNext=1),
        "part": ParagraphStyle(
            "PMNPart", parent=body, fontName=hbold, fontSize=21, leading=26,
            spaceBefore=5, spaceAfter=5, alignment=0, textColor=ACC),
        "partnum": ParagraphStyle(
            "partnum", parent=body, fontName=hbold, fontSize=9.4, leading=12,
            alignment=0, textColor=MUTE, spaceAfter=2),
        "pre": ParagraphStyle(
            "pre", parent=body, fontName=ital, fontSize=10.2, leading=15.2,
            textColor=INK2, leftIndent=8 * mm, rightIndent=8 * mm, spaceAfter=8),
        "cover": ParagraphStyle(
            "cover", parent=body, fontName=hbold, fontSize=29, leading=34,
            alignment=0, textColor=INK, spaceAfter=4),
        "coversub": ParagraphStyle(
            "coversub", parent=body, fontName=ital, fontSize=12.2, leading=17.5,
            alignment=0, textColor=MUTE, spaceAfter=3),
        "hdr": ParagraphStyle(
            "hdr", parent=body, fontName=hbold, fontSize=17, leading=21,
            alignment=0, textColor=ACC, spaceAfter=3),
        "toc0": ParagraphStyle(
            "toc0", parent=body, fontName=hbold, fontSize=9.9, leading=13.6,
            spaceBefore=6, textColor=ACC2, alignment=0),
        "toc1": ParagraphStyle(
            "toc1", parent=body, fontName=reg, fontSize=9.0, leading=12.2,
            leftIndent=8 * mm, textColor=INK2, alignment=0),
        "tocn": ParagraphStyle(
            "tocn", parent=body, fontName=reg, fontSize=9.0, leading=12.2,
            alignment=2, textColor=MUTE),
    }


LABEL_TANPA_NOMOR = {"preface", "coda", "bibliography", "intellectual debts"}


def label_part(nama: str) -> str:
    n = (nama or "").strip()
    return n if n.lower() in LABEL_TANPA_NOMOR else (f"Part {n}" if n else "")


# --------------------------------------------------------------------------
# Story construction — a FRESH list each call. reportlab consumes flowables,
# so the same objects cannot be reused across two builds.
# --------------------------------------------------------------------------
def cerita_sampul(g, lebar, label, data):
    return [
        Spacer(1, 74 * mm),
        Garis(lebar, 2.0, ACC, 0),
        Spacer(1, 7 * mm),
        Paragraph("Progressive Materialist<br/>Naturalism", g["cover"]),
        Spacer(1, 3 * mm),
        Paragraph("A naturalist framework for analysing material reality, "
                  "minimising structural suffering, and maximising genuine "
                  "becoming.", g["coversub"]),
        Spacer(1, 6 * mm),
        Garis(lebar, 0.7, RULE, 0),
        Spacer(1, 4 * mm),
        Paragraph("Nova Dharma", g["coversub"]),
        Spacer(1, 1 * mm),
        Paragraph("%s &#183; %d parts &#183; %d sections"
                  % (label, len(data), sum(len(p.get("subs", [])) for p in data)),
                  g["coversub"]),
    ]


def cerita_isi(g, lebar, data, font_bold):
    keluar = []
    n_sec = n_par = 0
    for pt in data:
        keluar += [
            PageBreak(),
            PitaPart(lebar, label_part(str(pt.get("part", ""))).upper(),
                     font_bold),
            Spacer(1, 6 * mm),
            Paragraph(str(pt.get("title", "")).strip(), g["part"]),
            Garis(lebar, 1.0, ACC, 3),
            Spacer(1, 4 * mm),
        ]
        pre = pt.get("preamble_html") or []
        if isinstance(pre, str):
            pre = [pre]
        for blok in pre:
            for t in paragraf_dari(blok):
                keluar.append(Paragraph(t, g["pre"]))
        if pre:
            keluar += [Spacer(1, 2 * mm), Garis(lebar, 0.5, RULE, 2),
                       Spacer(1, 3 * mm)]

        for s in pt.get("subs", []):
            n_sec += 1
            sid = str(s.get("id", "")).strip()
            stitle = str(s.get("title", "")).strip()
            # 230 of the 235 ids are section numbers (1.1, 1.6b, 7.3c-i). The
            # other five are slugs — "preface", "bibliography" — and each is
            # only the kebab-case of its own title, so printing it gives
            # "preface   Preface". Show the id only when it numbers something.
            bernomor = bool(re.match(r"^[0-9]", sid))
            kepala = ("%s &nbsp; %s" % (sid, stitle)) if bernomor else stitle
            keluar.append(KeepTogether([
                Paragraph(kepala, g["sec"]),
                Garis(lebar * 0.22, 0.9, ACC, 2),
            ]))
            for t in paragraf_dari(s.get("html")):
                n_par += 1
                keluar.append(Paragraph(t, g["body"]))
    return keluar, n_sec, n_par


def cerita_daftar_isi(g, lebar, rekam, offset):
    """Contents table. Fixed-width right column: a page number gaining a digit
    cannot re-wrap a line, so the layout is independent of the offset."""
    baris = []
    for level, teks, hal in rekam:
        baris.append([
            Paragraph(teks, g["toc0"] if level == 0 else g["toc1"]),
            Paragraph(str(hal + offset), g["tocn"]),
        ])
    if not baris:
        return []
    tb = Table(baris, colWidths=[lebar - 15 * mm, 15 * mm], repeatRows=0)
    tb.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 0),
        ("RIGHTPADDING", (0, 0), (-1, -1), 0),
        ("TOPPADDING", (0, 0), (-1, -1), 0.6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 0.6),
    ]))
    # Catatan urutan Part, memakai KALIMAT NASKAH SENDIRI.
    #
    # Daftar isi berbunyi XIII, XV, XVI, XVII, XIV, dan di halaman cetak itu
    # terbaca seperti salah cetak. Ia bukan: urutan itu urutan DOCX kanonik.
    #
    # Dan naskah sudah menjelaskannya di "How to Read This Document" — saya
    # mengusulkan menambahkan penjelasan yang ternyata sudah ada, lalu
    # menemukannya hanya setelah mencari dengan kosakata naskah (AY.1). Yang
    # benar-benar kurang bukan penjelasannya melainkan KEHADIRANNYA di
    # permukaan tempat keganjilan itu terlihat. Jadi kalimatnya dikutip, bukan
    # dikarang, dan atribusinya disebut supaya pembaca bisa memeriksanya.
    catatan = ParagraphStyle(
        "tocnote", parent=g["body"], fontName=g["pre"].fontName,
        fontSize=9.2, leading=13, textColor=MUTE, spaceAfter=0,
        leftIndent=0, rightIndent=0)
    return [
        Paragraph("Contents", g["hdr"]),
        Garis(lebar, 1.2, ACC, 2),
        Spacer(1, 2.5 * mm),
        Paragraph(
            "Part XIV stands after Part XVII. That is the manuscript’s own "
            "order, not a slip: it is &#8220;the living summary &#8212; positioned last "
            "because it must be read last to be read honestly&#8221; "
            "(How to Read This Document).", catatan),
        Spacer(1, 4 * mm),
        tb,
    ]


def dokumen(path, font, label, outline=True):
    doc = DokumenPMN(
        str(path), pagesize=A4,
        leftMargin=23 * mm, rightMargin=23 * mm,
        topMargin=27 * mm, bottomMargin=25 * mm,
        title="PMN Framework %s" % label,
        # /Author memakai NAMA PENA. Nova 2026-09-17: tidak boleh ada nama
        # asli di mana pun; "Nova Dharma" adalah nama pena dan sudah terbit
        # di situs dan llms.txt sejak lama.
        #
        # /Creator, /Producer dan /Subject tetap Anonymous: itu medan
        # PERKAKAS, bukan penulis, dan mengisinya hanya menambah sidik jari
        # tentang mesin yang membangun berkas ini.
        author="Nova Dharma", creator="Anonymous",
        producer="Anonymous", subject="Anonymous",
        font=font, outline=outline,
    )
    lebar = doc.pagesize[0] - doc.leftMargin - doc.rightMargin
    bingkai = Frame(doc.leftMargin, doc.bottomMargin, lebar,
                    doc.pagesize[1] - doc.topMargin - doc.bottomMargin, id="F")
    doc.addPageTemplates([
        PageTemplate(id="polos", frames=[bingkai], onPage=polos),
        # onPageEnd, not onPage: see hias_halaman.
        PageTemplate(id="isi", frames=[bingkai], onPage=polos,
                     onPageEnd=hias_halaman),
    ])
    return doc, lebar


def bangun(data, out_path: Path, label: str):
    font, head, tertanam = daftarkan_font()
    g = gaya(font, head)

    tmpdir = tempfile.mkdtemp(prefix="pmnpdf_")
    t1 = Path(tmpdir) / "pass1.pdf"
    t2 = Path(tmpdir) / "pass2.pdf"

    # ---- pass 1: no contents table; learn where every heading lands -----
    d1, lebar = dokumen(t1, font, label, outline=False)
    s1 = cerita_sampul(g, lebar, label, data)
    s1.append(NextPageTemplate("isi"))
    isi1, n_sec, n_par = cerita_isi(g, lebar, data, head[1])
    d1.build(s1 + isi1)
    rekam = list(d1.rekam)
    hal_tanpa_toc = d1.page

    # ---- pass 2: how many pages does the contents table itself take? ----
    d2, _ = dokumen(t2, font, label, outline=False)
    d2.build(cerita_daftar_isi(g, lebar, rekam, 0))
    hal_toc = d2.page

    # ---- pass 3: the real document, page numbers shifted by exactly that
    d3, _ = dokumen(out_path, font, label, outline=True)
    s3 = cerita_sampul(g, lebar, label, data)
    s3.append(NextPageTemplate("isi"))
    s3.append(PageBreak())
    s3 += cerita_daftar_isi(g, lebar, rekam, hal_toc)
    isi3, _, _ = cerita_isi(g, lebar, data, head[1])
    d3.build(s3 + isi3)

    # Gate: the shift is only exact if pass 3 placed every heading exactly
    # hal_toc pages later than pass 1. If it did not, the contents table is
    # lying about page numbers, which is worse than having no contents table.
    geser = [(a[1], a[2] + hal_toc, b[2])
             for a, b in zip(rekam, d3.rekam) if a[2] + hal_toc != b[2]]

    try:
        for p in (t1, t2):
            p.unlink(missing_ok=True)
        os.rmdir(tmpdir)
    except OSError:
        pass

    return {
        "ukuran": os.path.getsize(out_path),
        "n_sec": n_sec,
        "n_par": n_par,
        "n_entri": len(rekam),
        "hal_toc": hal_toc,
        "hal_total": d3.page,
        "hal_tanpa_toc": hal_tanpa_toc,
        "tertanam": tertanam,
        "geser": geser,
    }


# --------------------------------------------------------------------------
# Staleness
# --------------------------------------------------------------------------
def llms_menyimpang(label: str) -> list:
    """Which llms.* copies disagree with data/version.json.

    Without this, the llms.* refresh only runs when the PDF happens to be
    stale. That is how they reached v120-for-six-releases in the first place:
    nothing recomputed them, and nothing compared them to anything either.
    Disagreement is itself a reason to rebuild.
    """
    angka = label.lstrip("v")
    menyimpang = []
    for p in ([REPO_ROOT / n for n in LLMS]
              + [REPO_ROOT / "public_static" / n for n in LLMS]
              + [REPO_ROOT / "dist" / n for n in LLMS]):
        if not p.exists():
            continue
        t = p.read_text(encoding="utf-8", errors="ignore")
        if p.suffix == ".json":
            m = re.search(r'"version"\s*:\s*"(\d+(?:\.\d+)?)"', t)
            if m and m.group(1) != angka:
                menyimpang.append(str(p.relative_to(REPO_ROOT)))
        else:
            lain = set(re.findall(r"\bv\d{3}(?:\.\d+)?\b", t)) - {label}
            if lain:
                menyimpang.append(str(p.relative_to(REPO_ROOT)))
    return menyimpang


def is_stale() -> bool:
    if not OUT_PRIMARY.exists() or not PARTS.exists():
        return True
    nyasar = llms_menyimpang(versi())
    if nyasar:
        print("[WARN] llms.* disagree with data/version.json: %s"
              % ", ".join(nyasar))
        return True
    if PARTS.stat().st_mtime > OUT_PRIMARY.stat().st_mtime:
        return True
    if CORPUS.exists() and CORPUS.stat().st_mtime > OUT_PRIMARY.stat().st_mtime:
        return True
    if DOCX.exists() and DOCX.stat().st_mtime > PARTS.stat().st_mtime:
        print("[WARN] canonical DOCX is newer than data/parts.json.")
        print("[WARN] re-run the importer before building, or the site and the")
        print("[WARN] PDF will agree with each other and both be wrong.")
        return True
    return False


LLMS = ("llms.txt", "llms.md", "llms.json")


def segarkan_llms(label: str, halaman: int) -> list:
    """Re-derive the version and page-count claims in the llms.* index files.

    These three files are the entry point every AI agent is pointed at, and
    they are hand-written: no script had ever touched them. On 2026-09-17 all
    three still said v120, six releases late, and llms.txt promised readers an
    "Official typeset publication (~660 pages)" — a description of the Word
    export that a5b45f3 replaced two days earlier.

    What made it invisible is worth stating: llms.txt pointed at
    PMN_Latest.md, PMN_Latest.md really was still v120, and so the index
    described its target accurately. A stale index correctly describing a
    stale artifact leaves nothing inconsistent for any gate to catch.

    So neither number is typed here any more. The version comes from
    data/version.json and the page count from the PDF this run just produced.
    """
    angka = label.lstrip("v")
    hari = __import__("datetime").date.today().isoformat()
    laporan = []

    # All THREE copies, and public_static is the one that decides. vite.config
    # sets publicDir: 'public_static', so vite copies public_static/* over
    # dist/* on every build. Patching dist alone would look correct here and
    # silently revert on the next `npm run build` — the same defect this
    # function exists to close, reintroduced by fixing the output instead of
    # the source. Measured before writing: root and public_static both still
    # said v120 while dist had been corrected.
    for p in [REPO_ROOT / n for n in LLMS] + \
             [REPO_ROOT / "public_static" / n for n in LLMS] + \
             [REPO_ROOT / "dist" / n for n in LLMS]:
        nama = p.name
        if not p.exists():
            continue
        asli = p.read_text(encoding="utf-8")
        t = asli
        if nama.endswith(".json"):
            t = re.sub(r'("version"\s*:\s*")\d+(?:\.\d+)?(")',
                       lambda m: m.group(1) + angka + m.group(2), t)
        else:
            t = re.sub(r"\bv\d{3}(?:\.\d+)?\b", label, t)
            # "(~)660 pages" and "660-page"
            t = re.sub(r"(~?)\d{3,4}(\s*-?\s*page)",
                       lambda m: m.group(1) + str(halaman) + m.group(2), t)
            t = re.sub(r"(~?)\d{3,4}(\s+pages)",
                       lambda m: m.group(1) + str(halaman) + m.group(2), t)
            t = re.sub(r"(Canonical Release\s+" + re.escape(label) +
                       r"\s*\()\d{4}-\d{2}-\d{2}(\))",
                       lambda m: m.group(1) + hari + m.group(2), t)
        if t != asli:
            p.write_text(t, encoding="utf-8")
            laporan.append(str(p.relative_to(REPO_ROOT)))
    return laporan


LLMS_FULL = "llms-full.txt"

KEPALA_FULL = """\
# PMN Framework {label} — complete content, single file, text/plain

This file exists for one reason, and it is a transport reason rather than an
editorial one.

GitHub Pages serves a fixed MIME type per extension and offers no way to
override it. Every Markdown artifact this project publishes — llms.md,
pmn_corpus_for_ai.md, PMN_Latest.md — is therefore returned as
`text/markdown; charset=utf-8`. Several AI web fetchers accept only text/plain,
text/html or application/json, and drop text/markdown before the body is ever
read. The content was correct and current the whole time; it simply never
arrived. Reported 2026-09-17 by an agent that could not open llms.md.

So the same content is published here at a `.txt` extension, which GitHub Pages
serves as `text/plain; charset=utf-8`. Nothing is abridged: this is the AI
grounding documentation followed by the complete manuscript corpus.

Generated by scripts/build_pdf.py — never edit this file by hand; it is
overwritten on every build.

================================================================================
PART 1 OF 2 — AI GROUNDING DOCUMENTATION (identical to llms.md)
================================================================================

"""

PEMISAH_FULL = """

================================================================================
PART 2 OF 2 — COMPLETE MANUSCRIPT CORPUS (identical to pmn_corpus_for_ai.md)
================================================================================

"""


def tulis_llms_full(label: str) -> int:
    """Publish the whole content once more as text/plain, in all three copies.

    Not a convenience: three of the five AI-facing artifacts were unreachable to
    fetchers that refuse text/markdown, and nothing on our side could detect it
    — the files were present, current and correct, and the bytes simply never
    got read. `.txt` is the one extension GitHub Pages maps to text/plain.
    """
    sumber_md = REPO_ROOT / "llms.md"
    if not (CORPUS.exists() and sumber_md.exists()):
        return 0
    isi = (KEPALA_FULL.format(label=label)
           + sumber_md.read_text(encoding="utf-8")
           + PEMISAH_FULL
           + CORPUS.read_text(encoding="utf-8"))
    n = 0
    for d in (REPO_ROOT, REPO_ROOT / "public_static", REPO_ROOT / "dist"):
        if not d.exists():
            continue
        p = d / LLMS_FULL
        if not p.exists() or p.read_text(encoding="utf-8") != isi:
            p.write_text(isi, encoding="utf-8")
            n += 1
    return n


def pastikan_aset_berversi(label: str) -> int:
    """Write dist/PMN_Framework_<label>.{pdf,md}; return how many were missing.

    "Latest" is the wrong name for a release asset — it is a moving target and
    becomes wrong the moment the next version ships — so create_release.py
    looks for the versioned names. Keeping them present is therefore a
    precondition of every release, not a side effect of a rebuild.
    """
    if not OUT_PRIMARY.exists():
        return 0
    dibuat = 0
    vpdf = REPO_ROOT / "dist" / f"PMN_Framework_{label}.pdf"
    vmd = REPO_ROOT / "dist" / f"PMN_Framework_{label}.md"
    if not vpdf.exists() or vpdf.read_bytes() != OUT_PRIMARY.read_bytes():
        vpdf.write_bytes(OUT_PRIMARY.read_bytes())
        dibuat += 1
    if CORPUS.exists():
        teks = CORPUS.read_text(encoding="utf-8")
        if not vmd.exists() or vmd.read_text(encoding="utf-8") != teks:
            vmd.write_text(teks, encoding="utf-8")
            dibuat += 1
    return dibuat


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    if not PARTS.exists():
        print(f"[ERROR] {PARTS} not found", file=sys.stderr)
        return 1

    basi = is_stale()
    if args.check:
        print("[check] PDF is %s" % ("STALE" if basi else "current"))
        return 2 if basi else 0
    if not basi and not args.force:
        # The versioned release assets must be recreated even here. vite
        # empties dist/ and then refills it from public_static/, and the
        # versioned copies do not live in public_static — so a full
        # `npm run build` deletes them, and this early return used to leave
        # them deleted. create_release.py looks for exactly these names; that
        # is how six releases shipped with no assets and the GitHub page kept
        # advertising v120 as Latest (BF.48). Same failure, new route.
        n = pastikan_aset_berversi(versi())
        nf = tulis_llms_full(versi())
        print("[ok] PDF is current with data/parts.json; nothing to do.")
        if nf:
            print("[ok] %s refreshed in %d copies" % (LLMS_FULL, nf))
        if n:
            print("[ok] restored %d versioned release asset(s) removed by vite" % n)
        return 0

    label = versi()
    data = json.loads(PARTS.read_text(encoding="utf-8"))
    OUT_PRIMARY.parent.mkdir(parents=True, exist_ok=True)
    r = bangun(data, OUT_PRIMARY, label)

    # Gate: an unexpected tag means the part data grew a construct this
    # converter does not render. Dropping it silently is how the emphasis was
    # lost for two days. Fail instead.
    tak_dikenal = {k: v for k, v in DIBUANG.items() if k != "p"}
    if tak_dikenal:
        print(f"[ERROR] unrendered tags in part data: {tak_dikenal}",
              file=sys.stderr)
        print("[ERROR] extend KEEP/html_ke_rl before shipping this PDF.",
              file=sys.stderr)
        return 1

    if r["geser"]:
        print("[ERROR] contents page numbers are not exact: %d headings moved"
              % len(r["geser"]), file=sys.stderr)
        for teks, diharap, nyata in r["geser"][:6]:
            print(f"[ERROR]   {teks[:48]!r} expected p{diharap}, got p{nyata}",
                  file=sys.stderr)
        return 1

    print(f"[ok] {OUT_PRIMARY} ({r['ukuran']:,} bytes)")
    print("     %d parts, %d sections, %d paragraphs"
          % (len(data), r["n_sec"], r["n_par"]))
    print("     %d pages (contents table: %d), %d outline entries"
          % (r["hal_total"], r["hal_toc"], r["n_entri"]))
    print("     fonts: %s"
          % ("embedded OFL" if r["tertanam"] else "base-14 fallback"))
    print("     contents page numbers verified exact")

    if OUT_MIRROR.parent.exists():
        OUT_MIRROR.write_bytes(OUT_PRIMARY.read_bytes())
        print(f"[ok] {OUT_MIRROR} (mirror)")

    # The .md download was NOT made a build output by a5b45f3 — only the PDF
    # was. It stayed byte-identical to v120 for six releases while llms.txt
    # described it accurately, so nothing anywhere was inconsistent enough for
    # any gate to notice. Same bug, different file, survived its own fix.
    if CORPUS.exists():
        teks = CORPUS.read_text(encoding="utf-8")
        OUT_MD.write_text(teks, encoding="utf-8")
        # public_static/ is vite's publicDir and is copied over dist/ on every
        # build, so writing only dist/ would be undone by the next build. Its
        # copy was still byte-identical to v120 when this was added.
        if OUT_MIRROR.parent.exists():
            (OUT_MIRROR.parent / OUT_MD.name).write_text(teks, encoding="utf-8")
        print(f"[ok] {OUT_MD.name} (AI corpus, now a build output; both copies)")
        pastikan_aset_berversi(label)
        print("[ok] PMN_Framework_%s.pdf + .md (versioned release assets)"
              % label)

    nf = tulis_llms_full(label)
    if nf:
        print("[ok] %s written in %d copies (text/plain twin)" % (LLMS_FULL, nf))

    disegarkan = segarkan_llms(label, r["hal_total"])
    if disegarkan:
        print("[ok] %s re-derived (%s, %d pages)"
              % (", ".join(disegarkan), label, r["hal_total"]))

    print("[ok] PDF is a build output of data/parts.json.")
    return 2


if __name__ == "__main__":
    sys.exit(main())
