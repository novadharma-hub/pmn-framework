#!/usr/bin/env python3
"""
build_pdf.py — Regenerate PMN_Latest.pdf from the canonical corpus.

WHY THIS EXISTS
---------------
Until 2026-09-15, PMN_Latest.pdf was byte-identical to PMN_Framework_v118.6.pdf
(5 September). Every text fix shipped to the site left the direct-download PDF
silently stale. A PDF that disagrees with the site is worse than no PDF: it is
the artifact a careful reader trusts most.

This script makes the PDF a *build output* of the corpus, not a hand-carried
artifact. It runs after `modularizer.py compile` and before `npm run build`.

PIPELINE POSITION
-----------------
  DOCX (canonical, private)  ->  data/parts/*.json  ->  modularizer compile
  ->  pmn_corpus_for_ai.md   ->  [THIS SCRIPT]       ->  dist/PMN_Latest.pdf
  ->  npm run build          ->  dist/ (deployed)

STALENESS GUARD (the whole point)
--------------------------------
Before writing, this script compares the corpus mtime to the PDF mtime.
If the corpus is newer, the existing PDF is stale and gets regenerated.
If the PDF is already current, the script exits 0 with a "current" message
so it is safe to run unconditionally in CI / npm scripts.

TYPGRAPHY TRADE-OFF (known, deliberate)
---------------------------------------
The original PDFs were rendered by MS Word (COM automation, scripts/docx_to_pdf.py).
Word COM is unavailable in this environment (Server execution failed for both
Word and Excel), LibreOffice is not installed, and weasyprint/LaTeX cannot
be installed here (missing GTK / no TeX). This script renders plain text via
reportlab instead. Result: typographically plainer than the Word-rendered
PDFs, but it can never silently drift out of sync with the corpus again.
If Word COM becomes available, docx_to_pdf.py remains the better path for
typography; this script remains the fallback that guarantees freshness.

USAGE
-----
    python build_pdf.py              # regenerate only if stale
    python build_pdf.py --force      # regenerate regardless
    python build_pdf.py --check      # only report staleness, no write

Exit codes: 0 success/current, 1 error, 2 stale-and-regenerated.
"""

import argparse
import html
import os
import re
import sys
from pathlib import Path

try:
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.units import mm
    from reportlab.platypus import (
        Paragraph, SimpleDocTemplate, Spacer, PageBreak, KeepTogether,
    )
except ImportError:
    print("[ERROR] reportlab is not installed. Run: pip install reportlab", file=sys.stderr)
    sys.exit(1)


HERE = Path(__file__).resolve().parent
REPO_ROOT = HERE.parent
CORPUS = REPO_ROOT / "pmn_corpus_for_ai.md"
OUT_PRIMARY = REPO_ROOT / "dist" / "PMN_Latest.pdf"
OUT_MIRROR = REPO_ROOT / "public_static" / "PMN_Latest.pdf"
# Canonical source DOCX (parent of public/). T4.1 staleness guard.
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
    c = sorted(d.glob("PMN_Framework_v*.docx"), key=kunci, reverse=True) if d.exists() else []
    return c[0] if c else d / "PMN_Framework_v120.docx"


DOCX = _docx_kanonik()

MANUSCRIPT_MARKER = "## \U0001f4dd MANUSCRIPT PARTS & SECTIONS"
TITLE = "PMN Framework v120"


# --------------------------------------------------------------------------
# Corpus parsing
# --------------------------------------------------------------------------

def parse_corpus(raw: str):
    """Split the corpus markdown manuscript into ordered blocks.

    Returns a list of (kind, text) where kind is one of:
      part | sec | p
    """
    i = raw.find(MANUSCRIPT_MARKER)
    if i < 0:
        print(f"[ERROR] manuscript marker {MANUSCRIPT_MARKER!r} not found in corpus", file=sys.stderr)
        sys.exit(1)

    manuscript = raw[i:]
    blocks = []
    for line in manuscript.split("\n"):
        line = line.rstrip()
        if not line:
            continue
        if line.startswith("#### Section"):
            blocks.append(("sec", line[13:].strip()))
        elif line.startswith("### Part"):
            blocks.append(("part", line[8:].strip()))
        elif line.startswith("## "):
            continue
        else:
            text = html.unescape(line).replace("&#x27;", "'")
            text = text.replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            text = re.sub(r"\*\*(.+?)\*\*", r"\1", text)
            text = re.sub(r"\*(.+?)\*", r"\1", text)
            text = re.sub(r"`(.+?)`", r"\1", text)
            blocks.append(("p", text))
    return blocks


# --------------------------------------------------------------------------
# PDF rendering
# --------------------------------------------------------------------------

