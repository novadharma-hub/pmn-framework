# 🚀 Progressive Materialist Naturalism (PMN) Reader Platform

[![Version](https://img.shields.io/badge/Release-v114-blueviolet.svg?style=flat-square)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20Modular--Monolith-brightgreen.svg?style=flat-square)](#)
[![AI-Ready](https://img.shields.io/badge/AI--Grounding-Corpus%20Enabled-orange.svg?style=flat-square)](#)
[![Deployment](https://img.shields.io/badge/Runtime-Offline%20Zero--Dependencies-blue.svg?style=flat-square)](#)

Welcome to the **Progressive Materialist Naturalism (PMN) Ecosystem**! This repository hosts the interactive offline-first reader platform for the PMN philosophical manuscript—a framework designed for analyzing material reality, minimizing structural suffering, and maximizing genuine becoming.

To prevent token bloat during AI pair programming sessions, the large 2.6 MB manuscript is engineered under a **Hybrid Modular-Monolith** design: the document remains divided into 21 lightweight JSON bab chunks for rapid, inexpensive AI editing, which are then compiled on-demand into a high-performance standalone webpage.

---

## 📂 Repository Directory Tree

A professional overview of the workspace directory layout:

```text
pmn-framework/
├── 🚀 00_PMN_WORKSPACE.bat    ← Super main dashboard launcher (One-click entry point!)
├── 📝 CARA_PAKAI_PMN.txt      ← Front-page workspace quick start guide for editing & compiling
├── 🧠 PANDUAN_PROMPT_AI.md    ← Front-page prompt blueprints to guide developer AI models
│
├── 📂 docx_source/            ← Dedicated folder for **exactly one active MS Word (.docx) file**
│   └── PMN_Framework_v*.docx  ← Splitting source (Any .docx here is processed automatically!)
│
├── 🎨 User Interface & Logic
│   ├── index.ui.html          ← Core visual layout skeleton (Lightweight UI, ~40KB)
│   ├── style.css              ← Elegant typography, glassmorphism UI, & dark/light theme
│   ├── app.js                 ← Interactive features (AI terminal, Command Palette, etc.)
│   └── pmn-agent-guide.html   ← Standalone AI workspace interaction guide
│
├── 📦 Data Directories
│   ├── data/
│   │   ├── gl.json            ← Monolithic glossary dictionary (Key PMN terms)
│   │   ├── parts.json         ← Bundled json parts used by development server
│   │   └── parts/
│   │       ├── manifest.json  ← Lightweight catalog tracking parts & section metadata
│   │       └── part_*.json    ← 21 Modular chapter files (~10KB to ~300KB)
│   │
│   └── scripts/               ← Helper tools, document importers, and launchers
│       ├── compile_pmn.bat    ← Secondary compilation linter batch
│       ├── buka_web.bat       ← Secondary local HTTP web server batch
│       ├── import_pmn_docx.py ← Custom utility to import .docx files into JSON segments
│       └── utils/             ← Auxiliary utility scripts (ekstraktor.py, inspect_parts.py)
│
├── 🧠 AI Grounding & Documentation
│   ├── AI.md                  ← Master workspace context brain (Read first by developer AIs)
│   ├── README.md              ← Main GitHub repository documentation (This file)
│   ├── docs/
│   │   └── supabase-phase1.md ← Database migration guidelines
│   ├── pmn_corpus_for_ai.md   ← Auto-compiled flat markdown text for training / RAG grounding
│   └── Dokumentasi_AI/
│       └── pmn_system_prompt.txt ← Primed developer prompt for LM Studio/OpenAI
│
├── ⚡ Supabase Backend scaffold (Phase 1 Ready)
│   ├── supabase/schema.sql    ← Database schemas and migration steps
│   └── src/lib/supabase.js    ← Supabase initialization helpers
│
└── ⚙️ Configuration
    ├── package.json           ← Node configuration
    ├── vite.config.js         ← Vite deploy config
    ├── .gitignore             ← Git exclusions (caches, logs, index.html.bak)
    └── .editorconfig          ← Workspace code styling configs
```

---

## ⚡ Interactive Dashboard & Automations

Your workspace is fully automated. You do not need to memorise commands; simply use the batch shortcuts:

### 1. The Command Center: `00_PMN_WORKSPACE.bat`
Double-click `00_PMN_WORKSPACE.bat` at the root folder to launch the **Super Main Control Panel** (`pmn_console.py`). It provides a beautiful terminal UI showing live repository stats:
*   Active manuscript version.
*   Total parts & sections count.
*   Glossary term count inside `data/gl.json`.
*   Size of compiled monolithic `index.html`.
*   Existence and timestamp of safety backups.
*   Instant access keys to compile, boot servers, split files, or read blueprints.

### 2. Compilation and Linting: `compile_pmn.bat`
Executes `modularizer.py compile`. It functions as a compiler, structural linter, and grounding builder:
*   **Automatic Safety Backup:** Automatically backs up the previous working `index.html` as `index.html.bak` prior to compilation.
*   **Linter:** Prevents compilation if there are JSON syntax syntax errors.
*   **AI Markdown Corpus:** Converts the entire manuscript and glossary into a flat, plain-text Markdown file (`pmn_corpus_for_ai.md`) stripped of HTML tags and special entities, optimized for ingestion by **Custom GPTs**, **LM Studio RAG**, or **Gemini context windows**.

### 3. Local Server Preview: `buka_web.bat`
Launches `jalankan_web.py` to host the workspace on `http://localhost:8000` and automatically opens `index.ui.html` in your default browser.

---

## 🛠️ Formatting Rules for AI Developers

If you are pair-programming with an AI model (Gemini, Claude, or custom LLMs), they **MUST** strictly adhere to these workspace standards to avoid breaking compilation:

1.  **JSON Double Quote Escaping:** Since naskah text is wrapped inside a JSON string value, all double quotes in HTML attributes or classes **MUST** be escaped using a backslash `\"` (e.g., `<span class=\"highlight\">text</span>`).
2.  **Cross-References (Xref Links):** Internal section links (e.g., section 3.2) must be formatted exactly using:
    ``<a class=\"xref\" href=\"#3.2\" data-sid=\"3.2\">3.2</a>``
3.  **No Direct Monolith Edits:** Never edit `index.html` directly. Always make edits to modular parts inside `data/parts/` or the UI visual layout `index.ui.html`, then run `compile_pmn.bat`.

---

## 💎 Premium Features Showcase

*   **Dialectical Synthesis Terminal (Local AI):** Integrated in-browser typewriter-styled chatbot that connects to secure local models or APIs to answer philosophical inquiries, turning references into clickable navigation buttons.
*   **Wikipedia-Style Hover Previews:** Elegantly styled radial-gradient glassmorphism popovers showing section content when hovering over any `#xref` link.
*   **Universal Command Palette (Ctrl+K):** A sliding dark-mode HUD interface allowing instant keyword searches, focus mode toggles, glossary searches, and random reading selections.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute the PMN Reader Platform offline or online as a framework for navigating material reality.

---

*“Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations.”* — Nova Dharma
