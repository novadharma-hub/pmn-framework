import os
import sys
import zipfile
import re
import stat

# Setup pypdf
try:
    import pypdf
except ImportError:
    import subprocess
    subprocess.run([sys.executable, "-m", "pip", "install", "pypdf"], check=True)
    import pypdf

sensitive_terms = ["ali", "ikhsan"]

def clear_readonly(path):
    # Bersihkan atribut Read-Only pada Windows agar berkas bisa ditimpa
    try:
        if os.path.exists(path):
            os.chmod(path, stat.S_IWRITE)
    except Exception:
        pass

def clean_docx_metadata(input_path):
    clear_readonly(input_path)
    temp_path = input_path + ".tmp"
    try:
        with zipfile.ZipFile(input_path, 'r') as yin:
            with zipfile.ZipFile(temp_path, 'w', zipfile.ZIP_DEFLATED) as yout:
                for item in yin.infolist():
                    data = yin.read(item.filename)
                    if item.filename == 'docProps/core.xml':
                        xml_str = data.decode('utf-8', errors='ignore')
                        xml_str = re.sub(r'<dc:creator>.*?</dc:creator>', '<dc:creator>Anonymous</dc:creator>', xml_str)
                        xml_str = re.sub(r'<cp:lastModifiedBy>.*?</cp:lastModifiedBy>', '<cp:lastModifiedBy>Anonymous</cp:lastModifiedBy>', xml_str)
                        xml_str = re.sub(r'<cp:revision>.*?</cp:revision>', '<cp:revision>1</cp:revision>', xml_str)
                        data = xml_str.encode('utf-8')
                    elif item.filename == 'docProps/app.xml':
                        xml_str = data.decode('utf-8', errors='ignore')
                        xml_str = re.sub(r'<Company>.*?</Company>', '<Company>Anonymous</Company>', xml_str)
                        data = xml_str.encode('utf-8')
                    yout.writestr(item, data)
        if os.path.exists(input_path):
            os.remove(input_path)
        os.rename(temp_path, input_path)
        return True
    except Exception as e:
        import traceback
        traceback.print_exc()
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"      [ERROR] Gagal DOCX: {e}")
        return False

def clean_pdf_metadata(input_path):
    clear_readonly(input_path)
    temp_path = input_path + ".tmp"
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
        with open(temp_path, "wb") as f:
            writer.write(f)
        if os.path.exists(input_path):
            os.remove(input_path)
        os.rename(temp_path, input_path)
        return True
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        print(f"      [ERROR] Gagal PDF: {e}")
        return False

def verify_cleanliness(file_path):
    ext = os.path.splitext(file_path)[1].lower()
    if ext == '.docx':
        try:
            with zipfile.ZipFile(file_path, 'r') as z:
                for xml_name in ['docProps/core.xml', 'docProps/app.xml']:
                    if xml_name in z.namelist():
                        content = z.read(xml_name).decode('utf-8', errors='ignore').lower()
                        for term in sensitive_terms:
                            if term in content:
                                return False
            return True
        except Exception:
            return False
    elif ext == '.pdf':
        try:
            reader = pypdf.PdfReader(file_path)
            meta = reader.metadata
            if meta:
                for key, val in meta.items():
                    val_str = str(val).lower()
                    for term in sensitive_terms:
                        if term in val_str:
                            return False
            return True
        except Exception:
            return False
    return True

def main():
    root_dir = r"D:\pmn-framework"
    exclude_dirs = {'.git', 'venv', 'node_modules', 'clean_outputs'}
    
    print("=============================================================")
    print("   MEMULAI SAPU BERSIH METADATA SECARA IN-PLACE (SEMENTARA)")
    print("=============================================================")
    
    count_docx = 0
    count_pdf = 0
    
    for root, dirs, files in os.walk(root_dir):
        # Prune excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext not in ('.docx', '.pdf'):
                continue
            if file.startswith("~$"): # Skip temp office lock files
                continue
                
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, root_dir)
            print(f"[*] Mensterilkan: {rel_path}...")
            
            success = False
            if ext == '.docx':
                success = clean_docx_metadata(filepath)
                if success:
                    count_docx += 1
            elif ext == '.pdf':
                success = clean_pdf_metadata(filepath)
                if success:
                    count_pdf += 1
                    
            if success:
                # Double-check
                is_safe = verify_cleanliness(filepath)
                if is_safe:
                    print(f"   [OK] Lolos Audit & Ditimpa dengan versi steril!")
                else:
                    print(f"   [WARN] Gagal audit keamanan pasca-proses!")
            else:
                print(f"   [FAIL] Gagal memproses berkas.")
                
    print("=============================================================")
    print(f"SELESAI: Berhasil mensterilkan {count_docx} DOCX dan {count_pdf} PDF in-place!")
    print("=============================================================")

if __name__ == "__main__":
    main()