def build_pdf(blocks, out_path: Path) -> int:
    doc = SimpleDocTemplate(
        str(out_path),
        pagesize=A4,
        leftMargin=22 * mm, rightMargin=22 * mm,
        topMargin=20 * mm, bottomMargin=20 * mm,
        title=TITLE, author="Anonymous", creator="Anonymous",
        producer="Anonymous", subject="Anonymous",
    )

    body = ParagraphStyle(
        "body", fontName="Times-Roman", fontSize=10.5, leading=14.5,
        alignment=4, spaceAfter=8, textColor=(0.07, 0.09, 0.11),
    )
    sec_style = ParagraphStyle(
        "sec", parent=body, fontName="Times-Bold", fontSize=11.5,
        leading=15, spaceBefore=14, spaceAfter=7, alignment=0,
    )
    part_style = ParagraphStyle(
        "part", parent=sec_style, fontSize=14, leading=18,
        spaceBefore=22, spaceAfter=12,
    )

    # Long manuscript paragraphs can exceed reportlab's per-paragraph limit;
    # chunk them so nothing is silently dropped.
    MAX_CHARS = 3000

    story = []
    for kind, text in blocks:
        if kind == "p":
            for j in range(0, len(text), MAX_CHARS):
                chunk = text[j:j + MAX_CHARS]
                story.append(Paragraph(chunk, body))
        elif kind == "sec":
            story.append(Spacer(1, 4))
            story.append(KeepTogether(Paragraph(text, sec_style)))
        elif kind == "part":
            story.append(PageBreak())
            story.append(Paragraph(text, part_style))

    doc.build(story)
    return os.path.getsize(out_path)


# --------------------------------------------------------------------------
# Main
# --------------------------------------------------------------------------

def is_stale() -> bool:
    if not OUT_PRIMARY.exists() or not CORPUS.exists():
        return True
    if CORPUS.stat().st_mtime > OUT_PRIMARY.stat().st_mtime:
        return True
    # T4.1: the corpus itself must be current with the canonical DOCX. If the
    # DOCX is newer than the corpus, someone edited the source without running
    # `modularizer compile` — the corpus (and therefore the site AND the PDF)
    # would both be consistently wrong. Detect it, don't inherit it.
    if DOCX.exists() and DOCX.stat().st_mtime > CORPUS.stat().st_mtime:
        print("[WARN] canonical DOCX is newer than the compiled corpus.")
        print("[WARN] run `python3 modularizer.py compile` before building, or the")
        print("[WARN] site and PDF will agree with each other and both be wrong.")
        return True
    return False


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--force", action="store_true", help="regenerate regardless of staleness")
    ap.add_argument("--check", action="store_true", help="only report staleness; do not write")
    args = ap.parse_args()

    if not CORPUS.exists():
        print(f"[ERROR] corpus not found: {CORPUS}", file=sys.stderr)
        return 1

    raw = CORPUS.read_text(encoding="utf-8")
    blocks = parse_corpus(raw)

    stale = is_stale()
    if args.check:
        print(f"corpus mtime : {CORPUS.stat().st_mtime}")
        print(f"pdf mtime    : {OUT_PRIMARY.stat().st_mtime if OUT_PRIMARY.exists() else 'absent'}")
        print("STATUS       :", "STALE" if stale else "CURRENT")
        return 0

    if not stale and not args.force:
        print(f"[skip] {OUT_PRIMARY.name} is current with corpus ({len(blocks)} blocks)")
        return 0

    print(f"[build] regenerating from {len(blocks)} blocks ({len(raw):,} chars)")
    OUT_PRIMARY.parent.mkdir(parents=True, exist_ok=True)
    size = build_pdf(blocks, OUT_PRIMARY)

    # Mirror to public_static/ so both read paths stay identical.
    OUT_MIRROR.parent.mkdir(parents=True, exist_ok=True)
    OUT_MIRROR.write_bytes(OUT_PRIMARY.read_bytes())

    print(f"[ok] {OUT_PRIMARY} ({size:,} bytes)")
    print(f"[ok] {OUT_MIRROR} (mirror)")

    # Salinan BERVERSI. `create_release.py` mencari
    # dist/PMN_Framework_<tag>.pdf dan .md; sejak PDF jadi keluaran build
    # (a5b45f3) build hanya menulis PMN_Latest.*, sehingga otomasi rilis
    # tak pernah menemukan asetnya. Enam versi terbit tanpa tag maupun
    # release, dan halaman GitHub tetap mengiklankan v120 sebagai "Latest".
    #
    # "Latest" juga nama yang salah untuk aset release: ia sasaran bergerak,
    # dan menempelkannya pada tag tetap membuatnya keliru begitu versi
    # berikutnya terbit. Aset release wajib berversi.
    try:
        import json
        vf = REPO_ROOT / "data" / "version.json"
        tag = json.loads(vf.read_text(encoding="utf-8"))["version"]
        vpdf = REPO_ROOT / "dist" / f"PMN_Framework_{tag}.pdf"
        vmd = REPO_ROOT / "dist" / f"PMN_Framework_{tag}.md"
        vpdf.write_bytes(OUT_PRIMARY.read_bytes())
        vmd.write_text(CORPUS.read_text(encoding="utf-8"), encoding="utf-8")
        print(f"[ok] {vpdf.name} + {vmd.name} (aset release berversi)")
    except Exception as e:
        print(f"[warn] salinan berversi gagal: {e}")
    print("[ok] PDF is now a build output of the corpus.")
    return 2 if stale else 0


if __name__ == "__main__":
    sys.exit(main())
