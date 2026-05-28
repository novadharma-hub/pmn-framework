# 🚀 Progressive Materialist Naturalism (PMN) Reader Platform

[![Version](https://img.shields.io/badge/Release-v116.2-blueviolet.svg?style=flat-square)](#)
[![Architecture](https://img.shields.io/badge/Architecture-Hybrid%20Modular--Monolith-brightgreen.svg?style=flat-square)](#)
[![AI-Ready](https://img.shields.io/badge/AI--Grounding-Corpus%20Enabled-orange.svg?style=flat-square)](#)
[![Deployment](https://img.shields.io/badge/Runtime-Offline%20Zero--Dependencies-blue.svg?style=flat-square)](#)

Welcome to the **Progressive Materialist Naturalism (PMN) Ecosystem**! This repository hosts the interactive, offline-first reader platform for the PMN philosophical manuscript—a framework designed for analyzing material reality, minimizing structural suffering, and maximizing genuine becoming.

To prevent token bloat during AI pair-programming sessions, the large 2.6 MB manuscript is engineered under a **Hybrid Modular-Monolith** design: the document remains divided into 21 lightweight JSON chunks for rapid, inexpensive AI editing, which are then compiled on-demand into a high-performance standalone webpage.

---

## 📂 Repository Directory Tree

A professional overview of the workspace directory layout:

```text
pmn-framework/
├── 🚀 00_PMN_WORKSPACE.bat    ← Super main dashboard launcher (One-click entry point!)
├── 📝 CARA_PAKAI_PMN.txt      ← Front-page workspace quick start guide for human developers
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
│   │   ├── parts.json         ← Bundled JSON parts used by development server
│   │   └── parts/
│   │       ├── manifest.json  ← Lightweight catalog tracking parts & section metadata
│   │       └── part_*.json    ← 21 Modular chapter files (~10KB to ~300KB)
│   │
│   └── scripts/               ← Helper tools, document importers, and launchers
│       ├── test_dynamic_docx.py ← Programmatic pure-Python stress tester verifying schema growth
│       ├── import_pmn_docx.py   ← Custom utility to import .docx files into JSON segments
│       └── utils/             ← Auxiliary utility scripts (inspect_parts.py)
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
├── ⚡ Supabase Backend Scaffold (Phase 1 Ready)
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

### 2. Auto-Import from Word (.docx)
The importer tool (`scripts/import_pmn_docx.py`) native-parses your Word manuscript in `docx_source/`:
*   Extracts the version from the filename and updates all templates to reflect standard decimal labeling (e.g., `v116.2`).
*   Stitches and modularizes all chapters into standard JSON structures safely.

### 3. Compilation and Linting
*   **Automatic Safety Backup:** Automatically backs up the previous working `index.html` as `index.html.bak` prior to compilation.
*   **Linter:** Prevents compilation if there are JSON syntax errors.
*   **AI Markdown Corpus:** Converts the entire manuscript and glossary into a flat, plain-text Markdown file (`pmn_corpus_for_ai.md`) stripped of HTML tags and special entities, optimized for ingestion by **Custom GPTs**, **LM Studio RAG**, or **Gemini context windows**.

---

## 🛠️ Formatting Rules for AI Developers

If you are pair-programming with an AI model (Gemini, Claude, or custom LLMs), they **MUST** strictly adhere to these workspace standards to avoid breaking compilation:

1.  **JSON Double Quote Escaping:** Since manuscript text is wrapped inside a JSON string value, all double quotes in HTML attributes or classes **MUST** be escaped using a backslash `\"` (e.g., `<span class=\"highlight\">text</span>`).
2.  **Cross-References (Xref Links):** Internal section links (e.g., section 3.2) must be formatted exactly using:
    ``<a class=\"xref\" href=\"#3.2\" data-sid=\"3.2\">3.2</a>``
3.  **No Direct Monolith Edits:** Never edit `index.html` directly. Always make edits to modular parts inside `data/parts/` or the UI visual layout `index.ui.html`, then run compile via the dashboard.

---

## 💎 Premium Features Showcase

*   **Dialectical Synthesis Terminal (Local AI):** Integrated in-browser typewriter-styled chatbot that connects to secure local models or APIs to answer philosophical inquiries, turning references into clickable navigation buttons.
*   **Wikipedia-Style Hover Previews:** Elegantly styled radial-gradient glassmorphism popovers showing section content when hovering over any `#xref` link.
*   **Universal Command Palette (Ctrl+K):** A sliding dark-mode HUD interface allowing instant keyword searches, focus mode toggles, glossary searches, and random reading selections.

---

## 🇮🇩 Dokumentasi Proyek (Bahasa Indonesia)

Selamat datang di **Ekosistem Pembaca Manuskrip PMN**! Repositori ini menyediakan platform pembaca offline-first interaktif untuk naskah filosofis PMN—sebuah kerangka kerja untuk menganalisis realitas material, meminimalkan penderitaan struktural, dan memaksimalkan aktualitas potensi diri (*genuine becoming*).

### Arsitektur Hybrid Modular-Monolith
Untuk mencegah pemborosan kuota token saat Anda melakukan pemrograman berpasangan dengan AI (ChatGPT/Gemini/Claude), naskah besar sebesar 2.6 MB ini dipecah secara modular menjadi **21 file JSON bab berukuran kecil (~10KB)** di folder `data/parts/`. 

Setiap kali Anda selesai melakukan perubahan naskah atau merombak tata letak visual di `index.ui.html`, Anda cukup mengklik ganda launcher utama **`00_PMN_WORKSPACE.bat`** dan memilih opsi **Compile** untuk menggabungkan semuanya kembali secara instan menjadi satu file mandiri: `index.html` (2.56 MB).

### Fitur Otomatisasi Utama:
1.  **Impor Langsung dari Microsoft Word:** Cukup taruh file `.docx` naskah baru Anda ke folder `docx_source/`, lalu jalankan menu Impor. Skrip Python bawaan akan secara otomatis memecah naskah dan memperbarui label versi di seluruh sistem (misal menjadi `v116.2`).
2.  **Linter Kompilasi & Backup Otomatis:** Compiler secara otomatis membuat file cadangan `index.html.bak` untuk keamanan sebelum menulis versi baru, serta memblokir kompilasi jika mendeteksi ada salah ketik tanda baca (error JSON) dari AI.
3.  **Penyediaan Korpus Grounding AI:** Setiap kali dikompilasi, sistem otomatis membuat file Markdown polos `pmn_corpus_for_ai.md` yang bersih dari kode HTML di halaman depan, siap untuk langsung disuapkan ke Custom GPTs atau Gemini untuk pemahaman naskah yang sangat presisi!

---

## 📖 Panduan Alur Kerja Harian: Dari Naskah Word Hingga ke GitHub (Bagi Pemula)

Berikut adalah panduan langkah-demi-langkah yang sangat mudah diikuti oleh orang awam untuk memperbarui website filosofi PMN dari Microsoft Word hingga terbit dengan aman di GitHub publik tanpa khawatir kebocoran data pribadi:

### 1️⃣ LANGKAH 1: EDIT NASKAH DI MICROSOFT WORD
* Buka dokumen manuskrip filosofi PMN Anda di **Microsoft Word** seperti biasa.
* Lakukan penulisan atau revisi bab sesuka hati Anda.
* Setelah selesai, klik **Save As** dan simpan dengan nama berformat versi terbaru, misalnya: `PMN_Framework_v117.docx` atau `PMN_Framework_v116_3.docx`.
* > [!IMPORTANT]
  > **Tutup Microsoft Word Anda!** Jangan biarkan Word tetap terbuka, karena Windows akan mengunci berkas tersebut dan menghalangi skrip kompilator untuk membacanya.

### 2️⃣ LANGKAH 2: MASUKKAN KE FOLDER SUMBER
* Pindahkan file `.docx` baru Anda tersebut ke dalam folder:
  `D:\pmn-framework\docx_source\`
* *(Catatan: Pastikan hanya ada satu file `.docx` aktif di folder ini agar sistem pemecah otomatis tidak mengalami kebingungan).*

### 3️⃣ LANGKAH 3: IMPOR & KOMPILASI OTOMATIS
* Klik ganda (double-click) file launcher utama Anda:
  `D:\pmn-framework\00_PMN_WORKSPACE.bat`
* Konsol kendali utama PMN yang interaktif akan terbuka di layar Anda.
* Ketik angka **`3`** lalu tekan **Enter** untuk memilih menu **`IMPORT WORD NASKAH`**.
* Sistem akan membaca dokumen Word Anda, memecahnya menjadi file bab JSON, menyesuaikan nomor versi di header web, dan mengompilasi halaman web final `index.html` secara otomatis dalam 2 detik!

### 4️⃣ LANGKAH 4: STERILKAN METADATA & CADANGKAN (AMAN DARI LEAKS!)
* Masih di dalam konsol utama yang sama, ketik angka **`8`** lalu tekan **Enter** untuk memilih menu **`SECURE META REMOVER`**.
* Skrip akan menanyakan apakah Anda ingin melakukan sterilisasi massal. Ketik **`Y`** lalu **Enter**.
* Sistem secara instan akan:
  * Menyapu bersih nama asli pembuat dan properti komputer dari metadata dokumen draf.
  * Melakukan audit keamanan internal pasca-proses untuk memastikan berkas benar-benar steril.
  * Menyimpan salinan steril di folder aman `docs/clean_outputs/` (yang disembunyikan otomatis dari git).
  * Mengirim salinan steril tersebut langsung ke grup Telegram Log Anda sebagai cadangan rahasia!
* *(Alternatif Cepat: Anda juga bisa langsung menyeret/drag file Word mentah Anda dari Windows Explorer dan menjatuhkannya/drop tepat di atas berkas batch `BERSIHKAN_DAN_BACKUP_DOKUMEN.bat`)*.

### 5️⃣ LANGKAH 5: DORONG KE GITHUB HANYA DENGAN 1 KLIK!
* Setelah kompilasi dan pembersihan selesai, cari file berikut di root folder Anda:
  `D:\pmn-framework\KIRIM_KE_GITHUB.bat`
* **Klik ganda (double-click) file `KIRIM_KE_GITHUB.bat` tersebut.**
* Masukkan pesan pembaruan singkat saat diminta (misal: `Update Bab 5` atau cukup tekan **Enter** untuk pesan otomatis), lalu biarkan skrip berjalan sendiri.
* *Selesai! Seluruh perubahan website final beserta dokumen steril Anda kini telah resmi terunggah dengan aman dan steril ke GitHub publik!* 🫡🚀🔥

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to use, modify, and distribute the PMN Reader Platform offline or online as a framework for navigating material reality.

---

*“Philosophers have only interpreted the world in various ways. The point, however, is to reconstruct its material foundations.”* — Nova Dharma
