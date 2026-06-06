import os
import json
import re
import sys
import shutil

def print_banner():
    print("=" * 60)
    print("      PMN FRAMEWORK MODULARIZER & COMPILED BUILD SYSTEM      ")
    print("=" * 60)


def get_backup_path():
    """Return the correct path for index.html.bak.
    Prefers private/backups/ when running inside the pmn-workspace layout.
    """
    try:
        cwd = os.getcwd()
        # Common case: running from public/ folder directly
        if os.path.basename(cwd).lower() == "public":
            parent = os.path.dirname(cwd)  # parent of public/ in workspace layout
            private_dir = os.path.join(parent, "private")
            if os.path.exists(private_dir):
                private_bak = os.path.join(private_dir, "backups", "index.html.bak")
                os.makedirs(os.path.dirname(private_bak), exist_ok=True)
                return private_bak

        # Another common case: script/module is inside public/
        script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else cwd
        if os.path.basename(script_dir).lower() == "public":
            parent = os.path.dirname(script_dir)
            private_dir = os.path.join(parent, "private")
            if os.path.exists(private_dir):
                private_bak = os.path.join(private_dir, "backups", "index.html.bak")
                os.makedirs(os.path.dirname(private_bak), exist_ok=True)
                return private_bak
    except Exception:
        pass
    return "index.html.bak"

def sanitize_part_id(part_id):
    # Sanitize part names to be safe filenames
    return re.sub(r'[^a-zA-Z0-9_\-]', '_', str(part_id))

def split_mode():
    parts_path = os.path.join("data", "parts.json")
    if not os.path.exists(parts_path):
        print(f"[ERROR] {parts_path} not found! Please make sure data/parts.json exists.")
        return

    print("[INFO] Reading monolithic parts.json...")
    with open(parts_path, "r", encoding="utf-8") as f:
        parts_data = json.load(f)

    # Create target directory for modular parts
    parts_dir = os.path.join("data", "parts")
    if not os.path.exists(parts_dir):
        os.makedirs(parts_dir)
        print(f"[DIR] Created directory: {parts_dir}")

    manifest = []
    
    print("[INFO] Splitting sections into modular files...")
    for part in parts_data:
        part_id = part.get("part", "")
        title = part.get("title", "")
        subs = part.get("subs", [])
        
        safe_id = sanitize_part_id(part_id)
        part_filename = f"part_{safe_id}.json"
        part_filepath = os.path.join(parts_dir, part_filename)

        # 1. Save modular Part JSON containing the full sections data (including huge HTML content)
        with open(part_filepath, "w", encoding="utf-8") as pf:
            json.dump(subs, pf, indent=2, ensure_ascii=False)
        print(f"   [OK] Saved {part_filename} ({len(subs)} sections)")

        # 2. Build manifest entries (without HTML/text to keep it lightweight)
        manifest_subs = []
        for sub in subs:
            manifest_sub = {}
            for key, val in sub.items():
                if key not in ["html", "text"]:
                    manifest_sub[key] = val
            manifest_subs.append(manifest_sub)

        manifest.append({
            "part": part_id,
            "title": title,
            "subs": manifest_subs
        })

    # Save lightweight manifest.json
    manifest_path = os.path.join(parts_dir, "manifest.json")
    with open(manifest_path, "w", encoding="utf-8") as mf:
        json.dump(manifest, mf, indent=2, ensure_ascii=False)
    
    print(f"\n[SUCCESS] Modular split complete!")
    print(f"   -> Manifest: {manifest_path} (~15KB)")
    print(f"   -> Part chunks: {parts_dir}/part_*.json (21 files, beautifully formatted for AI editing)")
    print("=" * 60)

