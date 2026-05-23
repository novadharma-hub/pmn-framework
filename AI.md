# 🤖 UNIVERSAL AI CONTEXT BLUEPRINT & SYSTEM BRAIN (AI.md)

Welcome, AI Developer! This workspace contains the **Progressive Materialist Naturalism (PMN) Framework** website, an elite, interactive reader platform designed to display the PMN philosophical manuscript offline and online.

Use this document as your primary source of truth for the project's architecture, data directories, strict formatting rules, and ongoing backend migration states.

---

## 📂 REPOSITORY ARCHITECTURE & ZONES

The PMN Framework is built on a **Hybrid Modular-Monolith** design. To protect token efficiency, the large 2.6 MB manuscript is separated into lightweight JSON files for editing, then compiled into a single massive index file for distribution.

| Path Location | Type | Purpose / Description |
| :--- | :--- | :--- |
| `D:\pmn-framework\00_PMN_WORKSPACE.bat` | Launcher | **Super Main Dashboard App** (one-click entry point!) |
| `D:\pmn-framework\CARA_PAKAI_PMN.txt` | Workspace Guide | Front-page quick reference for Indonesian human developers |
| `D:\pmn-framework\PANDUAN_PROMPT_AI.md` | AI Prompt Blueprint | Front-page primer guiding AI on escaping, JSON writing, & formats |
| `D:\pmn-framework\docx_source\` | MS Word Source | Dedicated folder for the **single active `.docx` manuscript file** |
| `D:\pmn-framework\index.ui.html` | UI Skeleton | The lightweight HTML layout (~40KB) without manuscript text |
| `D:\pmn-framework\style.css` | CSS Styles | Core styling, fonts, and dark/light modes |
| `D:\pmn-framework\app.js` | UI Logic | Interactive features (Command Palette, popovers, Local LLM terminal) |
| `D:\pmn-framework\data\` | Core Data | Contains glossary dictionaries, relations, lookups, and quotes |
| `D:\pmn-framework\data\parts\` | Manuscript | Split JSON files (`part_Preface.json` to `part_Coda.json`) containing raw text |
| `D:\pmn-framework\scripts\import_pmn_docx.py` | Importer | Vanilla Python DOCX parser & modular JSON part splitter |
| `D:\pmn-framework\scripts\test_dynamic_docx.py` | Stress Tester | Pure-Python OOXML script verifying dynamic UI & schema growth |
| `D:\pmn-framework\supabase\` | Backend SQL | Migration schemas and SQL procedures for Supabase backend |
| `D:\pmn-framework\src\lib\` | Backend Libs | Client scaffolds and backend helpers for database coordination |
| `D:\pmn-framework\index.html` | Compiled Monolith | The single 2.56 MB output compiled automatically for the public |

---

## ⚡ AUTOMATION, COMPILATION & TESTING CENTER

Your workspace is fully automated, removing any requirement for legacy manual CLI commands:
*   **`00_PMN_WORKSPACE.bat`**: Launches the main interactive Python console (`pmn_console.py`). This is the **super main dashboard** where you can view live repository telemetry (version, glossary count, section totals), compile with one key, start the local server, split files, and preview blueprints in a retro-styled interactive shell.
*   **The Lightning Compiler (`modularizer.py compile`)**:
    1.  **Safety Backup (`index.html.bak`):** Automatically copies the previous version of `index.html` as a fallback backup before writing a new compiled build.
    2.  **Syntax Linter:** Blocks compilation upon syntax issues (invalid commas/JSON) to preserve visual integrity.
    3.  **AI Grounding Corpus (`pmn_corpus_for_ai.md`):** Automatically compiles the entire philosophy and key glossary into a clean, flat Markdown file (stripped of HTML tags) at the root, optimized for instant ingestion by RAG scrapers or external LLMs.
*   **Word Manuscript Importer (`scripts/import_pmn_docx.py`)**:
    1.  **Zip & OOXML Surgery:** Unpacks the Microsoft Word `.docx` file in `docx_source/` natively using Python's core libraries (zero external dependencies).
    2.  **Robust Tag Matching:** Uses attribute-order-agnostic regular expressions to match and replace payload tags (`<script id="d-parts" type="application/json">` or any attribute ordering) inside both `index.html` and `index.ui.html`.
    3.  **Flexible Version Parsing:** Automatically extracts the manuscript version from the `.docx` filename, normalizing underscores and dots (e.g. `PMN_Framework_v116_2.docx` resolves to standard public label **`v116.2`**).
    4.  **Automatic Persistence:** Writes the resolved version directly into the visual template `index.ui.html` so future compilations keep the version synchronized.

---

## 🛠️ CRITICAL CODE & FORMATTING RULES (FOR AIs)

When editing or updating files inside `data/parts/`, you **MUST** strictly adhere to these standards:

1.  **JSON Double Quote Escaping:** Because HTML text is wrapped inside a JSON string, all double quotes in HTML attributes or classes **MUST** be escaped with a backslash `\"` (e.g., `<p class=\"intro\">` or `&ldquo;quote&rdquo;`). Failure to do this breaks the compiler!
2.  **Cross-References (Xref Links):** Links referencing other sections (e.g., section 1.1) **MUST** be formatted using the exact class and `data-sid` parameters:
    `<a class=\"xref\" href=\"#1.1\" data-sid=\"1.1\">1.1</a>`
3.  **Paragraph Wrapping:** Wrap every separate body paragraph cleanly inside `<p>...</p>`.
4.  **No Monolith Edits:** **NEVER** edit `index.html` directly. Only edit modular files (`data/parts/part_*.json` or `index.ui.html`) and compile them.

---

## 🔑 KEY GLOSSARY DEFINITIONS

Always maintain these definitions with perfect precision. Never summarize or change their core meaning:
*   `"inaction as choice"`: *"The analytical recognition that not intervening in an existing arrangement is a material decision that sustains its current dynamics, including its structural production of suffering. (1.5)"*
*   `"minimal anchor"`: *"The most defensible universal evaluative criterion: organisms with the capacity to suffer do not choose to suffer. This biological fact grounds evaluation without importing prior moral commitments."*
*   `"becoming"`: *"The capacity to develop cognitively, morally, and creatively beyond the conditions determined by birth. The ceiling of PMN's evaluative framework..."*

---

## 💡 SYSTEM LOGS & TROUBLESHOOTING

Maintain this log chronologically. Always check this section before executing tasks.

### 📅 May 24, 2026: Importer Regex Upgrade & Dynamic Stress-Testing
*   **Situation:** The Word importer failed to locate payload script tags inside production compiled files due to reversed HTML attribute ordering (`type` before `id`). Emojis in terminal logs also threw charmap encoding exceptions on Windows consoles.
*   **Action Taken:**
    1.  Upgraded `replace_json_script` in `import_pmn_docx.py` to use an attribute-order-agnostic regular expression (`rf'<script\s+[^>]*id="..."[^>]*>.*?</script>'`).
    2.  Added persistent version synchronization into `index.ui.html` during manuscript import.
    3.  Created a pure-Python OOXML testing suite `scripts/test_dynamic_docx.py` that dynamically appends new parts to a Word file, imports, compiles, programmatically asserts UI responsiveness, and cleans up.
    4.  Removed Unicode emojis from logs, replacing them with standard plain-text status labels (`[PASS]`, `[FAIL]`, `[SUCCESS]`) to avoid Windows code page `cp1252` encoding issues.
*   **Outcome:** All stress-tests successfully passed. The pipeline is mathematically and empirically proven to scale seamlessly with manuscript growth!
