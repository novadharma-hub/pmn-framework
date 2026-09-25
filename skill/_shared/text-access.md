## Where the text is

This skill carries the method, not the manuscript. Work from the text of PMN {{VERSION}}, never from memory: PMN is
recent and specific, and a model's memory of it produces generic materialism with PMN's words pasted on and section
numbers that do not exist.

1. **The `pmn` skill, if installed.** Its files sit next to this skill's folder: `../pmn/references/`
   (`index.md` lists every section, `glossary.md` the defined terms, `sections/<id>.txt` the full text of one
   section). If that path is missing, look among the installed skills for a `pmn` folder with `references/index.md`.
2. **Otherwise GitHub.** The same files are in the public repository
   {{REPO}}, under `plugins/pmn/skills/pmn/references/`. With a shell, clone it
   (`git clone --depth 1 {{REPO}}`) and search the section files with grep: the fastest way to
   answer questions that cross many sections. Without a shell, fetch single files from
   {{RAW}}plugins/pmn/skills/pmn/references/sections/<id>.txt (index: `.../references/index.md`).
3. **Otherwise the website.** {{BASE}}txt/index.txt lists every section with the URL of its own plain-text file.
4. **Otherwise ask.** Ask the user to paste the sections named below, or to install the `pmn` skill
   ({{BASE}}#/guide/install). Say plainly that you cannot check the text until then.

GitHub and the website always carry the latest edition; an installed copy may be older. Each section file starts
with its version: if it differs from {{VERSION}}, say which one you used.

Open every section you rely on and read it in full before citing it. Cite section ids (§7.3c-i) and quote the
sentence behind each key claim.
