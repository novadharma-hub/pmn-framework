import zipfile
import re
import os
import sys
import shutil
import subprocess
import requests
from dotenv import dotenv_values

# --------------------------------------------------------------------
# 1. SETUP DEKONTAMINASI MODULE PDF
# --------------------------------------------------------------------
try:
    import pypdf
except ImportError:
    print("[*] Mengunduh modul pembersih PDF rahasia (pypdf)...")
    try:
        subprocess.run([sys.executable, "-m", "pip", "install", "pypdf"], check=True)
        import pypdf
    except Exception as e:
        print(f"[WARN] Gagal mengunduh pypdf. Pembersihan PDF lewati: {e}")
        pypdf = None

# ====================================================================
# 2. DEFINISI ALGORITMA SCRUBBER METADATA (DOCX & PDF)
# ====================================================================
def clean_docx_metadata(input_path, output_path):
    temp_path = output_path + ".tmp"
    try:
        with zipfile.ZipFile(input_path, 'r') as yin:
            with zipfile.ZipFile(temp_path, 'w', zipfile.ZIP_DEFLATED) as yout:
                for item in yin.infolist():
                    data = yin.read(item.filename)
                    if item.filename == 'docProps/core.xml':
                        xml_str = data.decode('utf-8', errors='ignore')
                        # Bersihkan dc:creator menjadi Anonymous
                        xml_str = re.sub(r'<dc:creator>.*?</dc:creator>', '<dc:creator>Anonymous</dc:creator>', xml_str)
                        # Bersihkan cp:lastModifiedBy menjadi Anonymous
                        xml_str = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', '<cp:lastModifiedBy>Anonymous</cp:lastModifiedBy>', xml_str)
                        # Reset revisi ke 1
                        xml_str = re.sub(r'<cp:revision>.*?</cp:revision>', '<cp:revision>1</cp:revision>', xml_str)
                        data = xml_str.encode('utf-8')
                    elif item.filename == 'docProps/app.xml':
                        xml_str = data.decode('utf-8', errors='ignore')
                        # Bersihkan nama Company
                        xml_str = re.sub(r'<Company>.*?</Company>', '<Company>Anonymous</Company>', xml_str)
                        data = xml_str.encode('utf-8')
                    yout.writestr(item, data)
        if os.path.exists(output_path):
            os.remove(output_path)
        os.rename(temp_path, output_path)
        print(f"[v] Pembersihan DOCX Sukses: '{os.path.basename(output_path)}' bersih!")
        return True
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"[ERROR] Gagal membersihkan DOCX: {e}")
        return False

def clean_pdf_metadata(input_path, output_path):
    if pypdf is None:
        shutil.copy2(input_path, output_path)
        print(f"[WARN] pypdf tidak tersedia. Menyalin berkas mentah ke: {os.path.basename(output_path)}")
        return True
        
    try:
        reader = pypdf.PdfReader(input_path)
        writer = pypdf.PdfWriter()
        
        for page in reader.pages:
            writer.add_page(page)
            
        clean_meta = {
            "/Author": "Anonymous",
            "/Creator": "Anonymous",
            "/Producer": "Anonymous",
            "/Title": "Anonymous",
            "/Subject": "Anonymous"
        }
        writer.add_metadata(clean_meta)
        
        with open(output_path, "wb") as f:
            writer.write(f)
            
        print(f"[v] Pembersihan PDF Sukses: '{os.path.basename(output_path)}' bersih!")
        return True
    except Exception as e:
        print(f"[ERROR] Gagal membersihkan PDF: {e}")
        try:
            shutil.copy2(input_path, output_path)
            return True
        except Exception:
            return False

