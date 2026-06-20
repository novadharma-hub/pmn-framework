# -*- coding: utf-8 -*-
import os
import sys
import json
import re
import traceback

sys.stdout.reconfigure(encoding='utf-8')

def clean_ascii(text):
    return "".join(c if ord(c) < 128 else '?' for c in text)

def run_diagnostics():
    script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
    root_dir = os.path.dirname(script_dir)
    os.chdir(root_dir)
    
    report_path = "LENGKAPI_DIAGNOSIS_UNTUK_AI.md"
    
    telemetry = {
        "os": sys.platform,
        "python_version": sys.version.split()[0],
        "pmn_version": "Unknown",
        "glossary_count": 0,
        "parts_count": 0,
        "sections_count": 0,
        "index_html_size": "Missing",
        "corpus_size": "Missing"
    }
    
    checks = []
    errors = []
    warnings = []
    
    # ----------------------------------------------------
    # 1. CORE FILES EXISTENCE CHECK
    # ----------------------------------------------------
    core_files = {
        "legacy/index.ui.html": "UI Layout Skeleton",
        "style.css": "Core Style System",
        "legacy/app.js": "Interactive Logic Script",
        "modularizer.py": "Stitching Compiler",
        "data/gl.json": "Glossary Dictionary Data",
        "data/glg.json": "Glossary Group Taxonomy Data",
        "data/parts.json": "Monolithic Manuscript Data"
    }
    
    exist_count = 0
    for file_path, desc in core_files.items():
        full_path = os.path.join(root_dir, file_path)
        if os.path.exists(full_path):
            exist_count += 1
            size_kb = os.path.getsize(full_path) / 1024
            checks.append(f"| [OK] | File Existence: `{file_path}` | {desc} ({size_kb:.1f} KB) |")
        else:
            checks.append(f"| [FAIL] | File Existence: `{file_path}` | **MISSING!** {desc} is critical! |")
            errors.append(f"CRITICAL FILE MISSING: `{file_path}` ({desc}) is absent from root.")
            
    # ----------------------------------------------------
    # 2. VERSION telemetry
    # ----------------------------------------------------
    ui_path = "legacy/index.ui.html"
    if os.path.exists(ui_path):
        try:
            with open(ui_path, "r", encoding="utf-8") as f:
                content = f.read()
            match = re.search(r"Version\s+([0-9a-zA-Z_\-\.]+)", content)
            if match:
                telemetry["pmn_version"] = match.group(1)
        except Exception as e:
            warnings.append(f"Could not parse PMN version from index.ui.html: {e}")
            
    # ----------------------------------------------------
    # 3. JSON VALIDITY & DEEP SYNTAX AUDIT
    # ----------------------------------------------------
    json_files = [
        "data/gl.json",
        "data/glg.json",
        "data/rel.json",
        "data/look.json",
        "data/ci.json",
        "data/quotes.json",
        "data/parts.json"
    ]
    
    # Also audit parts folder if manifest exists
    parts_dir = os.path.join("data", "parts")
    manifest_path = os.path.join(parts_dir, "manifest.json")
    if os.path.exists(manifest_path):
        json_files.append("data/parts/manifest.json")
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
            for part in manifest:
                part_id = part.get("part", "")
                # Sanitize safe filename
                safe_id = re.sub(r'[^a-zA-Z0-9_\-]', '_', str(part_id))
                json_files.append(f"data/parts/part_{safe_id}.json")
        except Exception as e:
            errors.append(f"JSON CORRUPTION: Could not parse `data/parts/manifest.json` ({e})")
            
    for j_file in json_files:
        full_path = os.path.join(root_dir, j_file)
        if not os.path.exists(full_path):
            continue
        try:
            with open(full_path, "r", encoding="utf-8") as f:
                data = json.load(f)
            checks.append(f"| [OK] | JSON Structure: `{j_file}` | Valid JSON Syntax. |")
            
            # Extract glossary count
            if j_file == "data/gl.json":
                telemetry["glossary_count"] = len(data)
            # Extract parts & sections count
            elif j_file == "data/parts.json":
                telemetry["parts_count"] = len(data)
                secs = 0
                for part in data:
                    secs += len(part.get("subs", []))
                telemetry["sections_count"] = secs
        except json.JSONDecodeError as je:
            checks.append(f"| [FAIL] | JSON Structure: `{j_file}` | **SYNTAX ERROR!** |")
            # Get snippet of error from file
            try:
                with open(full_path, "r", encoding="utf-8") as f:
                    lines = f.readlines()
                err_line = je.lineno
                err_col = je.colno
                snippet = ""
                st_line = max(0, err_line - 4)
                en_line = min(len(lines), err_line + 4)
                for idx in range(st_line, en_line):
                    line_prefix = ">>> " if idx + 1 == err_line else "    "
                    snippet += f"{line_prefix}Line {idx+1:4d}: {lines[idx]}"
                
                errors.append(
                    f"JSON SYNTAX ERROR in `{j_file}`:\n"
                    f"  Message: {je.msg}\n"
                    f"  Location: Line {err_line}, Column {err_col}\n"
                    f"  File Code Context Snippet:\n```json\n{snippet}```"
                )
            except Exception as e:
                errors.append(f"JSON SYNTAX ERROR in `{j_file}`: {je} (context unavailable due to {e})")
        except Exception as e:
            checks.append(f"| [FAIL] | JSON Structure: `{j_file}` | **UNABLE TO READ!** |")
            errors.append(f"FILE READ FAILURE: `{j_file}` ({e})")
            
    # ----------------------------------------------------
    # 4. GLOSSARY & TAXONOMY CONSISTENCY AUDIT
    # ----------------------------------------------------
    gl_path = os.path.join(root_dir, "data", "gl.json")
    glg_path = os.path.join(root_dir, "data", "glg.json")
    if os.path.exists(gl_path) and os.path.exists(glg_path):
        try:
            with open(gl_path, "r", encoding="utf-8") as f:
                gl = json.load(f)
            with open(glg_path, "r", encoding="utf-8") as f:
                glg = json.load(f)
                
            all_glg_terms = set(t for terms in glg.values() for t in terms)
            gl_keys = set(gl.keys())
            
            missing_in_gl = all_glg_terms - gl_keys
            if missing_in_gl:
                checks.append("| [FAIL] | Glossary Integrity: Category Mapping | Terms in glg.json are missing from gl.json! |")
                for t in missing_in_gl:
                    errors.append(f"GLOSSARY INCONSISTENCY: Term '{t}' is defined in `glg.json` categories but missing in `gl.json` dictionary.")
            else:
                checks.append("| [OK] | Glossary Integrity: Category Mapping | Complete dictionary mapping consistency. |")
                
            # Verify UI search empty terms (terms with 0 manuscript results and no parenthetical citations)
            parts_path = os.path.join(root_dir, "data", "parts.json")
            if os.path.exists(parts_path):
                with open(parts_path, "r", encoding="utf-8") as f:
                    parts_data = json.load(f)
                manuscript_text = " ".join(
                    sub.get("html", "") + " " + sub.get("text", "") + " " + sub.get("title", "")
                    for part in parts_data
                    for sub in part.get("subs", [])
                )
                manuscript_clean = re.sub(r"<[^>]+>", " ", manuscript_text).lower()
                
                true_empty = []
                for term in gl.keys():
                    count = manuscript_clean.count(term.lower())
                    has_cit = bool(re.search(r"\(\d+\.\d+[a-z]?\)", gl[term]))
                    if count == 0 and not has_cit:
                        true_empty.append(term)
                        
                if true_empty:
                    checks.append(f"| [WARN] | Glossary Search: Empty Cards | Found {len(true_empty)} empty search card terms in UI. |")
                    for t in true_empty:
                        warnings.append(
                            f"GLOSSARY EMPTY TERM: The term '{t}' is not found in the manuscript text and lacks a parenthetical section citation in its definition.\n"
                            f"  -> UI Outcome: Clicking this card will yield 'No results found.'\n"
                            f"  -> Fix: Either rename it to match a clean keyword in the manuscript, or add a citation to its definition, e.g. '(1.5)'."
                        )
                else:
                    checks.append("| [OK] | Glossary Search: Empty Cards | All terms are fully searchable or cited! |")
        except Exception as e:
            warnings.append(f"Could not perform glossary integrity checks: {e}")

    # ----------------------------------------------------
    # 5. CROSS-REFERENCE AUDIT
    # ----------------------------------------------------
    parts_path = os.path.join(root_dir, "data", "parts.json")
    if os.path.exists(parts_path):
        try:
            with open(parts_path, "r", encoding="utf-8") as f:
                parts_data = json.load(f)
            
            # Map all available section IDs
            valid_secs = set()
            for part in parts_data:
                for sub in part.get("subs", []):
                    valid_secs.add(sub.get("id", "").strip())
                    
            broken_refs = []
            for part in parts_data:
                for sub in part.get("subs", []):
                    html = sub.get("html", "")
                    # Find all data-sid="x.x" in hrefs
                    refs = re.findall(r'data-sid=\\?"([0-9a-zA-Z\.\-_]+)\\?"', html)
                    for r in refs:
                        if r not in valid_secs:
                            broken_refs.append((sub.get("id"), r))
                            
            if broken_refs:
                checks.append(f"| [FAIL] | Cross-References Audit | Found {len(broken_refs)} broken cross-reference links in naskah! |")
                for src, dst in broken_refs:
                    errors.append(f"BROKEN CROSS-REFERENCE: Section `{src}` has a link pointing to non-existent section `{dst}`.")
            else:
                checks.append("| [OK] | Cross-References Audit | All cross-reference links are healthy! |")
        except Exception as e:
            warnings.append(f"Could not perform cross-reference audit: {e}")

    # ----------------------------------------------------
    # 6. SKELETON LAYOUT INTEGRITY (index.ui.html)
    # ----------------------------------------------------
    ui_path = os.path.join(root_dir, "legacy/index.ui.html")
    if os.path.exists(ui_path):
        try:
            with open(ui_path, "r", encoding="utf-8") as f:
                html = f.read()
            required_containers = {
                "id=\"prose\"": "Main reading pane target container",
                "id=\"sidebar\"": "Sidebar navigation menu container",
                "id=\"home-view\"": "Home dashboard panel",
                "id=\"reader-view\"": "Reader view viewport panel",
                "id=\"srch-in\"": "Search query input element",
                "id=\"sv-body\"": "Search viewport search results panel"
            }
            
            missing_layout = []
            for cid, desc in required_containers.items():
                if cid not in html:
                    missing_layout.append(f"`{cid}` ({desc})")
                    
            if missing_layout:
                checks.append("| [FAIL] | UI Layout Skeleton Containers | Critical DOM container IDs are missing! |")
                for item in missing_layout:
                    errors.append(f"CRITICAL LAYOUT ID MISSING in `index.ui.html`: The structural ID {item} was deleted or altered, which will break page rendering.")
            else:
                checks.append("| [OK] | UI Layout Skeleton Containers | Core layout DOM containers verified. |")
        except Exception as e:
            warnings.append(f"Could not perform skeleton layout checks: {e}")

    # ----------------------------------------------------
    # 7. TELEMETRY SIZES
    # ----------------------------------------------------
    compiled_path = os.path.join(root_dir, "index.offline.html")
    if os.path.exists(compiled_path):
        size_mb = os.path.getsize(compiled_path) / (1024 * 1024)
        telemetry["index_html_size"] = f"{size_mb:.2f} MB"
        
    corpus_path = os.path.join(root_dir, "pmn_corpus_for_ai.md")
    if os.path.exists(corpus_path):
        size_kb = os.path.getsize(corpus_path) / 1024
        telemetry["corpus_size"] = f"{size_kb:.1f} KB"

    # ----------------------------------------------------
    # GENERATE THE SYSTEM MD REPORT
    # ----------------------------------------------------
    print(f"\n[*] Generating central Diagnostic Report at '{report_path}'...")
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# 🩺 DIAGNOSTIK MENYELURUH & PAKET PENYELAMATAN AI (PMN ECOSYSTEM)\n\n")
        f.write("> **Panduan untuk Pengguna:** Salin (copy) seluruh isi file ini dan tempelkan (paste) langsung ke chat AI mana pun di web (ChatGPT Free, Claude Web, Gemini Web, dll.) jika Anda mendeteksi error di website atau kegagalan kompilasi. AI web tersebut akan langsung mengerti masalahnya dan memberikan solusi perbaikan kode yang tepat secara offline!\n\n")
        
        # 1. System Telemetry Block
        f.write("## 📊 1. LIVE SYSTEM TELEMETRY METADATA\n\n")
        f.write(f"*   **Platform Sistem Operasi**: {telemetry['os'].upper()}\n")
        f.write(f"*   **Versi Python Lokal**: Python {telemetry['python_version']}\n")
        f.write(f"*   **Versi Publik PMN aktif**: `{telemetry['pmn_version']}`\n")
        f.write(f"*   **Total Bagian (Parts)**: {telemetry['parts_count']} kelompok naskah\n")
        f.write(f"*   **Total Bab (Sections)**: {telemetry['sections_count']} bab naskah\n")
        f.write(f"*   **Total Istilah Glosarium**: {telemetry['glossary_count']} istilah aktif\n")
        f.write(f"*   **Ukuran Berkas Kompilasi (index.html)**: {telemetry['index_html_size']}\n")
        f.write(f"*   **Ukuran Grounding Corpus (AI)**: {telemetry['corpus_size']}\n\n")
        
        # 2. Checklist Table
        f.write("## 📝 2. INTEGRITY CHECKLIST DIAGNOSTIC AUDIT\n\n")
        f.write("| Status | Komponen Pemeriksaan | Detail Temuan & Ukuran |\n")
        f.write("| :---: | :--- | :--- |\n")
        for chk in checks:
            f.write(chk + "\n")
        f.write("\n")
        
        # 3. Comprehensive Errors and Warnings
        f.write("## 🛑 3. ERROR LOGS & WARNING TELEMETRY\n\n")
        
        if errors:
            f.write("### ❌ DETECTED ERRORS (Wajib diperbaiki agar web/compiler tidak rusak):\n\n")
            for idx, err in enumerate(errors):
                f.write(f"{idx+1}. **[ERROR]** {err}\n\n")
        else:
            f.write("### ✅ DETECTED ERRORS: 0 errors detected (Sistem dalam keadaan stabil penuh!).\n\n")
            
        if warnings:
            f.write("### ⚠️ SYSTEM WARNINGS (Potensi optimalisasi atau peringatan visual):\n\n")
            for idx, warn in enumerate(warnings):
                f.write(f"{idx+1}. **[WARNING]** {warn}\n\n")
        else:
            f.write("### ✅ SYSTEM WARNINGS: 0 warnings detected (Sistem bersih 100%!).\n\n")
            
        # 4. The AI Rescue System Prompt and codebase explanation
        f.write("## 🆘 4. AI RESCUE SYSTEM: PROMPT PENYELAMAT UNTUK AI WEB\n\n")
        f.write("Jika Anda mengirim berkas ini ke AI web, **gunakan prompt di bawah ini** sebagai instruksi pembuka bersamaan dengan isi log di atas:\n\n")
        
        f.write("> ### 🎯 PROMPT UNTUK DI-COPY KE WEB AI:\n")
        f.write("> \"*Halo AI! Saya sedang mengelola situs web manuskrip filosofis pribadi bernama **PMN Framework**. Proyek saya menggunakan arsitektur Hybrid Modular-Monolith. Konten naskah dipecah menjadi file JSON modular kecil di folder `data/parts/part_*.json` untuk menghemat token, sedangkan gaya CSS berada di `style.css`, logika interaktif di `app.js`, kerangka HTML di `index.ui.html`, dan glosarium di `data/gl.json`. Semuanya digabungkan menjadi file tunggal `index.html` sebesar 2.6MB oleh skrip compiler `modularizer.py compile`.*\n")
        f.write(">\n")
        f.write("> *Saya baru saja menjalankan uji sistem diagnostik mandiri, dan mendapatkan beberapa log masalah yang tercatat di bawah ini. Tolong analisis kesalahan/peringatan yang ada, berikan instruksi perbaikan kode yang tepat, dan berikan potongan kode pengganti yang aman tanpa merusak struktur compiler ataupun format JSON saya. Berikut adalah metadata diagnostik situs saya:*\n")
        f.write("> \n")
        f.write("> [TEMPELKAN / PASTE BAGIAN 1 S.D 3 DARI LOG DIAGNOSTIK INI DI SINI]\"\n\n")
        
        # 5. Core Rules recap to keep web AI disciplined
        f.write("### 📜 ATURAN PENTING KODE PMN (Agar AI Web Tidak Merusak Sistem Anda):\n\n")
        f.write("Pastikan AI web yang Anda gunakan mematuhi **Aturan Ketat** ini saat menyusun perbaikan:\n")
        f.write("1.  **Dilarang Mengedit index.html Secara Langsung**: Seluruh perubahan konten harus dilakukan pada file JSON modular (`data/parts/part_*.json`, `data/gl.json`, dll.) atau file sumber (`style.css`, `app.js`, `index.ui.html`), kemudian dikompilasi ulang.\n")
        f.write("2.  **Aturan escaping tanda kutip JSON HTML**: Karena teks HTML diletakkan di dalam string JSON, seluruh tanda kutip dua (`\"`) di dalam elemen HTML **WAJIB** di-escape dengan garis miring terbalik (`\\\"`), contoh: `<p class=\\\"box-blue\\\">`.\n")
        f.write("3.  **Tautan Rujukan Silang (Xref Link)**: Semua tautan antar bagian naskah harus menggunakan format kelas dan ID data-sid yang presisi:\n")
        f.write("    `<a class=\\\"xref\\\" href=\\\"#1.1\\\" data-sid=\\\"1.1\\\">1.1</a>`\n")
        
    print(f"[SUCCESS] Diagnostics completed! Report saved to '{report_path}' in UTF-8 format.")
    print("=" * 65)

if __name__ == "__main__":
    run_diagnostics()
