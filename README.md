# Progressive Materialist Naturalism (PMN) â€” Reader Platform

[![Version](https://img.shields.io/badge/Release-v118.5-blueviolet.svg?style=flat-square)](#)
[![Stack](https://img.shields.io/badge/Stack-React%20%2B%20TypeScript%20%2B%20Vite-61DAFB.svg?style=flat-square)](#)
[![AI-Ready](https://img.shields.io/badge/AI--Grounding-Corpus%20Enabled-orange.svg?style=flat-square)](#)
[![License](https://img.shields.io/badge/License-CC%20BY--SA%204.0-lightgrey.svg?style=flat-square)](#)

A fully interactive, offline-capable reader platform for the PMN philosophical manuscript â€” a framework for analyzing material reality, minimizing structural suffering, and maximizing genuine becoming.

Built as a **React + TypeScript + Vite** single-page application, with a cozy bookstore aesthetic, full dark/light theme, keyboard-first navigation, AI grounding corpus, and a complete build pipeline driven by a single `.bat` launcher.

---

## Architecture

```
pmn-framework/
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ App.tsx                     â† Root: all global state, routing, HomeView
â”‚   â”œâ”€â”€ main.tsx                    â† Entry point, CSS import order
â”‚   â”œâ”€â”€ index.css                   â† Tailwind v4 @theme tokens
â”‚   â””â”€â”€ components/
â”‚       â”œâ”€â”€ ReaderView.tsx          â† The main manuscript reader (sidebar + prose)
â”‚       â”œâ”€â”€ ContentsView.tsx        â† TOC, Glossary, and Search
â”‚       â”œâ”€â”€ Sidebar.tsx             â† Part/section navigation inside ReaderView
â”‚       â”œâ”€â”€ AITerminal.tsx          â† In-page AI grounding terminal
â”‚       â”œâ”€â”€ GuideView.tsx           â† AI Agent Guide page
â”‚       â”œâ”€â”€ KeyboardModal.tsx       â† Keyboard shortcuts modal [Alt+K]
â”‚       â”œâ”€â”€ NotesModal.tsx          â† Saved annotations modal [Alt+N]
â”‚       â”œâ”€â”€ CommandPalette.tsx      â† Command palette [Alt+/]
â”‚       â”œâ”€â”€ ParticlesBackground.tsx â† Hero cover particle/leaf animation
â”‚       â””â”€â”€ VersionManager.tsx      â† Admin: version management panel
â”‚
â”œâ”€â”€ data/
â”‚   â”œâ”€â”€ parts.json                  â† Full bundled manuscript (2.3MB, used by dev)
â”‚   â”œâ”€â”€ parts/                      â† Per-part JSON chunks (used by dist)
â”‚   â”‚   â”œâ”€â”€ manifest.json
â”‚   â”‚   â””â”€â”€ part_*.json
â”‚   â”œâ”€â”€ gl.json                     â† Glossary dictionary
â”‚   â”œâ”€â”€ glg.json                    â† Glossary groupings
â”‚   â”œâ”€â”€ look.json                   â† Section lookup table (id â†’ part/sub index)
â”‚   â”œâ”€â”€ ci.json                     â† Cross-reference index
â”‚   â”œâ”€â”€ rel.json                    â† Relational concept map
â”‚   â”œâ”€â”€ quotes.json                 â† Notable quotes for display
â”‚   â””â”€â”€ version.json                â† Current live version tag
â”‚
â”œâ”€â”€ style.css                       â† Master CSS (109KB). ALWAYS read before editing.
â”œâ”€â”€ index.html                      â† Vite entry shell
â”œâ”€â”€ vite.config.js
â”œâ”€â”€ package.json
â””â”€â”€ dist/                           â† Production build output (committed to main)
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Run local dev server
npm run dev
# â†’ http://localhost:5173/pmn-framework/

# Production build
npm run build
```

---

## CSS Token System

All theme-adaptive styling uses CSS custom properties from `style.css`. **Do not use Tailwind utility classes for theme-sensitive colors** â€” the `@theme` tokens in `index.css` are dark-mode hardcoded.

| Token | Light Mode | Dark Mode |
|-------|-----------|-----------|
| `var(--bg)` | `#fdfbf7` (cream) | `#0d0d0d` |
| `var(--bg2)` | `#f7f3eb` | `#171717` |
| `var(--ink)` | `#1c1510` | `#f5f0e8` |
| `var(--ink2)` | `#4a3a2d` | `#c8bfb2` |
| `var(--acc)` | `#b83a1b` | `#c0271a` |
| `var(--mute)` | `#756456` | `#8a7d6e` |
| `var(--rule)` | `#e8dcc4` | `#302b27` |

---

## Keyboard Shortcuts

All shortcuts use **Alt** as the modifier to avoid conflicts with system/browser shortcuts.

| Key | Action |
|-----|--------|
| `Alt+K` | Open keyboard shortcuts modal |
| `Alt+N` | Open notes & annotations modal |
| `Alt+C` | Go to Table of Contents |
| `Alt+R` | Resume reading (last position) |
| `Alt+/` | Open command palette |
| `Alt+F` | Toggle focus mode |
| `Alt+?` | Open Glossary |
| `â†` / `â†’` | Navigate between sections (in Reader) |

---

## Build & Deploy Pipeline

The full pipeline is orchestrated by `00_PMN_WORKSPACE.bat` (one file, one entry point):

1. **Import** â€” Parses `.docx` from `docx_source/`, generates JSON parts and corpus markdown.
2. **Build** â€” Runs `npm run build` via Vite; output goes to `dist/`.
3. **Metadata Scrub** â€” Strips author metadata from DOCX/PDF before publishing.
4. **Push & Release** â€” Commits `public` submodule, pushes to GitHub, creates a GitHub Release with PDF and markdown attachments.

> For UI changes (visual tweaks, new features), edit `src/` files directly, run `npm run build`, then commit.

---

## AI Grounding

The repository maintains `pmn_corpus_for_ai.md` â€” a plain-text, HTML-stripped flat export of the entire manuscript, optimized for direct use as AI context. Updated automatically on each import/build cycle.

AI agents working in this repository should read `private/Dokumentasi_AI_Antigravity/HANDOFF_AI.md` before making any changes.

---

## Formatting Rules for AI Developers

1. **JSON Double Quote Escaping:** Manuscript HTML inside JSON strings must escape quotes as `\"`.
2. **Internal Links:** `<a class=\"xref\" href=\"#3.2\" data-sid=\"3.2\">3.2</a>`
3. **Never edit `dist/` by hand.** Always build via `npm run build`.
4. **Always run `npm run build` and confirm clean output before committing.**
5. **CSS changes:** Use `var(--token)` from `style.css`, not Tailwind `bg-pmn-*` classes.

---

## License

The **reader platform code** (React/TypeScript/CSS/JS) is licensed under the **MIT License**.

The **manuscript content** (all text in `data/parts.json`, `data/parts/`, and `pmn_corpus_for_ai.md`) is licensed under **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.

You are free to share and adapt the manuscript for non-commercial purposes with attribution. See [LICENSE](./LICENSE) for full terms.

---

*"Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations."* â€” Nova Dharma
