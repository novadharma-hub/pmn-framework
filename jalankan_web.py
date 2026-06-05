import os
import sys
import webbrowser
import http.server
import socketserver

# Ensure stdout handles UTF-8 correctly on Windows
if sys.platform.startswith('win'):
    import codecs
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def main():
    # 1. BUNGKUS APP.JS DENGAN ASYNC LOADER (Hanya jika belum dibungkus)
    if not os.path.exists('app.js'):
        print("❌ Error: app.js tidak ditemukan! Pastikan Anda sudah menjalankan ekstraktor.")
        return

    with open('app.js', 'r', encoding='utf-8') as f:
        js_content = f.read()

    # Cek apakah sudah kita perbaiki sebelumnya
    if "function initializeApp()" not in js_content:
        print("🔧 Menambahkan 'Magic Loader' ke app.js agar otomatis membaca JSON...")
        wrapper = """
(async function initializeApp() {
    console.log("Memuat data naskah dari folder data/...");
    const dataFiles = ['parts', 'gl', 'glg', 'rel', 'look', 'ci', 'quotes'];
    const mockData = {};
    
    // Mengambil data dari folder data/
    await Promise.all(dataFiles.map(async (file) => {
        try {
            const res = await fetch(`data/${file}.json`);
            if(res.ok) mockData[`d-${file}`] = await res.text();
        } catch(e) { console.error("Gagal memuat " + file); }
    }));

    // Memanipulasi fungsi bawaan agar Script asli mengira data ada di HTML
    const originalGetElementById = document.getElementById.bind(document);
    document.getElementById = function(id) {
        if (mockData[id]) return { textContent: mockData[id] };
        return originalGetElementById(id);
    };

    console.log("✅ Data berhasil dimuat. Menjalankan aplikasi utama...");
    
    // ================= KODE JAVASCRIPT ASLI DI BAWAH INI =================
"""
        footer = "\n})();"
        
        with open('app.js', 'w', encoding='utf-8') as f:
            f.write(wrapper + js_content + footer)
        print("✅ app.js berhasil diperbaiki!")

    # 2. JALANKAN SERVER LOKAL & BUKA BROWSER
    PORT = 8000
    Handler = http.server.SimpleHTTPRequestHandler
    
    print(f"\n🌍 Memulai Local Server di http://localhost:{PORT}")
    print("Membuka browser otomatis...")
    
    # Buka index.ui.html di browser default
    webbrowser.open(f"http://localhost:{PORT}/index.ui.html")

    # Jalankan server
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print("\n[INFO] Web sedang berjalan! Biarkan jendela hitam ini terbuka.")
        print("[INFO] Tekan CTRL+C di jendela ini jika ingin mematikan web.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer dimatikan. Sampai jumpa!")

if __name__ == "__main__":
    main()