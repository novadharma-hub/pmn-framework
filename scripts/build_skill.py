#!/usr/bin/env python3
"""Build the PMN Agent Skills and the plugin that ships them.

An Agent Skill is a folder with a SKILL.md (YAML frontmatter + instructions)
and files the model opens only when it needs them. The same folders install
into Claude, Codex, OpenCode, Cursor and other agents that read the format.

Sources (hand-written, with {{VERSION}} {{SECTIONS}} {{TERMS}} {{BASE}}
{{REPO}} {{RAW}} placeholders):
  skill/<name>/SKILL.in.md        one folder per skill; other files are copied
  skill/_shared/<name>.md         shared blocks, inserted as {{NAME}} ({{TEXT_ACCESS}},
                                  {{INCONSISTENCIES}}, {{LANGUAGE}})
  public_static/data/parts.json, gl.json, glg.json

Only the `pmn` skill carries the manuscript (one file per section, index,
glossary). The method skills (pmn-critic, pmn-diagnose) read it from the
sibling folder ../pmn/references/, which is where every installer puts it:
a plugin's skills/ directory, ~/.claude/skills/, .agents/skills/ and so on.
Copying 2.4 MB into every skill would waste space and let copies drift.

Outputs:
  plugins/pmn/skills/<name>/...           committed, so GitHub installs work:
  plugins/pmn/.claude-plugin/plugin.json    /plugin marketplace add, npx skills
  .claude-plugin/marketplace.json
  dist/pmn-skill.zip, dist/<name>.zip     downloads for Claude apps (gitignored)

Zips are deterministic (fixed timestamps, sorted entries), and the committed
tree is rewritten in full on every build, so a stale section file cannot
survive a renumbering. CI fails a pull request whose committed tree differs
from what the build produces.

Standard library only. Run after vite build (the zips go into dist/).
"""
from __future__ import annotations

import argparse
import io
import json
import re
import shutil
import sys
import zipfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from build_ai_surfaces import (  # noqa: E402
    BASE, PARTS, REPO_ROOT, judul_seksi, kb, ke_teks, nama_part, versi,
)

SRC = REPO_ROOT / "skill"
DATA = REPO_ROOT / "public_static" / "data"
PATHS = REPO_ROOT / "src" / "data" / "reading-paths.json"
PLUGIN = REPO_ROOT / "plugins" / "pmn"
MARKETPLACE = REPO_ROOT / ".claude-plugin" / "marketplace.json"
REPO_URL = "https://github.com/novadharma-hub/pmn-framework"
RAW_URL = "https://raw.githubusercontent.com/novadharma-hub/pmn-framework/main/"
ZIP_TIME = (1980, 1, 1, 0, 0, 0)
UTAMA = "pmn"  # the skill that carries the manuscript

PLUGIN_DESC = ("Progressive Materialist Naturalism (PMN) by Nova Dharma: the full manuscript as a skill that "
               "answers from the text with section citations, plus skills to diagnose institutions and to "
               "question PMN itself.")


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


def tulis_jalur(label: str, jalur: list, judul: dict, id_ada: set) -> str:
    """Jalur baca situs -> paths.md untuk pmn-learn. ID tak dikenal = build gagal."""
    salah = sorted({s["id"] for j in jalur for s in j["steps"] if s["id"] not in id_ada})
    if salah:
        raise ValueError("src/data/reading-paths.json names sections that do not exist: %s" % ", ".join(salah))
    baris = [
        "# PMN %s: reading paths" % label,
        "",
        "The reading paths on the PMN website (%s), each a short sequence for a particular reader." % BASE,
    ]
    for j in jalur:
        baris += ["", "## %s. %s" % (j["num"], j["title"]), "",
                  "For: %s. About %s, %d sections." % (j["persona"], j["estTime"].lstrip("~"), len(j["steps"])),
                  "", j["summary"], ""]
        for i, s in enumerate(j["steps"], 1):
            baris.append("%d. §%s %s: %s" % (i, s["id"], judul[s["id"]], s["desc"]))
    return "\n".join(baris) + "\n"


def isi_templat(teks: str, nilai: dict) -> str:
    for k, v in nilai.items():
        teks = teks.replace("{{%s}}" % k, v)
    sisa = re.findall(r"\{\{[A-Z_]+\}\}", teks)
    if sisa:
        raise ValueError("unfilled placeholders: %s" % ", ".join(sorted(set(sisa))))
    return teks


def periksa_frontmatter(folder: str, teks: str) -> None:
    m = re.match(r"---\n(.*?)\n---\n", teks, re.S)
    if not m:
        raise ValueError("%s: SKILL.md has no YAML frontmatter" % folder)
    kolom = dict(re.findall(r"^([a-z_]+):\s*(.*)$", m.group(1), re.M))
    nama, desk = kolom.get("name", ""), kolom.get("description", "")
    if not re.fullmatch(r"[a-z0-9-]{1,64}", nama):
        raise ValueError("%s: name must be 1-64 lowercase letters, digits or hyphens: %r" % (folder, nama))
    if nama != folder:
        raise ValueError("%s: name %r must match the folder name" % (folder, nama))
    if not desk or len(desk) > 1024:
        raise ValueError("%s: description must be 1-1024 characters (is %d)" % (folder, len(desk)))
    if "<" in desk or ">" in desk:
        raise ValueError("%s: description must not contain angle brackets" % folder)


