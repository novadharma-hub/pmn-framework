# AGENTS.md

Instructions for any AI agent working on this repository (Claude Code, Codex, OpenCode, Cursor, Gemini CLI and
others). Read all of it before changing anything. The **Status** section at the end is the live hand-over: whoever
finishes a piece of work updates it in the same pull request, so the next agent can start from here at any time.

## For the owner: the prompt to start any agent

Paste this into a new session, in any tool, at any time. It stays valid because it points here rather than
describing the work itself:

```
You are continuing work on the PMN Framework repository
(https://github.com/novadharma-hub/pmn-framework). First sync: fetch origin and bring
my local copy up to date with main. If I have uncommitted or unpushed changes, show
them to me and ask before touching anything. Then read AGENTS.md in full and follow
it. Report to me in Indonesian, briefly: what changed since my copy was last
updated, the current status, and the next task in the Status list. Wait for my
go-ahead before starting it.
```

## What this is

Progressive Materialist Naturalism (PMN), a philosophical manuscript by **Nova Dharma** (a pen name), published as:

- a React reader on GitHub Pages: https://novadharma-hub.github.io/pmn-framework/
- plain-text and static-HTML editions for AI and crawlers (`txt/`, `read/`, `llms*.txt`)
- a PDF, and Agent Skills in `plugins/pmn/skills/` (see README, "Using PMN with an AI model")

The manuscript source (`.docx`) lives outside this repository on the owner's PC. Only generated data is published.
A full rewrite of the manuscript is in progress there. Until it lands, the published text (v126) contains known
inconsistencies; the skills handle them through `skill/pmn/references/known-issues.md`.

## Rules that are never broken

1. **No real name, anywhere.** The author is "Nova Dharma" only: code, comments, commit messages, metadata, file
   names, PR text. If you find a real name, stop and tell the owner.
2. **No Office documents in git** (`.docx`, `.xlsx`, ...). Their metadata carries the account name. CI rejects them.
3. **Deleting files or content needs the owner's explicit consent.** Propose; do not delete on your own.
4. **Never rewrite history on `main`** (no force push, no rebase of pushed commits).
5. **No AI model names or versions** in commits, PR titles or bodies, or code.
6. **Keep PR descriptions short** and free of anything secret: no tokens, `.env` values, local paths or hostnames.
7. **Never hand-edit generated files.** `data/parts.json`, `data/parts/`, `pmn_corpus_for_ai.md`, `llms-full.txt`,
   `dist/` and `plugins/pmn/skills/` are rebuilt from sources; edit the source and rebuild.

## Conventions

- Code comments in Indonesian; everything a reader sees (UI, README, llms files, skills) in English.
- Commit messages in English, imperative, explaining why.
- Section references use the section id (`7.3c-i`); check it exists in `txt/index.txt` before citing it.
- CSS uses the tokens in `style.css` (`var(--ink)`, `var(--acc)`, ...). See `DESIGN.md`.
- The owner is not a programmer: explain in plain Indonesian, give a recommendation rather than a menu, and push
  back honestly when an idea is weak.

## Build and checks

Node.js 22 and Python 3.11+.

```bash
npm ci
npm run build                      # the whole chain below; must pass before any PR
python3 scripts/security_check.py  # secrets and personal data; one warning is expected without a local .env
```

`npm run build` runs, in order: `tsc --noEmit`, `scripts/check_glossary.py`, `vite build`,
`scripts/build_ai_surfaces.py` (`dist/txt/`, `dist/read/`, `dist/sitemap.xml`), `scripts/build_skill.py`
(`plugins/pmn/`, `.claude-plugin/marketplace.json`, `dist/pmn-*.zip`) and `scripts/build_pdf.py` (`llms-full.txt`
and the PDF check).

The reader loads text one Part at a time: `data/parts/manifest.json` (titles and ids, no text) first, then
`data/parts/part_<Part>.json` on demand, and `data/parts.json` only for Search. All three come from
`modularizer.py`; the build fails if they disagree.

`dist/`, `plugins/` and `.claude-plugin/` are committed: commit what the build produces. CI
(`.github/workflows/check.yml`) builds every PR and fails if the committed skills differ from the build; merging to
`main` deploys through `deploy.yml`.

After a UI change, open the changed pages at phone width (390px) and desktop width and check both themes.

## Agent Skills

