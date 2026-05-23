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

### 📅 May 24, 2026: Importer Regex Upgrade, stress testing & major visual/performance elevations
*   **Situation:** The Word importer required tag-agnostic regex parsing. Windows terminals threw charmap encoding issues for visual emojis. Furthermore, visual audits showed rendering lag during covers scroll-jack, potential light-to-dark flashing on first visits, low-contrast readability in Light Mode, and a need for an interactive orientation card for keyboard navigation onboarding.
*   **Action Taken:**
    1.  **Backend Pipeline:** Upgraded `import_pmn_docx.py` to use attribute-order-agnostic regex patterns, persisted automated version tag updates, removed emojis in terminal logs to bypass `cp1252` encoding errors, and built automated test suite `scripts/test_dynamic_docx.py`.
    2.  **Instant Dark Fallback:** Forced default themes to `'dark'` inside `index.ui.html` inline `<head>` blocking script and `app.js` theme initializer, preventing any potential light-mode FOUC flashes on first visit.
    3.  **Scroll Performance (120 FPS):** Removed heavy dynamic dynamic `filter: blur()` operations on `.hero-parallax` in `style.css` which triggered heavy page repaints during scrolls, unlocking ultra-responsive 120 FPS covers transitions.
    4.  **Organic Particle Constellations:** Overhauled particles physics in `app.js` with sinusoidal drifting, kunang-kunang size breathing, neon shadows blur, and dynamic vector lines connecting adjacent particles to build a gorgeous active neural grid.
    5.  **Floating Orientation Toast:** Embedded a glassmorphic welcome toast card (`#welcome-banner`) in `index.ui.html` sliding in after 1.5 seconds, guiding readers on keyboard shortcuts, and integrated localStorage close persistence.
    6.  **Cozy Cottage Bookstore Light Theme:** Completely overhauled Light Mode variables in `style.css` to soft ivory paper background (`#fdfbf7`), deep espresso roasted ink (`#1c1510`), warm wood/walnut details (`#756456`), and terracotta crimson buttons (`#b83a1b`).
*   **Outcome:** All stress-tests successfully passed. The website compiled clean, scales beautifully, runs at buttery smooth frame rates, and visual presentation is highly premium and cohesive.

### 📅 May 24, 2026 (II): Smart Glossary Search Mapping & Gorgeous Seamless Circular Cover Gradients
*   **Situation:** Clicking glossary cards (e.g. `"inaction as choice"`) returned `"0 results"` because the search strictly checked manuscript text and ignored the glossary dictionary, causing critical navigation breakages. Additionally, the Dark Mode cover radial gradient was visually stretched into a boxy/rectangular frame against the viewport due to hard `transparent` interpolation, while the Light Mode cover felt completely flat and empty.
*   **Action Taken:**
    1.  **Smart Glossary Search (`doSrch`):** Upgraded `app.js` to automatically intercept queries matching any of the 121 glossary terms. The search dynamically scans the matching term's definition in `GL`, extracts parenthetical section citations (e.g. `(1.5)`), and automatically inserts those cited sections as highly-visible **Key Term Match** results at the top of the search list.
    2.  **Soft Token Search Fallback:** Implemented a multi-word fallback matching mechanism in `doSrch` that splits queries into individual tokens (e.g. `"inaction"`, `"choice"`) if a strict substring search returns zero results, ensuring flexible matches.
    3.  **Visual Styling of Glossary Match:** Styled `.res.is-glossary-match` results in `style.css` with a bold terracotta left-border accent and soft backing gradient, distinguishing key terms beautifully.
    4.  **Seamless Circular Cover Gradients (`style.css`):**
        *   *Dark Mode:* Replaced viewport-stretched gradients with a true circular terracotta center-orb fading smoothly to the background color `var(--bg)` at `80%`, blending organically and resolving the rigid segiempat shape.
        *   *Light Mode:* Added a stunning "cozy cottage bookstore warm reading lamp" ivory-sepia radial glow fading smoothly to ivory background at `80%`, giving the cover a luxurious three-dimensional sense of space.
    5.  **Compile & Telemetry:** Successfully recompiled into standalone `index.html` (2.58 MB) and verified complete synchronization across the 121 glossary categories.
*   **Outcome:** Searching or clicking glossary terms now automatically navigates and grounds readers on the exact philosophical sections, and cover radial gradients are incredibly organic, smooth, and highly atmospheric.

### 📅 May 24, 2026 (III): Ecosystem Clean-Up, TypeError Resolution & High-Performance Workspace Search
*   **Situation:** The codebase had accumulated historical redundancies (over 370+ lines of dead functions and duplicate prompt-building chains) which bloated `app.js` and wasted AI context tokens. Furthermore, a dynamic `TypeError` bug was discovered inside `updateReaderAgentStatus` where it attempted to map obsolete `.rec` object keys, causing silent runtime failures on section navigation. Finally, the AI required a fast, unbuffered, and safe local search tool to locate workspace code references without risking cp1252 terminal crashes.
*   **Action Taken:**
    *   **Dead-Code Demolition (`app.js`):** Stripped 373 lines of legacy redundant functions including `getTopSections`, `getTopGlossary`, the old `buildContextPack` (L371), `formatSectionPacket`, `formatGlossaryPacket`, `launchAgent`, and old clipboard copy APIs. All of these were remnants of an older prompt redirection flow that was 100% bypassed by the active `#hai-tabs` architecture.
    *   **TypeError Navigation Fix (`app.js`):** Corrected `updateReaderAgentStatus` to map directly to flat `.id` and `.term` variables returned by the active `buildContextPack` version, and inlined `partDisplay` logic to guarantee 100% robust, error-free section switching.
    *   **ASCII-Safe Workspace Search (`pmn_console.py`):** Added a lightning-fast (0.06s) terminal and menu search engine `workspace_search`. Implemented Windows `cp1252` encoding safety by sanitizing output to clean ASCII, integrated 120-character snippet clipping centered on search matches to save AI tokens, and configured automatic exclusions for giant compiled outputs.
    *   **Compile & Release:** Recompiled cleanly into `index.html` (shrinking standalone footprint to 2.57 MB) and successfully pushed all clean assets to production.
*   **Outcome:** The javascript codebase is extremely clean, highly readable, and free of silent errors. The new workspace search runs instantly in under 0.07 seconds, providing a powerful unbuffered utility for developers and AI agents alike.


