#!/usr/bin/env python3
"""Gate: the glossary's categories (glg.json) must name real entries (gl.json).

Found 2026-09-23 in a phone audit: the glossary page said "246 of 239
terms". gl.json had been updated (capture stages renamed and a fifth added,
"seven" -> "eight diagnostic questions", If -> Ef, a typo fixed, Ec added),
but glg.json still listed seven of the old names. The category view showed
names that no longer had definitions, and the nine current terms fell into
"Other terms". Nothing compared the two files, so nobody noticed.

A category naming a term that has no definition is an error and fails the
build. A defined term with no category is only a warning: the page still
shows it, under "Other terms".

Usage: python3 scripts/check_glossary.py   (run by `npm run build`)
"""
import json
import sys
from pathlib import Path

DATA = Path(__file__).resolve().parent.parent / "public_static" / "data"


def main() -> int:
    gl = json.loads((DATA / "gl.json").read_text(encoding="utf-8"))
    glg = json.loads((DATA / "glg.json").read_text(encoding="utf-8"))
    dikategorikan = {t for terms in glg.values() for t in terms}

    basi = sorted(dikategorikan - set(gl))
    tanpa_kategori = sorted(set(gl) - dikategorikan)

    for t in tanpa_kategori:
        print("[WARN] glossary term has no category (shown under Other terms): %r" % t)
    if basi:
        for t in basi:
            print("[ERROR] glg.json lists %r, which has no entry in gl.json" % t,
                  file=sys.stderr)
        print("[ERROR] rename or remove these in glg.json (all copies).",
              file=sys.stderr)
        return 1
    print("[ok] glossary: %d terms, %d categorised" % (len(gl), len(set(gl) & dikategorikan)))
    return 0


if __name__ == "__main__":
    sys.exit(main())
