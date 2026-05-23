# 🤖 UNIVERSAL AI CONTEXT BLUEPRINT & SYSTEM BRAIN (AI.md)

Welcome, AI Developer! This workspace contains the **Progressive Materialist Naturalism (PMN) Framework** website, an elite, interactive reader platform designed to display the PMN philosophical manuscript offline and online.

Use this document as your primary source of truth for the project's architecture, data directories, strict formatting rules, and ongoing backend migration states.

---

## 📂 REPOSITORY ARCHITECTURE & ZONES

The PMN Framework is built on a **Hybrid Modular-Monolith** design. To protect token efficiency, the large 2.6 MB manuscript is separated into lightweight JSON files for editing, then compiled into a single massive index file for distribution.

| Path Location | Type | Purpose / Description |
| :--- | :--- | :--- |
| `D:\pmn-framework\00_PMN_WORKSPACE.bat` | Launcher | **Super Main Dashboard App** (one-click entry point) |
| `D:\pmn-framework\CARA_PAKAI_PMN.txt` | Workspace Guide | Front-page quick reference for editing, compiling, and testing |
| `D:\pmn-framework\PANDUAN_PROMPT_AI.md` | AI Prompt Blueprint | Front-page primer guiding AI on escaping, json writing, & formats |
| `D:\pmn-framework\docx_source\` | MS Word Source | Dedicated folder for the **single active `.docx` manuscript file** |
| `D:\pmn-framework\index.ui.html` | UI Skeleton | The lightweight HTML layout (~40KB) without manuscript text |
| `D:\pmn-framework\style.css` | CSS Styles | Core styling, fonts, and dark/light modes |
| `D:\pmn-framework\app.js` | UI Logic | Interactive features (Command Palette, popovers, Local LLM terminal) |
| `D:\pmn-framework\data\` | Core Data | Contains glossary dictionaries, relations, lookups, and quotes |
| `D:\pmn-framework\data\parts\` | Manuscript | Split JSON files (`part_Preface.json` to `part_XXI.json`) containing raw text |
| `D:\pmn-framework\supabase\` | Backend SQL | Migration schemas and SQL procedures for Supabase backend |
| `D:\pmn-framework\src\lib\` | Backend Libs | Client scaffolds and backend helpers for database coordination |
| `D:\pmn-framework\index.html` | Compiled Monolith | The single 2.67 MB output compiled automatically for the public |

---

## ⚡ COMPILATION, TESTING & MANAGEMENT CENTER

To manage, compile, or run testing servers inside your PMN Framework workspace, use these automated tools:
*   **`00_PMN_WORKSPACE.bat`**: Launches the main interactive command console (`pmn_console.py`). This is the **super main dashboard app** where you can view live repository telemetry (version, glossary count, section totals), compile with one key, start server, split files, and preview blueprints in a retro-styled interactive shell.
*   **`scripts/compile_pmn.bat`**: Runs `modularizer.py compile`. It acts as an automated compiler, safety linter, and corpus generator:
    1.  **Safety Backup (`index.html.bak`):** Automatically copies the previous version of `index.html` as a fallback backup before writing a new compile build.
    2.  **Linter:** Blocks compilation upon syntax issues (invalid commas/JSON) to preserve visual integrity.
    3.  **AI Grounding Corpus (`pmn_corpus_for_ai.md`):** Automatically compiles the entire philosophy and key glossary into a clean, flat Markdown file (stripped of HTML tags) at the root, optimized for instant ingestion by RAG scrapers or external LLMs.
*   **`scripts/buka_web.bat`**: Runs `jalankan_web.py`. Starts a local HTTP server on `http://localhost:8000` and automatically opens `index.ui.html` in your default browser for real-time local previews.

---

## 💎 CORE INTERACTIVE FEATURES

The frontend has three premium interactive modules programmed inside `app.js` and `index.ui.html`:
1.  **Dialectical Synthesis Terminal (Local AI Agent):** Uses in-browser local LLM integration to answer user queries using natural language with retro typewriter effects (█) and turns section numbers into active hyperlinked buttons.
2.  **Wikipedia-Style Floating Preview:** Hovering over cross-references (e.g. `#3.4`) triggers an elegant glassmorphism popover showing the preview of that section dynamically.
3.  **Universal Command Palette (Ctrl+K):** A sliding panel for fast global search, focus mode, random chapter generation, and instant theme toggling.

---

## 🛠️ CRITICAL CODE & NASKAH WRITING RULES (FOR AIs)

When editing or updating files inside `data/parts/`, you **MUST** strictly adhere to these standards:

1.  **JSON Double Quote Escaping:** Because HTML text is wrapped inside a JSON string, all double quotes in HTML attributes or classes **MUST** be escaped with a backslash `\"` (e.g., `<p class=\"intro\">` or `&ldquo;quote&rdquo;`). Failure to do this breaks the compiler!
2.  **Cross-References (Xref Links):** Links referencing other sections (e.g., section 1.1) **MUST** be formatted using the exact class and `data-sid` parameters:
    `<a class=\"xref\" href=\"#1.1\" data-sid=\"1.1\">1.1</a>`
3.  **Paragraph Wrapping:** Wrap every separate body paragraph cleanly inside `<p>...</p>`.
4.  **No Monolith Edits:** **NEVER** edit `index.html` directly. Only edit modular files (`data/parts/part_*.json` or `index.ui.html`) and run `compile_pmn.bat`.

---

## 🔑 KEY GLOSSARY DEFINITIONS

Always maintain these definitions with perfect precision. Never summarize or change their core meaning:
*   `"inaction as choice"`: *"The analytical recognition that not intervening in an existing arrangement is a material decision that sustains its current dynamics, including its structural production of suffering. (1.5)"*
*   `"minimal anchor"`: *"The most defensible universal evaluative criterion: organisms with the capacity to suffer do not choose to suffer. This biological fact grounds evaluation without importing prior moral commitments."*
*   `"becoming"`: *"The capacity to develop cognitively, morally, and creatively beyond the conditions determined by birth. The ceiling of PMN's evaluative framework..."*

---

## 💡 SYSTEM HISTORY & TROUBLESHOOTING LOG

Maintain this log chronologically. Always check this section before executing tasks.

### 📅 May 24, 2026: Repositories Migration & Path Synchronization
*   **Situation:** The user migrated the entire `pmn-framework` workspace from their local Downloads directory to the permanent storage drive: `D:\pmn-framework`.
*   **Action Taken:**
    1.  Scanned all script, markdown, and text configurations for legacy path remnants.
    2.  Upgraded [CARA_PAKAI_PMN.txt](file:///d:/pmn-framework/CARA_PAKAI_PMN.txt) to target `D:\pmn-framework` for editing chapters, compilation steps, and layout skeletons.
    3.  Upgraded [docs\supabase-phase1.md](file:///d:/pmn-framework/docs/supabase-phase1.md) backend scaffolding paths (including `.env.example`, client, and SQL schemas) to point to the new migrated active directory.
*   **Outcome:** All hardcoded paths successfully cleared. One-click compiler and web server are tested, fully healthy, and verified 100% operational on `D:\pmn-framework`.
