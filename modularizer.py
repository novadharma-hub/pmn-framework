import os
import json
import re
import sys

def print_banner():
    print("=" * 60)
    print("      PMN FRAMEWORK MODULARIZER & COMPILED BUILD SYSTEM      ")
    print("=" * 60)

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
    clean_html_path = "index_bersih.html"
    output_html_path = "index.html"
    style_css_path = "style.css"
    app_js_path = "app.js"
    parts_dir = os.path.join("data", "parts")
    manifest_path = os.path.join(parts_dir, "manifest.json")

    # Verification
    files_to_check = [clean_html_path, style_css_path, app_js_path, manifest_path]
    missing_files = [f for f in files_to_check if not os.path.exists(f)]
    if missing_files:
        print(f"[ERROR] Required files are missing: {', '.join(missing_files)}")
        return

    print("[INFO] Stitching modular parts back into a single PARTS array...")
    # Load manifest
    with open(manifest_path, "r", encoding="utf-8") as f:
        manifest = json.load(f)

    full_parts = []
    for part in manifest:
        part_id = part.get("part", "")
        safe_id = sanitize_part_id(part_id)
        part_filename = f"part_{safe_id}.json"
        part_filepath = os.path.join(parts_dir, part_filename)

        if not os.path.exists(part_filepath):
            print(f"[ERROR] Modular part file {part_filepath} not found!")
            return

        with open(part_filepath, "r", encoding="utf-8") as pf:
            part_subs = json.load(pf)

        # Merge the full subs containing HTML back into the part definition
        full_part = {
            "part": part_id,
            "title": part.get("title", ""),
            "subs": part_subs
        }
        full_parts.append(full_part)

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
        html_content = re.sub(css_placeholder_pattern, css_replacement, html_content)
    else:
        # Fallback in case the exact comment is modified
        html_content = re.sub(r'<link rel="stylesheet" href="style.css">', css_replacement, html_content)
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

    # Save to index.html
    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(html_content)

    # Save to data/parts.json so local dev server mode is synchronized instantly!
    os.makedirs("data", exist_ok=True)
    with open(os.path.join("data", "parts.json"), "w", encoding="utf-8") as f:
        json.dump(full_parts, f, ensure_ascii=False)
    print("   [OK] data/parts.json synchronized successfully.")

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
