#!/usr/bin/env python3
"""Publish the manuscript in forms a crawler or an AI fetcher can actually read.

Reported 2026-09-23 by an agent that tried to read the site and could not:

  * The home page is a 2.9 KB HTML shell; the text arrives through JavaScript,
    so any crawler that does not run JS sees nothing at all.
  * The per-Part JSON files are 60–320 KB of escaped HTML. Fetchers truncate
    them mid-Part, and the reader never learns that the Part continued.
  * llms-full.txt is 2.4 MB (~450k tokens). In practice a fetcher reads only
    its opening, which is the glossary.
  * The Pages domain is not in any search index, and many AI fetchers may only
    open URLs that appeared in a search result or in the conversation.

Nothing here changes the content. It re-publishes data/parts.json, after vite
has built dist/, as:

  txt/index.txt           every section, its plain-text URL and size, in order
  txt/<section>.txt       one section as plain text (largest ~55 KB)
  txt/part_<Part>.txt     one Part as plain text
  read/index.html         static contents page, no JavaScript
  read/<section>.html     one section as static HTML, no JavaScript
  sitemap.xml             every URL above that a search engine should index

It writes into dist/ only and runs on every `npm run build`, so it cannot
drift from parts.json and never needs committing (see .gitignore). Standard
library only: the Pages runner must not need anything new.

Usage: python3 scripts/build_ai_surfaces.py [--out dist]
"""
from __future__ import annotations

import argparse
import html
import json
import re
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
PARTS = REPO_ROOT / "public_static" / "data" / "parts.json"
VERSION = REPO_ROOT / "public_static" / "data" / "version.json"
BASE = "https://novadharma-hub.github.io/pmn-framework/"

# The only tags the part data uses today. The static pages embed the section
# HTML as-is, so a new construct must be looked at before it ships rather than
# passed through (or silently stripped from the text twin). Same rule as the
# gate in build_pdf.py.
TAG_DIIZINKAN = {"p", "strong", "em"}


def versi() -> str:
    try:
        return json.loads(VERSION.read_text(encoding="utf-8"))["version"]
    except (OSError, ValueError, KeyError):
        return "unknown"


def ke_teks(h: str) -> str:
    """Section HTML -> plain text, one blank line between paragraphs."""
    h = re.sub(r"</p\s*>", "\n\n", h)
    h = re.sub(r"<br\s*/?>", "\n", h)
    h = re.sub(r"<[^>]+>", "", h)
    h = html.unescape(h)
    h = re.sub(r"[ \t]+\n", "\n", h)
    return re.sub(r"\n{3,}", "\n\n", h).strip() + "\n"


def label_part(part: str) -> str:
    return part if not re.fullmatch(r"[IVXLC]+", part) else "Part " + part


def nama_part(P: dict) -> str:
    """"Part VII: How to Organize…", but "Preface", not "Preface: Preface"."""
    if P["part"] == P["title"]:
        return P["title"]
    return "%s: %s" % (label_part(P["part"]), P["title"])


def nama_berkas_part(part: str) -> str:
    return "part_" + part.replace(" ", "_")


def kb(n: int) -> str:
    return "%d KB" % max(1, round(n / 1024))


def judul_seksi(s: dict) -> str:
    if s["id"].replace("-", " ").lower() == s["title"].lower():
        return s["title"]
    return "§%s %s" % (s["id"], s["title"])


# --------------------------------------------------------------------------
# Plain text
# --------------------------------------------------------------------------
def tulis_teks(parts: list, label: str, out: Path) -> tuple:
    d = out / "txt"
    d.mkdir(parents=True, exist_ok=True)
    ukuran_seksi, ukuran_part = {}, {}

    for P in parts:
        judul_part = nama_part(P)
        potongan = []
        for s in P["subs"]:
            kepala = (
                "PMN Framework %s | %s\n%s\n"
                "Source: %sread/%s.html\n\n"
                % (label, judul_part, judul_seksi(s), BASE, s["id"]))
            teks = kepala + ke_teks(s["html"])
            (d / (s["id"] + ".txt")).write_text(teks, encoding="utf-8")
            ukuran_seksi[s["id"]] = len(teks.encode("utf-8"))
            potongan.append("## %s\n\n%s" % (judul_seksi(s), ke_teks(s["html"])))
        isi = ("# PMN Framework %s — %s\n\n"
               "%d sections. One file per section: %stxt/index.txt\n\n"
               % (label, judul_part, len(P["subs"]), BASE)) + "\n".join(potongan)
        f = nama_berkas_part(P["part"]) + ".txt"
        (d / f).write_text(isi, encoding="utf-8")
        ukuran_part[P["part"]] = len(isi.encode("utf-8"))

    baris = [
        "# PMN Framework %s — plain-text index" % label,
        "",
        "Progressive Materialist Naturalism (PMN), by Nova Dharma.",
        "Licence: CC BY-SA 4.0. Reader: %s" % BASE,
        "",
        "Every section of the manuscript, in reading order, as its own",
        "text/plain file. The largest is under 60 KB, so no fetcher has to",
        "truncate one. Fetch only the sections you need; the Part files hold a",
        "whole Part in one file, and llms-full.txt holds everything (2.4 MB).",
        "",
        "Glossary (JSON): %sdata/gl.json" % BASE,
        "Full corpus, one file: %sllms-full.txt" % BASE,
        "",
    ]
    for P in parts:
        f = nama_berkas_part(P["part"]) + ".txt"
        baris.append("## " + nama_part(P))
        baris.append("Whole Part (%s): %stxt/%s" % (kb(ukuran_part[P["part"]]), BASE, f))
        for s in P["subs"]:
            baris.append("- %s (%s): %stxt/%s.txt"
                         % (judul_seksi(s), kb(ukuran_seksi[s["id"]]), BASE, s["id"]))
        baris.append("")
    (d / "index.txt").write_text("\n".join(baris), encoding="utf-8")
    return ukuran_seksi, ukuran_part