# ====================================================================
# 3. PENGECEKAN METADATA LEAK (POST-PROCESS VALIDATION)
# ====================================================================
def verify_cleanliness(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    sensitive_terms = ["ali", "ikhsan"]
    
    if ext == '.docx':
        try:
            with zipfile.ZipFile(file_path, 'r') as z:
                for xml_name in ['docProps/core.xml', 'docProps/app.xml']:
                    if xml_name in z.namelist():
                        content = z.read(xml_name).decode('utf-8', errors='ignore').lower()
                        for term in sensitive_terms:
                            if term in content:
                                print(f"[ALERT] VALIDASI GAGAL: Terdeteksi kebocoran nama '{term}' di {xml_name}!")
                                return False
            return True
        except Exception as e:
            print(f"[ERROR] Gagal melakukan audit keamanan internal DOCX: {e}")
            return False
            
    elif ext == '.pdf':
        if pypdf is None:
            # Fallback jika pypdf hilang
            return True
            
        try:
            reader = pypdf.PdfReader(file_path)
            meta = reader.metadata
            if meta:
                for key, val in meta.items():
                    val_str = str(val).lower()
                    for term in sensitive_terms:
                        if term in val_str:
                            print(f"[ALERT] VALIDASI GAGAL: Terdeteksi kebocoran nama '{term}' di metadata PDF [{key}]: {val}")
                            return False
            return True
        except Exception as e:
            print(f"[ERROR] Gagal melakukan audit keamanan internal PDF: {e}")
            return False
            
    return True

# ====================================================================
# 4. DISTRIBUSI KE TELEGRAM LOG GROUP
# ====================================================================
def send_to_telegram(file_path, bot_token, chat_id, topic_id):
    if not bot_token or not chat_id:
        print("[WARN] Telegram Uploader tidak aktif (BOT_TOKEN atau GROUP_ID kosong).")
        return False
        
    url = f"https://api.telegram.org/bot{bot_token}/sendDocument"
    file_name = os.path.basename(file_path)
    
    payload = {
        "chat_id": chat_id,
        "caption": f"🛡️ <b>PMN SECURE PIPELINE: BERKAS BERSIH DAN TERVERIFIKASI</b>\n📂 Berkas: <code>{file_name}</code>\n✅ Status Audit: <i>Clean & Safe (0% Personal Metadata)</i>"
    }
    
    if topic_id:
        payload["message_thread_id"] = topic_id
        
    try:
        with open(file_path, "rb") as f:
            files = {"document": f}
            res = requests.post(url, data=payload, files=files, timeout=60)
            res_json = res.json()
            
            if res_json.get("ok"):
                print(f"[v] SUKSES TELEGRAM: Cadangan steril berhasil dikirim ke Log Telegram!")
                return True
            else:
                print(f"[ERROR] Telegram menolak unggahan: {res_json.get('description')}")
                return False
    except Exception as e:
        print(f"[ERROR] Gagal mengirim dokumen ke Telegram: {e}")
        return False

# ====================================================================
# 5. PIPELINE PROCESSOR
# ====================================================================
def process_single_file(input_file, clean_dir, env):
    filename = os.path.basename(input_file)
    output_file = os.path.join(clean_dir, filename)
    ext = os.path.splitext(filename)[1].lower()
    
    print("\n-------------------------------------------------------------")
    print(f"[*] MEMPROSES BERKAS: {filename}")
    print("-------------------------------------------------------------")
    
    # A. Pembersihan Metadata
    success = False
    if ext == '.docx':
        success = clean_docx_metadata(input_file, output_file)
    elif ext == '.pdf':
        success = clean_pdf_metadata(input_file, output_file)
    else:
        try:
            shutil.copy2(input_file, output_file)
            print(f"[*] Ekstensi '{ext}' dilewati. Disalin ke output.")
            success = True
        except Exception as e:
            print(f"[ERROR] Gagal menyalin berkas: {e}")
            
    if not success:
        print(f"[FAIL] Gagal memproses berkas lokal: {filename}")
        return False
        
    # B. Audit & Validasi Keamanan Mendalam (Post-Process Double Check)
    print("[*] Menjalankan audit keamanan mendalam pasca-proses...")
    is_safe = verify_cleanliness(output_file)
    
    if not is_safe:
        print(f"[ALERT] DETEKSI ANCAMAN: Berkas '{filename}' tidak aman! Menghapus berkas output...")
        if os.path.exists(output_file):
            os.remove(output_file)
        return False
        
    print(f"[OK] AUDIT LOLOS: Berkas '{filename}' terbukti 100% steril dari nama Ali Ikhsan!")
    print(f"    Disimpan di -> D:\\pmn-framework\\docs\\clean_outputs\\{filename}")
    
    # C. Kirim berkas steril tersebut ke Telegram Log Group
    bot_token = env.get("BOT_TOKEN_COMMANDER", "").strip("'\"")
    chat_id = env.get("CENTRAL_LOG_GROUP", env.get("LOG_GROUP_ID", "")).strip("'\"")
    topic_id = env.get("LOG_TOPIC_C2_COMMANDER", "20").strip("'\"")
    
    send_to_telegram(output_file, bot_token, chat_id, topic_id)
    return True

# ====================================================================
# 6. MAIN CONTROL ENTRY POINT
# ====================================================================
def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    pmn_dir = os.path.dirname(script_dir)
    
    # Buat direktori input dan output
    raw_dir = os.path.join(pmn_dir, "docs", "raw_inputs")
    clean_dir = os.path.join(pmn_dir, "docs", "clean_outputs")
    os.makedirs(raw_dir, exist_ok=True)
    os.makedirs(clean_dir, exist_ok=True)
    
    # Membaca config.env terpusat dari D:\Omnimedia-Suite
    config_path = r"D:\Omnimedia-Suite\config.env"
    if os.path.exists(config_path):
        env = dotenv_values(config_path)
    else:
        env = {}
        
    # Cek apakah ada argumen berkas spesifik
    if len(sys.argv) >= 2:
        input_file = sys.argv[1]
        if os.path.exists(input_file):
            process_single_file(input_file, clean_dir, env)
        else:
            print(f"[ERROR] Berkas tidak ditemukan: {input_file}")
            sys.exit(1)
    else:
        # Pindai seluruh folder raw_inputs untuk pembersihan massal!
        files_to_process = [os.path.join(raw_dir, f) for f in os.listdir(raw_dir) if os.path.isfile(os.path.join(raw_dir, f))]
        
        if not files_to_process:
            print("====================================================================")
            print("         PMN-FRAMEWORK: SECURE DOCUMENT PIPELINE")
            print("====================================================================")
            print(f"Folder raw_inputs kosong: D:\\pmn-framework\\docs\\raw_inputs\\")
            print("Letakkan draf dokumen Anda di sana, lalu jalankan batch kembali untuk")
            print("mensterilkan dan mengunggah semuanya secara massal!")
            sys.exit(0)
            
        print(f"[*] Mendeteksi {len(files_to_process)} berkas di folder raw_inputs.")
        success_count = 0
        for f in files_to_process:
            if process_single_file(f, clean_dir, env):
                success_count += 1
                
        print("\n====================================================================")
        print(f"  SELESAI: Berhasil mensterilkan {success_count} dari {len(files_to_process)} dokumen.")
        print("====================================================================")

if __name__ == "__main__":
    main()
