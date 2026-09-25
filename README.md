# Progressive Materialist Naturalism (PMN)

[![Release](https://img.shields.io/badge/Release-v126-795290.svg?style=flat-square)](https://github.com/novadharma-hub/pmn-framework/releases)
[![Live Reader](https://img.shields.io/badge/Live%20Reader-GitHub%20Pages-2ea44f.svg?style=flat-square)](https://novadharma-hub.github.io/pmn-framework/)
[![Corpus](https://img.shields.io/badge/Corpus-235%20sections%20%7C%20~330k%20words-blue.svg?style=flat-square)](#what-is-in-this-repository)
[![Manuscript: CC BY-SA 4.0](https://img.shields.io/badge/Manuscript-CC%20BY--SA%204.0-lightgrey.svg?style=flat-square)](https://creativecommons.org/licenses/by-sa/4.0/)
[![Code: MIT](https://img.shields.io/badge/Platform%20Code-MIT-yellow.svg?style=flat-square)](./LICENSE)

**[Read online](https://novadharma-hub.github.io/pmn-framework/)** · **[AI Guide](https://novadharma-hub.github.io/pmn-framework/#/guide)** · **[Download PDF / Markdown](https://github.com/novadharma-hub/pmn-framework/releases/latest)**

Progressive Materialist Naturalism is a philosophical framework by **Nova Dharma** for analysing institutions, power and
structural suffering from material conditions rather than stated intentions. This repository holds the manuscript data
(v126: a Preface, Parts I–XVII, a Coda, Intellectual Debts and a Bibliography; 235 sections, 239 glossary terms) and the
reader website built from it.

---

## For AI agents and crawlers

Plain URLs, no JavaScript needed. Start with the first one.

```text
https://novadharma-hub.github.io/pmn-framework/txt/index.txt          every section as its own small .txt file (start here)
https://novadharma-hub.github.io/pmn-framework/llms.txt               llms.txt index
https://novadharma-hub.github.io/pmn-framework/read/                  static HTML edition, one page per section
https://novadharma-hub.github.io/pmn-framework/txt/part_VII.txt       one whole Part (part_I … part_XVII, part_Preface, part_Coda, …)
https://novadharma-hub.github.io/pmn-framework/llms-full.txt          everything in one file (2.4 MB; most fetchers truncate it)
https://novadharma-hub.github.io/pmn-framework/llms.json              machine-readable manifest
https://novadharma-hub.github.io/pmn-framework/data/gl.json           glossary (239 terms)
https://novadharma-hub.github.io/pmn-framework/sitemap.xml            sitemap
```

Links with `#` (such as `#/s/7.3`) are app routes; crawlers drop everything after `#`, so use `txt/7.3.txt` or
`read/7.3.html` instead.

```python
import json, urllib.request

BASE = "https://novadharma-hub.github.io/pmn-framework/"
manifest = json.load(urllib.request.urlopen(BASE + "llms.json"))
print(manifest["version"], manifest["statistics"]["sections_count"])

section = urllib.request.urlopen(BASE + "txt/7.3c-i.txt").read().decode("utf-8")
```

---

## Using PMN with an AI model

The **[AI Guide](https://novadharma-hub.github.io/pmn-framework/#/guide)** covers this in full: how to give a model the
text, a priming prompt, seven analytical roles, example questions, a tested Python script, and the endpoints above.

In short: a model that has not been given PMN's text will guess. Put the text in front of it, ask it to cite section
numbers, and check that the numbers exist. How much text you can give depends on the tool, so the guide works in tiers
set by capacity, not by brand (the whole book is roughly half a million tokens):

| Tier | Needs | Give it |
|---|---|---|
| **A. Agent with file access** | Can read files or fetch URLs (Claude Code, Codex, Cursor, ...) | The PMN skill, a clone of this repository, or `txt/`; search, then read |
| **B. Whole book** | Context window of about 1M tokens | `llms-full.txt` or the PDF |
| **C. One to three Parts** | About 128k tokens or more | `txt/part_<Part>.txt` (largest Part roughly 65k–80k tokens) |
| **D. A few sections** | Any model | Section files from `txt/index.txt` |
| **N. Notebook** | Indexes uploads (e.g. NotebookLM) | The PDF |

Each tier has a starter prompt in the guide. No model is named or ranked: lists of models go stale within months. The
guide gives quality criteria and a five-minute test with known answers instead.

To set PMN up once rather than per chat, the guide's
**[Install](https://novadharma-hub.github.io/pmn-framework/#/guide/install)** tab has:

- **The PMN skills**, in the Agent Skills format that Claude, Codex, OpenCode, Cursor and other agents read:
  - `pmn`: the whole manuscript, one file per section, with index, glossary and analytical roles. Answers from the
    text with citations. The other two read the text from it.
  - `pmn-diagnose`: a structured diagnosis of a real situation at any scale, from a person or workplace to an
    institution or a country (level of causation, capture stage or transformation pressure with evidence, who
    pays, what would overturn it).
  - `pmn-strategy`: what to do (where the system stands, counter-power and its weakest factor, whether a window is
    open, accommodation or transformation, realistic options).
  - `pmn-learn`: teaches PMN from the text, one section at a time, along the site's reading paths.
  - `pmn-critic`: questions PMN's ideas (strongest objections, misreadings, unfalsifiable claims, blind spots).

  ```
  # Claude Code
  /plugin marketplace add novadharma-hub/pmn-framework
  /plugin install pmn@pmn-framework

  # Codex, OpenCode, Cursor, Gemini CLI and others
  npx skills add novadharma-hub/pmn-framework
  ```

  Claude apps take one zip per skill from the Install tab. The skills live in `plugins/pmn/skills/`, generated from
  `skill/` by `scripts/build_skill.py` on every build.
- **Instructions for a Custom GPT, Gemini Gem or Claude Project**, to paste alongside `llms-full.txt` as a knowledge file.

### Before you ingest: known limits of this corpus

Measured against v120 on 2026-09-09 and not re-measured since. These apply to every model, because nothing in the text
marks them.

| Measured | What it means when you query the corpus |
|---|---|
| **74 of 81 attribution claims carry no source** within three sentences; Gramsci alone accounts for 35 | Ask the model to name the section behind any "X argues that…" claim. If it cannot, treat the claim as the manuscript's reading, not a report of the source. |
| **0 of 57 causal-mechanism sections state a defeater** (scope hedging is good — 84% qualify their conditions) | Before asking a model to "test" a claim, ask what evidence would defeat it. If the corpus does not say, make the model report the absence rather than invent a test. |
| **13 empirical / historical sections cite nothing** — including all of Part XVII (~5,100 words of case studies) and §7.8 (4,004 words) | These are where fabricated supporting detail is most likely. Request the claim and its source separately, and verify the source yourself. |
| **§15.0b is outvoted 4-to-1 on the `S` notation** — it states `S = f(R, B, V)` is "not a measurable sum"; §3.4b (×2), §7.8, §15.14 and the glossary write `S = R + B + V` | If a model computes `S` as a sum it is following the majority of the text against the section that claims authority over the term. |

**None of this is a list of errors in the philosophy.** Every item is about *traceability*: whether a reader can check
a claim, not whether the claim is true. PMN's own primary diagnostic (§1.2) asks whether a framework revises under
evidence or insulates itself from it, and a framework that hides its weak points from its readers has already begun
to insulate.

---

## The reader

- **Home:** reading paths (six short routes into the text), "How the Framework Is Built" (the three analytical layers,
  the primary formula of §15.2, the five-stage capture sequence of §7.3c-i, the twelve axioms of §14.3, and every Part),
  and an AI workbench that builds a grounded prompt from the text.
- **Reader:** one section at a time, with notes, highlights, glossary tooltips and previous/next links.
- **Contents, Glossary, Search, AI Guide, Rules & Data**, each at its own URL (`#/contents`, `#/glossary`, `#/search`,
  `#/guide/...`, `#/rules/...`).
- **Privacy:** no cookies, no analytics, no accounts, no server. Notes, progress and preferences stay in the browser's
  `localStorage`; the Rules & Data page can export or clear them.
- **Offline:** a service worker caches the manuscript, so the reader works without a connection once loaded.

### Keyboard shortcuts

| Keys | Action |
|---|---|
| <kbd>Alt</kbd>+<kbd>C</kbd> | Table of Contents |
| <kbd>Alt</kbd>+<kbd>/</kbd> | Command palette (jump / search) |
| <kbd>Alt</kbd>+<kbd>?</kbd> | Glossary |
| <kbd>Alt</kbd>+<kbd>R</kbd> | Resume last reading position |
| <kbd>Alt</kbd>+<kbd>N</kbd> | My Notes |
| <kbd>Alt</kbd>+<kbd>F</kbd> | Focus mode |
| <kbd>Alt</kbd>+<kbd>T</kbd> | Dark / light theme |
| <kbd>Alt</kbd>+<kbd>K</kbd> | All shortcuts |
| <kbd>←</kbd> / <kbd>→</kbd> | Previous / next section |

---

## What is in this repository

```
data/                 manuscript data written by the local pipeline (parts.json, glossary, lookups)
public_static/        files served at the site root: data/ copy, llms.*, PDF, icons, fonts
skill/                hand-written sources of the Agent Skills (SKILL.in.md per skill)
plugins/pmn/          generated Agent Skills plugin; .claude-plugin/ holds the marketplace entry
src/                  React 18 + TypeScript reader (App.tsx, routing.ts, components/)
style.css             design tokens and styles (see DESIGN.md)
scripts/              build and audit tools
  build_ai_surfaces.py  txt/, read/ and sitemap.xml, generated on every build
  build_pdf.py          the typeset PDF
  build_skill.py        the Agent Skills (plugins/pmn/, zips in dist/) from skill/ and the corpus
  check_glossary.py     build gate: glossary categories must name real entries
  security_check.py     scan for secrets and personal data before publishing
  indexnow_ping.py      tell search engines about new URLs after deploy
  pmn_tools/            manuscript checks (pmn_check, pmn_diff, ...)
  audit_*.py            manuscript audits (quotes, citations, symbols, content)
modularizer.py        local pipeline: manuscript -> data/ and public_static/
pmn_console.py        local menu for the pipeline
dist/                 built site, deployed to GitHub Pages
```

The manuscript source (`.docx`) is kept outside this repository; only generated data is published.

---

## Development

Requires Node.js 22 and Python 3.11+.

```bash
npm ci
npm run dev       # http://localhost:5173/pmn-framework/
npm run build     # typecheck, glossary gate, Vite build, txt/ read/ sitemap, PDF
npm run preview   # serve the built site
```

Every pull request is built by `.github/workflows/check.yml`; merges to `main` deploy through `deploy.yml`.

AI agents working on the repository start from [`AGENTS.md`](AGENTS.md): rules, build steps, and the current status
and next tasks, kept up to date with every pull request.

### Contributor rules

1. Never hand-edit generated files (`data/parts.json`, `data/parts/`, `pmn_corpus_for_ai.md`, `dist/`); regenerate them.
2. Use the CSS variables in `style.css` (`var(--ink)`, `var(--acc)`, ...) rather than hard-coded colours.
3. Section references use the section id (`7.3c-i`); check that any id you cite exists in `txt/index.txt`.
4. `npm run build` must pass before opening a pull request.

---

## Citation

If you reference, analyze, or cite Progressive Materialist Naturalism in academic publications, books, policy whitepapers, or AI grounding studies, please use the following citation formats:

### APA (7th ed.)
```text
Dharma, N. (2026). Progressive Materialist Naturalism (Version 126) [Manuscript]. https://novadharma-hub.github.io/pmn-framework/
```

### BibTeX
```bibtex
@misc{dharma2026pmn,
  author       = {Dharma, Nova},
  title        = {Progressive Materialist Naturalism},
  year         = {2026},
  note         = {Manuscript, version 126},
  howpublished = {\url{https://novadharma-hub.github.io/pmn-framework/}}
}
```

---

## License

- **Platform code** (the reader, components, build scripts): [MIT](./LICENSE).
- **Manuscript** (text, glossary, AI grounding files): [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