Sources in `skill/`: one folder per skill with `SKILL.in.md`, shared blocks in `skill/_shared/` (text access,
inconsistencies, language), and `skill/pmn/references/known-issues.md`. `scripts/build_skill.py` fills the
placeholders, checks that every section id the skills cite exists, and writes `plugins/pmn/`.

- Test a changed skill with a real agent on a realistic prompt (give it only the installed skills folder, ask for
  the answer plus a trace of files opened and anything unclear), and fold the findings back in.
- Found a new inconsistency in the manuscript? Read both passages in context first; most apparent conflicts are
  loose wording or a later refinement. Only a genuine contradiction goes into `known-issues.md`, with both quotes
  and a recommended reading.
- **When the rewritten manuscript lands**, section ids may change. The build then fails on every section id the
  skills cite that no longer exists: update the pointers in `skill/`, re-check `known-issues.md` (drop what the
  rewrite fixed), and re-run the skill tests.

## Releasing a new manuscript version

On the owner's PC: import the `.docx` with `pmn_console.py` (options 1 and 2), then **run `npm run build`** and
commit `data/`, `public_static/`, `dist/`, `plugins/` and `.claude-plugin/` together. Skipping the build leaves the
Agent Skills one version behind; direct pushes to `main` are not checked for this.

## Git workflow

1. Sync first: `git fetch origin`, then update from `origin/main`. The history of `main` was rewritten on
   2026-09-24 to remove files with personal metadata; a copy cloned before then cannot be pulled and must be
   re-cloned (move any uncommitted work aside first).
2. Work on a branch, open a PR against `main`, wait for CI.
3. The owner has authorised agents to merge their own PRs once CI is green. After merging, bring the working
   branch back to `origin/main` before the next task.
4. One task at a time. If the Status list shows a task as in progress, leave it alone or ask the owner.
5. Update the Status section below in the same PR as the work.

## Status

Last updated: 2026-09-25 (after PR #26).

### Done recently

- #12–#15: homepage and mobile redesign; admin page removed.
- #16–#17: repository audit and serious audit; history rewritten to remove files with personal metadata (owner did the push).
- #18: AI Guide tiers by capability, no model names.
- #19: Agent Skill `pmn` (whole manuscript) and the AI Guide Install tab.
- #20: skills `pmn-diagnose` and `pmn-critic`, installable from GitHub (`/plugin marketplace add
  novadharma-hub/pmn-framework`, `npx skills add novadharma-hub/pmn-framework`).
- #21: skills can read the text from GitHub; `pmn-diagnose` covers micro, meso and macro (§7.0b); this file.
- #22: all skills handle the manuscript's inconsistencies (`known-issues.md`) and any language, English by default.
- #23: skills `pmn-strategy` and `pmn-learn`; inconsistencies resolved quietly and read charitably; `pmn-critic`
  targets ideas, not writing. Reading paths moved to `src/data/reading-paths.json` (shared by the site and
  `pmn-learn`).
- #24: text loads per Part. The app starts from `data/parts/manifest.json` (about 40 KB) and fetches
  `data/parts/part_<Part>.json` when a Part is read (and the next one ahead); `parts.json` is fetched only for
  Search. First load went from about 3.1 MB to about 1 MB. `build_ai_surfaces.py` fails if the per-Part files do
  not match `parts.json`.
- #25: `pmn` is the front door and routes each kind of request to the right skill; thought experiments handled in
  `pmn-diagnose` and `pmn-critic` (§12.1c).
- #26: reader page on phones (≤680px): one top bar that hides while scrolling down, a find button in place of
  the hidden global header, no Measure panel, text full width with 16px edges (358px of 390px instead of ~320px).

### Next, in order

1. **Re-measure the README "known limits" section** against the current version.

### Waiting on the owner

- **GitHub Support request** ("Deletes") to purge the old pull-request refs (#1–#16) that still hold the removed
  `.docx` files. Only GitHub can do this.
- **For the manuscript rewrite:**
  - `skill/pmn/references/known-issues.md`: G used for two different factors in §15.4 (substantive), plus two label
    slips (P's heading, D/P/G missing from §15.0b).
  - A substantive objection from the critic skill's test: "advanced V" (§15.0b) has no indicator independent of the
    absence of complaint it explains, so at the level of a single case "people do not complain" fits both "little
    structural suffering" and "suffering hidden by advanced V".
- Review the eight rewritten Reading Paths descriptions and the unified citation format (Rules page).
