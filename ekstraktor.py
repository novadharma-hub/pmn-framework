import os
import re

INPUT_FILE = "index.html"
OUTPUT_HTML = "index_bersih.html"

def main():
    if not os.path.exists(INPUT_FILE):
        print(f"❌ Error: File {INPUT_FILE} tidak ditemukan di folder ini!")
        return

    # Buat folder 'data' jika belum ada
    if not os.path.exists('data'):
        os.makedirs('data')
        print("📁 Folder 'data/' berhasil dibuat.")

    with open(INPUT_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    print("⏳ Sedang memproses file...")

    # 1. EKSTRAK CSS
    css_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL | re.IGNORECASE)
    css_match = css_pattern.search(content)
    if css_match:
        with open('style.css', 'w', encoding='utf-8') as f:
            f.write(css_match.group(1).strip())
        content = css_pattern.sub('<!-- PANGGIL CSS EKSTERNAL -->\n<link rel="stylesheet" href="style.css">', content)
        print("✅ style.css berhasil diekstrak.")

    # Variabel penampung Javascript
    js_codes = []

    # Fungsi untuk memilah JSON dan JS
    def script_replacer(match):
        attrs = match.group(1).lower()
        inner_text = match.group(2)
        
        # Jika ini adalah tag JSON
        if 'application/json' in attrs:
            id_match = re.search(r'id=["\']d-([^"\']+)["\']', attrs)
            if id_match:
                file_name = id_match.group(1)
                with open(f"data/{file_name}.json", 'w', encoding='utf-8') as jf:
                    jf.write(inner_text.strip())
                print(f"✅ data/{file_name}.json berhasil diekstrak.")
            return "" # Hapus dari HTML
            
        # Jika ini adalah tag Javascript biasa
        else:
            js_codes.append(inner_text.strip())
            return "" # Hapus dari HTML

    # 2 & 3. EKSTRAK JSON DAN JAVASCRIPT
    script_pattern = re.compile(r'<script([^>]*)>(.*?)</script>', re.DOTALL | re.IGNORECASE)
    content = script_pattern.sub(script_replacer, content)

    # Simpan semua JS yang terkumpul menjadi satu file app.js
    if js_codes:
        with open('app.js', 'w', encoding='utf-8') as f:
            # Menggabungkan semua blok JS dengan pembatas
            f.write("\n\n/* ========================================= */\n\n".join(js_codes))
        
        # Pasang tag <script src="app.js"> di HTML baru
        content = content.replace('</body>', '<script src="app.js"></script>\n</body>')
        print("✅ app.js berhasil diekstrak.")

    # 4. SIMPAN HTML BERSIH
    content = re.sub(r'\n\s*\n', '\n', content) # Hapus baris kosong berlebih
    with open(OUTPUT_HTML, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n🎉 SELESAI! Buka '{OUTPUT_HTML}' untuk mengecek.")

if __name__ == "__main__":
    main()