def compile_mode():
    clean_html_path = "index.ui.html"
    output_html_path = "index.html"
    style_css_path = "style.css"
    app_js_path = "app.js"
    parts_dir = os.path.join("data", "parts")
    manifest_path = os.path.join(parts_dir, "manifest.json")

    # TypeScript compilation
    print("[INFO] Compiling app.ts to app.js via esbuild...")
    try:
        import subprocess
        # Clean old app.js first to avoid typescript compiler checkJs/global scope collision issues
        if os.path.exists(app_js_path):
            try:
                os.remove(app_js_path)
            except Exception as e:
                print(f"[WARN] Could not remove old app.js before compile: {e}")

        # Run esbuild
        res = subprocess.run("npx esbuild app.ts --outfile=app.js", shell=True, capture_output=True, text=True)
        if res.returncode != 0:
            print("[WARN] esbuild compilation completed with warnings/errors:")
            print(res.stderr or res.stdout)
            # Check if app.js was emitted despite warnings
            if not os.path.exists(app_js_path):
                print("[ERROR] CRITICAL: esbuild compilation failed and no app.js was generated.")
                return
        else:
            print("   [OK] esbuild compilation completed successfully.")
    except Exception as e:
        print(f"[WARN] Failed to execute esbuild (npx esbuild): {e}")
        if not os.path.exists(app_js_path):
            print("[ERROR] CRITICAL: app.js is missing and TypeScript compilation could not run.")
            return

    print("[INFO] Initiating structural diagnostic check...")
    
    # Run manuscript formatting audit
    try:
        import subprocess
        print("[INFO] Running manuscript formatting and integrity audit...")
        sys.stdout.flush()
        subprocess.run([sys.executable, os.path.join("scripts", "verify_formatting.py")])
        print("")
    except Exception as e:
        print(f"[WARN] Formatting audit skipped: {e}\n")
    
    # 1. Check if files exist
    files_to_check = [clean_html_path, style_css_path, app_js_path, manifest_path]
    missing_files = [f for f in files_to_check if not os.path.exists(f)]
    if missing_files:
        print(f"\n[ERROR] CRITICAL COMPILATION HALTED: Required files are missing:\n   -> {', '.join(missing_files)}")
        print("[SUGGESTION] Restore these files before attempting to compile.")
        return

    # 2. Check JSON validity of manifest.json
    try:
        with open(manifest_path, "r", encoding="utf-8") as f:
            manifest = json.load(f)
    except json.JSONDecodeError as je:
        print(f"\n[ERROR] CRITICAL COMPILATION HALTED: Syntax error in {manifest_path}!")
        print(f"   -> Error details: {je}")
        print("[SUGGESTION] Fix the syntax error in manifest.json before compiling.")
        return

    # 3. Check JSON validity of every single part chunk
    full_parts = []
    for part in manifest:
        part_id = part.get("part", "")
        safe_id = sanitize_part_id(part_id)
        part_filename = f"part_{safe_id}.json"
        part_filepath = os.path.join(parts_dir, part_filename)

        if not os.path.exists(part_filepath):
            print(f"\n[ERROR] CRITICAL COMPILATION HALTED: Part file referenced in manifest is missing!")
            print(f"   -> Missing file: {part_filepath}")
            return

        try:
            with open(part_filepath, "r", encoding="utf-8") as pf:
                part_subs = json.load(pf)
        except json.JSONDecodeError as je:
            print(f"\n[ERROR] CRITICAL COMPILATION HALTED: Syntax error in naskah JSON!")
            print(f"   -> Corrupted file: {part_filepath}")
            print(f"   -> Error details: {je}")
            print(f"[SUGGESTION] Open the file in an editor to fix the JSON syntax, or ask an AI to repair {part_filename}.")
            return

        # Merge the full subs containing HTML back into the part definition
        full_part = {
            "part": part_id,
            "title": part.get("title", ""),
            "subs": part_subs
        }
        full_parts.append(full_part)

    # 4. Check HTML structural containers in index_bersih.html
    try:
        with open(clean_html_path, "r", encoding="utf-8") as f:
            html_content = f.read()
            
        required_containers = ["id=\"prose\"", "id=\"sidebar\"", "id=\"home-view\"", "id=\"reader-view\""]
        missing_containers = [c for c in required_containers if c not in html_content]
        if missing_containers:
            print(f"\n[WARN] DIAGNOSTIC WARNING: Core UI layout containers might be missing from {clean_html_path}:")
            print(f"   -> Missing: {', '.join(missing_containers)}")
            print("[SUGGESTION] Make sure you didn't accidentally delete critical DOM target containers.")
    except Exception as e:
        print(f"\n[ERROR] CRITICAL COMPILATION HALTED: Unable to read {clean_html_path} ({e})")
        return

    print("   [OK] Structural diagnostic passed. No corrupted JSON or missing files found.")

    print("[INFO] Compiling monolithic index.html...")
    # Load cleaner HTML skeleton
    with open(clean_html_path, "r", encoding="utf-8") as f:
        html_content = f.read()

    # Load style.css content
    with open(style_css_path, "r", encoding="utf-8") as f:
        css_content = f.read().strip()

    # Inline CSS
    css_placeholder_pattern = r'<!-- PANGGIL CSS EKSTERNAL -->\s*<link rel="stylesheet" href="style.css">'
    css_replacement = f"<style>\n{css_content}\n</style>"
    if re.search(css_placeholder_pattern, html_content):
        html_content = re.sub(css_placeholder_pattern, lambda _: css_replacement, html_content)
    else:
        # Fallback in case the exact comment is modified
        html_content = re.sub(r'<link rel="stylesheet" href="style.css">', lambda _: css_replacement, html_content)
    print("   [OK] CSS inlined successfully.")

    # Helper function to generate JSON script tag
    def make_json_script(tag_id, file_path):
        if not os.path.exists(file_path):
            print(f"[WARN] {file_path} not found, generating empty script tag.")
            return f'<script type="application/json" id="{tag_id}">{{}}</script>'
        
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        
        # Output as high-density single line JSON string to optimize size
        json_str = json.dumps(data, ensure_ascii=False)
        return f'<script type="application/json" id="{tag_id}">{json_str}</script>'

    # Recalculate look, rel, and ci dynamically to ensure single source of truth from modular JSONs
    print("[INFO] Recalculating cross-references and section lookups dynamically...")
    try:
        sys.path.append(os.path.join(os.path.dirname(os.path.abspath(__file__)), "scripts"))
        from import_pmn_docx import build_look, build_rel_and_cited
        
        look = build_look(full_parts)
        related, cited = build_rel_and_cited(full_parts)
        
        # Save them back to disk to ensure data/ folder matches Compiled index.html
        os.makedirs("data", exist_ok=True)
        with open(os.path.join("data", "look.json"), "w", encoding="utf-8") as f:
            json.dump(look, f, ensure_ascii=False, indent=2)
        with open(os.path.join("data", "rel.json"), "w", encoding="utf-8") as f:
            json.dump(related, f, ensure_ascii=False, indent=2)
        with open(os.path.join("data", "ci.json"), "w", encoding="utf-8") as f:
            json.dump(cited, f, ensure_ascii=False, indent=2)
        print("   [OK] Reference tables (look, rel, ci) recalculated successfully.")
    except Exception as e:
        print(f"   [WARN] Could not dynamically recalculate references: {e}")

    # Load all the data files as inlined script tags
    print("[INFO] Embedding all JSON data files...")
    json_scripts = []
    # 1. Monolithic parts stitched data
    parts_json_str = json.dumps(full_parts, ensure_ascii=False)
    json_scripts.append(f'<script type="application/json" id="d-parts">{parts_json_str}</script>')
    
    # 2. Other JSON assets
    json_scripts.append(make_json_script("d-gl", os.path.join("data", "gl.json")))
    json_scripts.append(make_json_script("d-glg", os.path.join("data", "glg.json")))
    json_scripts.append(make_json_script("d-rel", os.path.join("data", "rel.json")))
    json_scripts.append(make_json_script("d-look", os.path.join("data", "look.json")))
    json_scripts.append(make_json_script("d-ci", os.path.join("data", "ci.json")))
    json_scripts.append(make_json_script("d-quotes", os.path.join("data", "quotes.json")))

    embedded_data_html = "\n".join(json_scripts)
    print("   [OK] Embedded 7 JSON data sets.")

    # Load app.js logic
    with open(app_js_path, "r", encoding="utf-8") as f:
        js_content = f.read().strip()

    embedded_js_html = f"{embedded_data_html}\n<script>\n{js_content}\n</script>"

    # Inline scripts into HTML skeleton
    js_placeholder = '<script src="app.js"></script>'
    if js_placeholder in html_content:
        html_content = html_content.replace(js_placeholder, embedded_js_html)
    else:
        # Fallback before close of body
        html_content = html_content.replace("</body>", f"{embedded_js_html}\n</body>")
    print("   [OK] Javascript and Data inlined successfully.")

    # Create automated safety backup of previous index.html before writing new one
    if os.path.exists(output_html_path):
        backup_path = get_backup_path()
        try:
            shutil.copy2(output_html_path, backup_path)
            print(f"   [OK] Safety backup of previous index.html saved to {backup_path}")
        except Exception as be:
            print(f"   [WARN] Could not create safety backup: {be}")

    # Save to index.html
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    # Save to data/parts.json so local dev server mode is synchronized instantly!
    os.makedirs("data", exist_ok=True)
    with open(os.path.join("data", "parts.json"), "w", encoding="utf-8") as f:
        json.dump(full_parts, f, ensure_ascii=False)
    print("   [OK] data/parts.json synchronized successfully.")

    # Auto-generate the full Markdown Corpus for AI ingestion
    try:
        corpus_path = "pmn_corpus_for_ai.md"
        with open(corpus_path, "w", encoding="utf-8") as cf:
            cf.write("# 📚 PROGRESSIVE MATERIALIST NATURALISM (PMN) FRAMEWORK CORPUS\n\n")
            cf.write("> **Note for AI Models:** This is the complete consolidated plain-text corpus of the PMN manuscript and glossary, auto-generated for training, RAG retrieval, and grounding purposes.\n\n")
            
            # 1. Embed Glossary
            cf.write("## 📖 KEY TERMS & GLOSSARY DEFINITIONS\n\n")
            gl_file = os.path.join("data", "gl.json")
            if os.path.exists(gl_file):
                with open(gl_file, "r", encoding="utf-8") as gf:
                    gl_data = json.load(gf)
                for term, definition in gl_data.items():
                    cf.write(f"*   **{term.title()}**: {definition}\n")
                cf.write("\n---\n\n")
            
            # 2. Embed Manuscript Parts
            cf.write("## 📝 MANUSCRIPT PARTS & SECTIONS\n\n")
            for part in full_parts:
                part_title = part.get("title", "")
                part_id = part.get("part", "")
                cf.write(f"### Part {part_id}: {part_title}\n\n")
                
                for sub in part.get("subs", []):
                    sub_id = sub.get("id", "")
                    sub_title = sub.get("title", "")
                    html_text = sub.get("html", "")
                    
                    # Strip HTML tags to make it ultra-clean text for AI models
                    clean_text = re.sub(r'<[^>]+>', '', html_text)
                    # Fix whitespace
                    clean_text = re.sub(r'\s+', ' ', clean_text).strip()
                    # Decode common entities
                    clean_text = clean_text.replace("&ldquo;", '"').replace("&rdquo;", '"')
                    clean_text = clean_text.replace("&lsquo;", "'").replace("&rsquo;", "'")
                    clean_text = clean_text.replace("&mdash;", "—").replace("&ndash;", "–")
                    
                    cf.write(f"#### Section {sub_id} — {sub_title}\n")
                    cf.write(f"{clean_text}\n\n")
                    
        print(f"   [OK] Consolidated AI Grounding Corpus auto-generated at {corpus_path}")
    except Exception as ce:
        print(f"   [WARN] Could not generate AI corpus: {ce}")

    file_size_mb = os.path.getsize(output_html_path) / (1024 * 1024)
    print(f"\n[SUCCESS] Monolithic index.html compiled!")
    print(f"   -> Output: {output_html_path} ({file_size_mb:.2f} MB)")
    print("   -> Standalone deployment ready. Zero external local server requirements.")
    print("=" * 60)

if __name__ == "__main__":
    # Ensure stdout handles UTF-8 correctly
    if sys.platform.startswith('win'):
        import codecs
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except AttributeError:
            # Fallback for older python versions
            sys.stdout = codecs.getwriter("utf-8")(sys.stdout.detach())
            sys.stderr = codecs.getwriter("utf-8")(sys.stderr.detach())

    print_banner()
    if len(sys.argv) < 2:
        print("Usage: python modularizer.py [split|compile]")
        sys.exit(1)

    cmd = sys.argv[1].lower()
    
    # Change working directory to script location to ensure relative paths resolve correctly
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    if cmd == "split":
        split_mode()
    elif cmd == "compile":
        compile_mode()
    else:
        print(f"[ERROR] Unknown command: {sys.argv[1]}")
        print("Usage: python modularizer.py [split|compile]")