# --------------------------------------------------------------------------
# Static HTML
# --------------------------------------------------------------------------
GAYA = """
:root{color-scheme:light dark;--bg:#fbfaf7;--fg:#1d1b18;--mute:#6b645a;--acc:#795290;--rule:#e2ddd3}
@media (prefers-color-scheme:dark){:root{--bg:#0d0d0d;--fg:#e8e4dc;--mute:#9a9286;--acc:#b894cf;--rule:#2a2824}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:18px/1.7 Georgia,'Times New Roman',serif}
main,header,footer,nav{max-width:42rem;margin:0 auto;padding:0 16px}
header{padding-top:1.5rem;font:14px/1.5 system-ui,sans-serif;color:var(--mute)}
h1{font-size:1.7rem;line-height:1.25;margin:.4rem 0 1.5rem}
h2{font-size:1.25rem;margin:2rem 0 .5rem}
a{color:var(--acc)}
nav.pn{display:flex;justify-content:space-between;gap:1rem;border-top:1px solid var(--rule);margin-top:2.5rem;padding-top:1rem;font:14px/1.5 system-ui,sans-serif}
footer{font:13px/1.5 system-ui,sans-serif;color:var(--mute);padding-bottom:2rem;margin-top:1.5rem}
ul{padding-left:1.2rem}
""".strip()