def periksa_rujukan(nama: str, teks: str, id_ada: set) -> None:
    """Every §id the skills' own text names must exist in the corpus."""
    salah = sorted({r for r in re.findall(r"§(\d+(?:\.\d+[a-z]*(?:-[ivx]+)?)?)", teks)
                    if r not in id_ada and "." in r})
    if salah:
        raise ValueError("%s cites sections that do not exist: %s" % (nama, ", ".join(salah)))


def semver(label: str) -> str:
    """v126 -> 126.0.0, v117.9 -> 117.9.0: plugin managers compare versions."""
    angka = re.findall(r"\d+", label)[:3] or ["0"]
    return ".".join(angka + ["0"] * (3 - len(angka)))


def zip_deterministik(berkas: dict, akar: str) -> bytes:
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for path in sorted(berkas):
            info = zipfile.ZipInfo(akar + path, date_time=ZIP_TIME)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, berkas[path].encode("utf-8"))
    return buf.getvalue()


def json_teks(data: dict) -> str:
    return json.dumps(data, indent=2, ensure_ascii=False) + "\n"


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

    korpus: dict[str, str] = {}
    ukuran: dict[str, int] = {}
    for P in parts:
        judul_part = nama_part(P)
        for s in P["subs"]:
            teks = isi_seksi(label, judul_part, s)
            korpus["references/sections/%s.txt" % s["id"]] = teks
            ukuran[s["id"]] = len(teks.encode("utf-8"))
    korpus["references/index.md"] = tulis_indeks(parts, label, ukuran)
    korpus["references/glossary.md"] = tulis_glosarium(label, gl, glg)
    id_ada = set(ukuran)
    judul = {s["id"]: s["title"] for P in parts for s in P["subs"]}

    nilai = {"VERSION": label, "SECTIONS": str(len(ukuran)), "TERMS": str(len(gl)), "BASE": BASE,
             "REPO": REPO_URL, "RAW": RAW_URL}
    skills: dict[str, dict[str, str]] = {}
    try:
        # skill/_shared/<nama>.md -> {{NAMA}}: potongan yang dipakai bersama semua skill.
        for f in sorted((SRC / "_shared").glob("*.md")):
            kunci = f.stem.upper().replace("-", "_")
            nilai[kunci] = isi_templat(f.read_text(encoding="utf-8"), nilai).rstrip("\n")
        folders = sorted(d for d in SRC.iterdir() if d.is_dir() and not d.name.startswith("_"))
        for d in folders:
            berkas: dict[str, str] = {}
            for f in sorted(d.rglob("*")):
                if not f.is_file():
                    continue
                rel = f.relative_to(d).as_posix()
                teks = isi_templat(f.read_text(encoding="utf-8"), nilai)
                periksa_rujukan("%s/%s" % (d.name, rel), teks, id_ada)
                berkas["SKILL.md" if rel == "SKILL.in.md" else rel] = teks
            if "SKILL.md" not in berkas:
                raise ValueError("%s: no SKILL.in.md" % d.name)
            periksa_frontmatter(d.name, berkas["SKILL.md"])
            skills[d.name] = berkas
        if UTAMA not in skills:
            raise ValueError("skill/%s is missing" % UTAMA)
    except ValueError as e:
        print("[ERROR] %s" % e, file=sys.stderr)
        return 1
    skills[UTAMA].update(korpus)
    if "pmn-learn" in skills:
        try:
            jalur = json.loads(PATHS.read_text(encoding="utf-8"))
            skills["pmn-learn"]["paths.md"] = tulis_jalur(label, jalur, judul, id_ada)
        except ValueError as e:
            print("[ERROR] %s" % e, file=sys.stderr)
            return 1

    # Committed plugin tree: rewritten in full so nothing stale survives.
    shutil.rmtree(PLUGIN, ignore_errors=True)
    for nama, berkas in skills.items():
        for rel, teks in berkas.items():
            p = PLUGIN / "skills" / nama / rel
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text(teks, encoding="utf-8", newline="\n")
    manifest = {
        "name": "pmn",
        "version": semver(label),
        "description": PLUGIN_DESC,
        "author": {"name": "Nova Dharma", "url": BASE},
        "homepage": BASE + "#/guide/install",
        "repository": REPO_URL,
        "license": "CC-BY-SA-4.0",
        "keywords": ["philosophy", "political-philosophy", "institutions", "capture", "materialism"],
    }
    (PLUGIN / ".claude-plugin").mkdir(parents=True, exist_ok=True)
    (PLUGIN / ".claude-plugin" / "plugin.json").write_text(json_teks(manifest), encoding="utf-8", newline="\n")
    MARKETPLACE.parent.mkdir(parents=True, exist_ok=True)
    MARKETPLACE.write_text(json_teks({
        "name": "pmn-framework",
        "description": "Plugins for working with Progressive Materialist Naturalism (PMN).",
        "owner": {"name": "Nova Dharma", "url": BASE},
        "plugins": [{"name": "pmn", "source": "./plugins/pmn", "description": PLUGIN_DESC}],
    }), encoding="utf-8", newline="\n")

    # Downloads for apps that take one zip per skill.
    ringkas = []
    for nama, berkas in skills.items():
        f = out / ("pmn-skill.zip" if nama == UTAMA else nama + ".zip")
        f.write_bytes(zip_deterministik(berkas, nama + "/"))
        ringkas.append("%s %s" % (f.name, kb(f.stat().st_size)))

    print("[ok] skills: %s (%d sections, %d terms); plugin pmn %s"
          % (", ".join(ringkas), len(ukuran), len(gl), manifest["version"]))
    return 0


if __name__ == "__main__":
    sys.exit(main())
