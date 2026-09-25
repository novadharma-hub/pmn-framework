#!/usr/bin/env python3
"""Build the PMN Agent Skill: dist/pmn-skill.zip.

An Agent Skill is a folder with a SKILL.md (YAML frontmatter + instructions)
and reference files the model opens only when it needs them. This one bundles
the whole manuscript, one file per section, so a model with the skill installed
answers from the text instead of from memory.

Sources:
  skill/pmn/SKILL.md, skill/pmn/references/roles.md   hand-written, with
      {{VERSION}} {{SECTIONS}} {{TERMS}} {{BASE}} placeholders
  public_static/data/parts.json, gl.json, glg.json    the corpus and glossary

Output (zip root is the folder "pmn/", which is what skill installers expect):
  pmn/SKILL.md
  pmn/references/index.md            every section in reading order
  pmn/references/sections/<id>.txt  one section each, same text as txt/<id>.txt
  pmn/references/glossary.md         defined terms by category
  pmn/references/roles.md            analytical roles

The zip is deterministic (fixed timestamps, sorted entries): the same corpus
gives the same bytes, so a rebuild without content changes is not a new file.

Standard library only. Run after vite build (it writes into dist/).
"""
from __future__ import annotations

import argparse
import io
import json
import re
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ai_surfaces import (  # noqa: E402
    BASE, PARTS, REPO_ROOT, judul_seksi, kb, ke_teks, nama_part, versi,
)

SKILL_SRC = REPO_ROOT / "skill" / "pmn"
DATA = REPO_ROOT / "public_static" / "data"
ROOT = "pmn/"
ZIP_TIME = (1980, 1, 1, 0, 0, 0)


def isi_seksi(label: str, judul_part: str, s: dict) -> str:
    return ("PMN Framework %s | %s\n%s\nSource: %sread/%s.html\n\n"
            % (label, judul_part, judul_seksi(s), BASE, s["id"])) + ke_teks(s["html"])


def tulis_indeks(parts: list, label: str, ukuran: dict) -> str:
    baris = [
        "# PMN %s: section index" % label,
        "",
        "Every section in reading order. Open `sections/<id>.txt` for the full text.",
        "The glossary (`glossary.md`) names the section each term is defined in.",
    ]
    for P in parts:
        baris += ["", "## %s" % nama_part(P), "", "| id | title | size |", "|---|---|---|"]
        for s in P["subs"]:
            judul = s["title"].replace("|", "/")
            baris.append("| %s | %s | %s |" % (s["id"], judul, kb(ukuran[s["id"]])))
    return "\n".join(baris) + "\n"


def tulis_glosarium(label: str, gl: dict, glg: dict) -> str:
    baris = [
        "# PMN %s: glossary" % label,
        "",
        "%d terms, grouped by category. The number in brackets at the end of each" % len(gl),
        "definition is the section that defines the term; read it before relying on the term.",
    ]
    sudah = set()
    for kat, istilah in glg.items():
        baris += ["", "## %s" % kat, ""]
        for t in istilah:
            if t in gl and t not in sudah:
                baris.append("- **%s**: %s" % (t, gl[t]))
                sudah.add(t)
    sisa = [t for t in gl if t not in sudah]
    if sisa:
        baris += ["", "## Other terms", ""]
        baris += ["- **%s**: %s" % (t, gl[t]) for t in sisa]
    return "\n".join(baris) + "\n"


def isi_templat(teks: str, nilai: dict) -> str:
    for k, v in nilai.items():
        teks = teks.replace("{{%s}}" % k, v)
    sisa = re.findall(r"\{\{[A-Z_]+\}\}", teks)
    if sisa:
        raise ValueError("unfilled placeholders: %s" % ", ".join(sorted(set(sisa))))
    return teks


def periksa_frontmatter(teks: str) -> None:
    m = re.match(r"---\n(.*?)\n---\n", teks, re.S)
    if not m:
        raise ValueError("SKILL.md has no YAML frontmatter")
    kolom = dict(re.findall(r"^([a-z_]+):\s*(.*)$", m.group(1), re.M))
    nama, desk = kolom.get("name", ""), kolom.get("description", "")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", nama):
        raise ValueError("name must be 1-64 lowercase letters, digits or hyphens: %r" % nama)
    if not desk or len(desk) > 1024:
        raise ValueError("description must be 1-1024 characters (is %d)" % len(desk))
    if "<" in desk or ">" in desk:
        raise ValueError("description must not contain angle brackets")


def periksa_rujukan(nama: str, teks: str, id_ada: set) -> None:
    """Every §id the skill's own text names must exist in the corpus."""
    salah = sorted({r for r in re.findall(r"§(\d+(?:\.\d+[a-z]*(?:-[ivx]+)?)?)", teks)
                    if r not in id_ada and "." in r})
    if salah:
        raise ValueError("%s cites sections that do not exist: %s" % (nama, ", ".join(salah)))


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", default=str(REPO_ROOT / "dist"))
    args = ap.parse_args()
    out = Path(args.out)
    if not out.is_dir():
        print("[ERROR] %s does not exist; run vite build first" % out, file=sys.stderr)
        return 1

    parts = json.loads(PARTS.read_text(encoding="utf-8"))
    gl = json.loads((DATA / "gl.json").read_text(encoding="utf-8"))
    glg = json.loads((DATA / "glg.json").read_text(encoding="utf-8"))
    label = versi()

    berkas: dict[str, str] = {}
    ukuran: dict[str, int] = {}
    for P in parts:
        judul_part = nama_part(P)
        for s in P["subs"]:
            teks = isi_seksi(label, judul_part, s)
            berkas["references/sections/%s.txt" % s["id"]] = teks
            ukuran[s["id"]] = len(teks.encode("utf-8"))
    id_ada = set(ukuran)

    nilai = {"VERSION": label, "SECTIONS": str(len(ukuran)), "TERMS": str(len(gl)), "BASE": BASE}
    try:
        skill = isi_templat((SKILL_SRC / "SKILL.md").read_text(encoding="utf-8"), nilai)
        roles = isi_templat((SKILL_SRC / "references" / "roles.md").read_text(encoding="utf-8"), nilai)
        periksa_frontmatter(skill)
        periksa_rujukan("SKILL.md", skill, id_ada)
        periksa_rujukan("roles.md", roles, id_ada)
    except ValueError as e:
        print("[ERROR] %s" % e, file=sys.stderr)
        return 1

    berkas["SKILL.md"] = skill
    berkas["references/roles.md"] = roles
    berkas["references/index.md"] = tulis_indeks(parts, label, ukuran)
    berkas["references/glossary.md"] = tulis_glosarium(label, gl, glg)

    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path in sorted(berkas):
            info = zipfile.ZipInfo(ROOT + path, date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, berkas[path].encode("utf-8"))
    tujuan = out / "pmn-skill.zip"
    tujuan.write_bytes(buf.getvalue())

    print("[ok] pmn-skill.zip: %d sections, %d terms, %s (SKILL.md %d lines)"
          % (len(ukuran), len(gl), kb(tujuan.stat().st_size), skill.count("\n")))
    return 0


if __name__ == "__main__":
    sys.exit(main())