def halaman(judul: str, deskripsi: str, url: str, badan: str, label: str) -> str:
    e = html.escape
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{judul}</title>
<meta name="description" content="{deskripsi}">
<meta name="author" content="Nova Dharma">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article">
<meta property="og:title" content="{judul}">
<meta property="og:description" content="{deskripsi}">
<meta property="og:url" content="{url}">
<meta property="og:site_name" content="PMN Framework">
<link rel="alternate" type="text/plain" title="llms.txt" href="{base}llms.txt">
<style>{gaya}</style>
</head>
<body>
<header><a href="{base}read/">PMN Framework {label}</a> · static edition, no JavaScript · <a href="{base}">interactive reader</a></header>
{badan}
<footer>Progressive Materialist Naturalism (PMN) by Nova Dharma · manuscript licensed CC BY-SA 4.0 ·
<a href="{base}llms.txt">llms.txt</a> · <a href="{base}txt/index.txt">plain-text index</a></footer>
</body>
</html>
""".format(judul=e(judul), deskripsi=e(deskripsi), url=e(url), badan=badan,
           base=BASE, gaya=GAYA, label=e(label))


def ringkas(h: str, n: int = 155) -> str:
    t = " ".join(ke_teks(h).split())
    if len(t) <= n:
        return t
    return t[:n].rsplit(" ", 1)[0] + "…"


def tulis_html(parts: list, label: str, out: Path, ukuran_part: dict) -> list:
    d = out / "read"
    d.mkdir(parents=True, exist_ok=True)
    e = html.escape
    urut = [(P, s) for P in parts for s in P["subs"]]
    url_semua = [BASE + "read/"]

    for i, (P, s) in enumerate(urut):
        url = "%sread/%s.html" % (BASE, s["id"])
        url_semua.append(url)
        sebelum = urut[i - 1][1] if i > 0 else None
        sesudah = urut[i + 1][1] if i + 1 < len(urut) else None
        pn = '<nav class="pn"><span>%s</span><span>%s</span></nav>' % (
            '← <a href="%s.html" rel="prev">%s</a>' % (e(sebelum["id"]), e(judul_seksi(sebelum)))
            if sebelum else "",
            '<a href="%s.html" rel="next">%s</a> →' % (e(sesudah["id"]), e(judul_seksi(sesudah)))
            if sesudah else "")
        badan = (
            '<main>\n<p style="font:14px/1.5 system-ui,sans-serif;color:var(--mute)">'
            '<a href="./">Contents</a> › %s</p>\n'
            "<h1>%s</h1>\n<article>\n%s\n</article>\n%s\n"
            '<p style="font:14px/1.5 system-ui,sans-serif">'
            '<a href="../txt/%s.txt">Plain text</a> · '
            '<a href="../#/s/%s">Open in the interactive reader</a></p>\n</main>'
            % (e(nama_part(P)), e(judul_seksi(s)),
               s["html"], pn, e(s["id"]), e(s["id"])))
        judul = "%s — PMN Framework" % judul_seksi(s)
        (d / (s["id"] + ".html")).write_text(
            halaman(judul, ringkas(s["html"]), url, badan, label), encoding="utf-8")

    daftar = []
    for P in parts:
        f = nama_berkas_part(P["part"]) + ".txt"
        daftar.append('<h2 id="%s">%s</h2>\n<p style="font:14px/1.5 system-ui,sans-serif">'
                      '<a href="../txt/%s">Whole Part as plain text</a> (%s)</p>\n<ul>'
                      % (e(nama_berkas_part(P["part"])), e(nama_part(P)),
                         e(f), kb(ukuran_part[P["part"]])))
        for s in P["subs"]:
            daftar.append('<li><a href="%s.html">%s</a></li>' % (e(s["id"]), e(judul_seksi(s))))
        daftar.append("</ul>")
    n_seksi = len(urut)
    badan = (
        "<main>\n<h1>Progressive Materialist Naturalism (PMN) — Contents</h1>\n"
        "<p>A naturalist philosophical framework for analyzing material reality, "
        "minimizing structural suffering, and maximizing genuine becoming, by Nova Dharma. "
        "This is the static edition of the manuscript: %d Parts and %d sections, "
        "each on its own page, readable without JavaScript.</p>\n"
        '<p style="font:14px/1.5 system-ui,sans-serif">For AI agents: '
        '<a href="../llms.txt">llms.txt</a> · <a href="../txt/index.txt">plain-text index</a> · '
        '<a href="../llms-full.txt">everything in one file</a> · '
        '<a href="../PMN_Latest.pdf">PDF</a></p>\n%s\n</main>'
        % (len(parts), n_seksi, "\n".join(daftar)))
    (d / "index.html").write_text(
        halaman("PMN Framework %s — Contents (static edition)" % label,
                "Contents of Progressive Materialist Naturalism (PMN) by Nova Dharma: "
                "%d Parts, %d sections, each readable as plain HTML or text." % (len(parts), n_seksi),
                BASE + "read/", badan, label),
        encoding="utf-8")
    return url_semua


def tulis_sitemap(url_baca: list, parts: list, out: Path) -> int:
    # No <lastmod>: a build date is not a modification date, and Google
    # ignores lastmod on sites where it proves unreliable.
    url = [BASE] + url_baca + [BASE + u for u in (
        "llms.txt", "llms-full.txt", "txt/index.txt", "PMN_Latest.pdf")]
    url += [BASE + "txt/" + nama_berkas_part(P["part"]) + ".txt" for P in parts]
    isi = ['<?xml version="1.0" encoding="UTF-8"?>',
           '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    isi += ["  <url><loc>%s</loc></url>" % html.escape(u) for u in url]
    isi.append("</urlset>\n")
    (out / "sitemap.xml").write_text("\n".join(isi), encoding="utf-8")
    return len(url)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(REPO_ROOT / "dist"))
    args = ap.parse_args()
    out = Path(args.out)
    if not out.is_dir():
        print("[ERROR] %s does not exist; run vite build first" % out, file=sys.stderr)
        return 1

    parts = json.loads(PARTS.read_text(encoding="utf-8"))
    tag = {t.lower() for P in parts for s in P["subs"]
           for t in re.findall(r"</?\s*([a-zA-Z][a-zA-Z0-9]*)", s["html"])}
    asing = tag - TAG_DIIZINKAN
    if asing:
        print("[ERROR] part data uses tags this script has not reviewed: %s"
              % ", ".join(sorted(asing)), file=sys.stderr)
        print("[ERROR] extend TAG_DIIZINKAN and ke_teks() before shipping.",
              file=sys.stderr)
        return 1

    for sub in ("txt", "read"):
        shutil.rmtree(out / sub, ignore_errors=True)

    label = versi()
    ukuran_seksi, ukuran_part = tulis_teks(parts, label, out)
    url_baca = tulis_html(parts, label, out, ukuran_part)
    n_url = tulis_sitemap(url_baca, parts, out)

    terbesar = max(ukuran_seksi.items(), key=lambda kv: kv[1])
    print("[ok] txt/: index + %d sections + %d Parts (largest section %s: %s)"
          % (len(ukuran_seksi), len(ukuran_part), terbesar[0], kb(terbesar[1])))
    print("[ok] read/: contents + %d static section pages" % (len(url_baca) - 1))
    print("[ok] sitemap.xml: %d URLs" % n_url)
    return 0


if __name__ == "__main__":
    sys.exit(main())
