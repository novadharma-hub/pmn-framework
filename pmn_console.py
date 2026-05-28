# -*- coding: utf-8 -*-
import os
import sys
import json
import re
import subprocess
import time


def clean_ascii(text):
    # Replaces non-ASCII characters to keep it safe for Windows cp1252 consoles
    return "".join(c if ord(c) < 128 else '?' for c in text)

def workspace_search(query):
    query_lower = query.lower()
    print("\033[96m" + "=" * 65)
    print(f"  SEARCHING WORKSPACE FOR: '{query}'")
    print("=" * 65 + "\033[0m")
    
    extensions = ('.js', '.css', '.html', '.json', '.py', '.md', '.txt')
    exclude_dirs = {'.git', 'docx_source', 'index.html.bak'}
    
    total_matches = 0
    start_time = time.time()
    
    root_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
    
    for root, dirs, files in os.walk(root_dir):
        # Prune excluded directories
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        
        for file in files:
            if not file.endswith(extensions):
                continue
            if file == 'pmn_corpus_for_ai.md' or file == 'index.html' or file == 'index.html.bak':
                # Skip compiled outputs to prevent massive redundant hits
                continue
                
            filepath = os.path.join(root, file)
            rel_path = os.path.relpath(filepath, root_dir)
            
            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    lines = f.readlines()
            except Exception as e:
                continue
                
            file_printed = False
            for idx, line in enumerate(lines):
                if query_lower in line.lower():
                    if not file_printed:
                        print(f"\n\033[93m[MATCH] {rel_path}\033[0m")
                        file_printed = True
                    
                    cleaned_line = line.strip()
                    # Limit long lines (e.g. JSON strings) to 120 chars
                    if len(cleaned_line) > 120:
                        q_pos = cleaned_line.lower().find(query_lower)
                        start_clip = max(0, q_pos - 40)
                        end_clip = min(len(cleaned_line), q_pos + len(query) + 60)
                        cleaned_line = ("..." if start_clip > 0 else "") + cleaned_line[start_clip:end_clip] + ("..." if end_clip < len(cleaned_line) else "")
                        
                    ascii_line = clean_ascii(cleaned_line)
                    print(f"  Line {idx + 1:4d}: {ascii_line}")
                    total_matches += 1
                    
    duration = time.time() - start_time
    print("\033[96m" + "-" * 65 + "\033[0m")
    print(f"  Total Matches: {total_matches} | Time Elapsed: {duration:.3f}s")
    print("\033[96m" + "=" * 65 + "\033[0m")

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')


def get_backup_path():
    """Return the correct path for index.html.bak.
    Prefers private/backups/ when running inside the pmn-workspace layout.
    Falls back to local index.html.bak for single-folder usage.
    """
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        if os.path.basename(script_dir).lower() == "public":
            parent = os.path.dirname(script_dir)  # parent of public/ in workspace layout
            private_dir = os.path.join(parent, "private")
            if os.path.exists(private_dir):
                private_bak = os.path.join(private_dir, "backups", "index.html.bak")
                os.makedirs(os.path.dirname(private_bak), exist_ok=True)
                return private_bak
    except Exception:
        pass
    return "index.html.bak"

def get_system_stats():
    stats = {
        "version": "Unknown",
        "parts": 0,
        "sections": 0,
        "glossary": 0,
        "compiled_size": "Not compiled",
        "backup_status": "No backup",
        "corpus_status": "Missing"
    }
    
    # 1. Parse Version from index.ui.html
    ui_path = "index.ui.html"
    if os.path.exists(ui_path):
        try:
            with open(ui_path, "r", encoding="utf-8") as f:
                content = f.read()
            match = re.search(r"Version\s+([0-9a-zA-Z_\-]+)", content)
            if match:
                stats["version"] = match.group(1)
        except:
            pass
            
    # 2. Parse Parts & Sections from data/parts/manifest.json
    manifest_path = os.path.join("data", "parts", "manifest.json")
    if os.path.exists(manifest_path):
        try:
            with open(manifest_path, "r", encoding="utf-8") as f:
                manifest = json.load(f)
            stats["parts"] = len(manifest)
            total_secs = 0
            for part in manifest:
                total_secs += len(part.get("subs", []))
            stats["sections"] = total_secs
        except:
            pass
            
    # 3. Parse Glossary count from data/gl.json
    gl_path = os.path.join("data", "gl.json")
    if os.path.exists(gl_path):
        try:
            with open(gl_path, "r", encoding="utf-8") as f:
                gl = json.load(f)
            stats["glossary"] = len(gl)
        except:
            pass
            
    # 4. Compiled File Size (index.html)
    compiled_path = "index.html"
    if os.path.exists(compiled_path):
        try:
            size_mb = os.path.getsize(compiled_path) / (1024 * 1024)
            stats["compiled_size"] = f"{size_mb:.2f} MB"
        except:
            pass
            
    # 5. Safety Backup Check
    backup_path = get_backup_path()
    if os.path.exists(backup_path):
        try:
            mtime = os.path.getmtime(backup_path)
            time_str = time.strftime('%H:%M:%S', time.localtime(mtime))
            stats["backup_status"] = f"Ready ({time_str})"
        except:
            stats["backup_status"] = "Ready"
            
    # 6. Corpus Status Check
    corpus_path = "pmn_corpus_for_ai.md"
    if os.path.exists(corpus_path):
        try:
            size_kb = os.path.getsize(corpus_path) / 1024
            stats["corpus_status"] = f"Compiled ({size_kb:.1f} KB)"
        except:
            stats["corpus_status"] = "Compiled"
            
    return stats

def print_dashboard():
    stats = get_system_stats()
    
    # Elegant Retro ASCII Art Header
    print("\033[96m" + "=" * 65)
    print("  _____  __  __ _   _   _____ ___  _   _ ____   ___  _     _____ ")
    print(" |  __ \\|  \\/  | \\ | | /  ___/ _ \\| \\ | / ___| / _ \\| |   | ____|")
    print(" | |__) | |\\/| |  \\| | | |  | | | |  \\| \\___ \\| | | | |   |  _|  ")
    print(" |  ___/| |  | | |\\  | | |__| |_| | |\\  |___) | |_| | |___| |___ ")
    print(" |_|    |_|  |_|_| \\_| \\____\\___/|_| \\_|____/ \\___/|_____|_____|")
    print("             PROGRESSIVE MATERIALIST NATURALISM ECOSYSTEM")
    print("=" * 65 + "\033[0m")
    
    # Workspace Telemetry Metadata
    print(f" \033[90m[SYSTEM METADATA]\033[0m")
    print(f"  ● Active Version   : \033[93m{stats['version']}\033[0m")
    print(f"  ● Total Parts      : \033[92m{stats['parts']} groups\033[0m            ● Total Sections : \033[92m{stats['sections']} sections\033[0m")
    print(f"  ● Glossary Terms   : \033[95m{stats['glossary']} concepts\033[0m          ● Compiled Size  : \033[93m{stats['compiled_size']}\033[0m")
    print(f"  ● Safety Backup    : \033[96m{stats['backup_status']}\033[0m     ● Grounding Corpus: \033[96m{stats['corpus_status']}\033[0m")
    print("\033[90m" + "-" * 65 + "\033[0m")
    
    # Alur Kerja Harian - Lengkap, urut, dan ramah pemula
    print(" \033[93m[ALUR KERJA HARIAN - CUKUP IKUTI LANGKAH INI]\033[0m")
    print("  \033[97m1.\033[0m Edit naskah di Microsoft Word → simpan ke \\private\\docx_source\\")
    print("  \033[97m2.\033[0m Tekan \033[92m[1]\033[0m → STAGED DOCX IMPORT (naskah dipecah otomatis)")
    print("  \033[97m3.\033[0m (Opsional) Edit \\data\\parts\\ (konten) atau \\index.ui.html\\ (tampilan)")
    print("        Catatan: UI biasanya jarang berubah. Kebanyakan update hanya di konten dari Word.")
    print("  \033[97m4.\033[0m Tekan \033[92m[2]\033[0m → LIGHTNING COMPILE (gabungkan semua jadi index.html)")
    print("  \033[97m5.\033[0m Tekan \033[92m[3]\033[0m → SECURE META REMOVER (bersihkan metadata)")
    print("  \033[97m6.\033[0m Tekan \033[92m[4]\033[0m → KIRIM KE GITHUB (push perubahan)")
    print("\033[90m" + "-" * 65 + "\033[0m")
    
    # Menu - Diurutkan persis mengikuti alur kerja harian (sangat awam friendly)
    print(" \033[97m[ALUR KERJA UTAMA]\033[0m")
    print("  \033[92m[1]\033[0m STAGED DOCX IMPORT     \033[90m(1. Ambil naskah dari Word)\033[0m")
    print("  \033[92m[2]\033[0m LIGHTNING COMPILE      \033[90m(2. Jadikan index.html)\033[0m")
    print("  \033[92m[3]\033[0m SECURE META REMOVER    \033[90m(3. Bersihkan metadata)\033[0m")
    print("  \033[92m[4]\033[0m KIRIM KE GITHUB        \033[90m(4. Push ke GitHub)\033[0m")
    print()
    print(" \033[97m[ALAT PENDUKUNG]\033[0m")
    print("  \033[92m[5]\033[0m RESTORE STABLE BACKUP  \033[90m(Kembalikan ke versi lama)\033[0m")
    print("  \033[92m[6]\033[0m LAUNCH DEV SERVER      \033[90m(Preview di browser)\033[0m")
    print("  \033[92m[7]\033[0m SPLIT TO JSON          \033[90m(Edit per bagian)\033[0m")
    print()
    print("  \033[92m[8]\033[0m DIAGNOSTICS            \033[90m(Cek sistem)\033[0m")
    print("  \033[92m[9]\033[0m SEARCH                 \033[90m(Cari di kode)\033[0m")
    print("  \033[92m[10]\033[0m BLUEPRINT              \033[90m(Lihat panduan sistem)\033[0m")
    print("  \033[92m[11]\033[0m BACKUP & ROLLBACK      \033[90m(Snapshot lengkap)\033[0m")
    print("  \033[92m[12]\033[0m BANTUAN EDIT UI        \033[90m(Panduan lengkap edit tampilan website)\033[0m")
    print("  \033[91m[0]\033[0m EXIT")
    print("\033[96m" + "=" * 65 + "\033[0m")

def show_blueprint():
    clear_screen()
    print("\033[95m" + "=" * 65)
    print("              SYSTEM BLUEPRINT & CONTEXT SUMMARY (AI.md)")
    print("=" * 65 + "\033[0m\n")
    if os.path.exists("AI.md"):
        try:
            with open("AI.md", "r", encoding="utf-8") as f:
                lines = f.readlines()
            for line in lines[:40]: # Print first 40 lines of blueprint
                print("  " + line.rstrip())
            print("\n  \033[90m... (Truncated. Open D:\\pmn-framework\\AI.md for full context) ...\033[0m")
        except Exception as e:
            print(f"  Failed to read AI.md: {e}")
    else:
        print("  AI.md blueprint was not found in the root directory.")
    print("\n\033[95m" + "=" * 65 + "\033[0m")
    input("\n  Press Enter to return to Dashboard...")

def main():
    # Direct CLI search handling
    if len(sys.argv) > 1 and sys.argv[1].lower() == 'search':
        if len(sys.argv) > 2:
            workspace_search(sys.argv[2])
        else:
            print("Usage: python pmn_console.py search \"<query>\"")
        sys.exit(0)
    if sys.platform.startswith('win'):
        os.system("title PMN Framework - Central Console Dashboard")
        os.system("color 0F")
        
        # Enable ANSI codes support in Windows console
        try:
            import ctypes
            kernel32 = ctypes.windll.kernel32
            kernel32.SetConsoleMode(kernel32.GetStdHandle(-11), 7)
        except:
            pass

    while True:
        clear_screen()
        print_dashboard()
        
        try:
            choice = input(" \033[93mEnter choice [0-10]: \033[0m").strip()
        except KeyboardInterrupt:
            print("\n\n  Exiting control dashboard. Sampai jumpa, Komandan!")
            break
            
        if choice == "1":
            print("\n\033[93m[SAFETY CHECK - PEMASANGAN NASKAH / UI]\033[0m")
            q1 = input("  Apakah Komandan sudah menyinkronkan naskah Word baru atau mengedit file UI? (y/n): ").strip().lower()
            if q1 != 'y':
                print("  [INFO] Silakan lengkapi berkas naskah/UI Anda terlebih dahulu. Kompilasi dibatalkan.")
                input("\n  Press Enter to continue...")
                continue
                
            q2 = input("  Apakah naskah tersebut sudah dipecah menjadi berkas JSON modular (Opsi 3/4)? (y/n): ").strip().lower()
            if q2 != 'y':
                print("\n  [TIPS] Sistem merekomendasikan untuk memecah naskah terlebih dahulu agar data terbarukan.")
                confirm = input("  Apakah Komandan tetap ingin mem-compile dengan database JSON yang ada sekarang? (y/n): ").strip().lower()
                if confirm != 'y':
                    continue

            print("\n\033[96m[RUNNING] Compiling all modular segments...\033[0m")
            time.sleep(0.5)
            # Run modularizer compile mode
            try:
                subprocess.run([sys.executable, "modularizer.py", "compile"], check=True)
            except Exception as e:
                print(f"\n\033[91m[ERROR] Compilation failed: {e}\033[0m")
            input("\n  Press Enter to continue...")
            
        elif choice == "2":
            print("\n\033[92m[RUNNING] Launching Python dev server on port 8000...\033[0m")
            print("\033[90m(To stop server, press CTRL+C inside this window)\033[0m\n")
            time.sleep(1)
            try:
                # Direct import or subprocess run of local server to keep interactive terminal active
                subprocess.run([sys.executable, "jalankan_web.py"])
            except KeyboardInterrupt:
                print("\n  Local server closed successfully.")
            except Exception as e:
                print(f"\n\033[91m[ERROR] Server crash: {e}\033[0m")
            input("\n  Press Enter to return to dashboard...")
            
        elif choice == "3":
            # Resolusi jalur dinamis untuk pmn-workspace
            parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            if os.path.exists(os.path.join(parent_dir, "private", "docx_source")):
                docx_folder = os.path.join(parent_dir, "private", "docx_source")
            elif os.path.exists(r"D:\pmn-workspace\private\docx_source"):
                docx_folder = r"D:\pmn-workspace\private\docx_source"
            else:
                docx_folder = "docx_source"
                
            print(f"\n\033[96m[RUNNING] Scanning folder for manuscripts: {docx_folder}...\033[0m")
            if not os.path.exists(docx_folder):
                try:
                    os.makedirs(docx_folder)
                except:
                    pass
            
            docx_files = []
            if os.path.exists(docx_folder):
                docx_files = [f for f in os.listdir(docx_folder) if f.endswith(".docx") and not f.startswith("~$")]
            
            if not docx_files:
                print(f"\n  \033[91m[WARNING] Tidak ada file Word (.docx) aktif ditemukan di folder: {docx_folder}\033[0m")
                print("  Silakan taruh manuskrip Word (.docx) baru Anda di folder tersebut terlebih dahulu!")
            else:
                print("\n  Berkas naskah Word (.docx) yang tersedia:")
                for idx, fn in enumerate(docx_files):
                    print(f"    \033[92m[{idx + 1}]\033[0m {fn}")
                print("    \033[91m[n]\033[0m Batal")
                
                try:
                    sel = input(f"\n  Pilih naskah untuk diimpor [1-{len(docx_files)}] (atau 'n'): ").strip().lower()
                    if sel.isdigit() and 1 <= int(sel) <= len(docx_files):
                        selected_file = os.path.join(docx_folder, docx_files[int(sel) - 1])
                        print(f"\n\033[96m[IMPORTING]\033[0m Memproses naskah: {selected_file}...")
                        subprocess.run([sys.executable, "scripts/import_pmn_docx.py", "--docx", selected_file], check=True)
                        
                        # Automatically run compiler after successful import
                        print("\n\033[92m[COMPILED]\033[0m Merajut visual web dengan naskah hasil impor baru...")
                        subprocess.run([sys.executable, "modularizer.py", "compile"], check=True)
                    else:
                        print("\n  Operasi impor dibatalkan.")
                except Exception as e:
                    print(f"\n  \033[91m[ERROR] Proses impor atau kompilasi gagal: {e}\033[0m")
            
            input("\n  Press Enter to continue...")
            
        elif choice == "4":
            confirm = input("\n  \033[91m[WARNING]\033[0m Tindakan ini akan memotong parts.json monolithic dan menimpa folder modular. Lanjutkan? (y/n): ").strip().lower()
            if confirm == 'y':
                print("\n\033[96m[RUNNING] Splitting monolithic parts.json...\033[0m")
                try:
                    subprocess.run([sys.executable, "modularizer.py", "split"], check=True)
                except Exception as e:
                    print(f"\n\033[91m[ERROR] Split operation failed: {e}\033[0m")
            else:
                print("\n  Operation canceled.")
            input("\n  Press Enter to continue...")
            
        elif choice == "5":
            backup_path = get_backup_path()
            compiled_path = "index.html"
            if not os.path.exists(backup_path):
                print("\n  \033[91m[ERROR] Tidak ditemukan berkas cadangan stabil index.html.bak!\033[0m")
                print("  Pastikan Komandan sudah pernah melakukan kompilasi minimal satu kali sebelumnya.")
            else:
                print("\n  \033[93m[ROLLBACK SYSTEM]\033[0m")
                confirm = input("  Apakah Komandan yakin ingin membatalkan rilis naskah/UI saat ini\n  dan memulihkan website index.html dari cadangan stabil (index.html.bak)? (y/n): ").strip().lower()
                if confirm == 'y':
                    try:
                        import shutil
                        shutil.copy2(backup_path, compiled_path)
                        print("\n  \033[92m[SUCCESS] Website index.html BERHASIL dikembalikan ke cadangan stabil!\033[0m")
                    except Exception as e:
                        print(f"\n  \033[91m[ERROR] Gagal memulihkan berkas cadangan: {e}\033[0m")
                else:
                    print("\n  Pemulihan cadangan dibatalkan.")
            input("\n  Press Enter to continue...")
            
        elif choice == "6":
            show_blueprint()
            
        elif choice == "7":
            query = input("\n  Enter search query: ").strip()
            if query:
                workspace_search(query)
            else:
                print("  Empty query. Search canceled.")
            input("\n  Press Enter to return to dashboard...")
            
        elif choice == "8":
            print("\n\033[93m[SECURE METADATA REMOVER & BACKUP PIPELINE]\033[0m")
            try:
                # Run the newly created metadata cleaner and distributor script
                subprocess.run([sys.executable, "scripts/strip_metadata_and_backup.py"], check=True)
            except Exception as e:
                print(f"\n\033[91m[ERROR] Gagal menjalankan pembersih dokumen: {e}\033[0m")
            input("\n  Press Enter to continue...")
            
        elif choice == "9":
            print("\n\033[93m[RUNNING SYSTEM DIAGNOSTICS & AI RESCUE PIPELINE]\033[0m")
            try:
                subprocess.run([sys.executable, "scripts/pmn_diagnostics.py"], check=True)
            except Exception as e:
                print(f"\n\033[91m[ERROR] Gagal menjalankan diagnostik: {e}\033[0m")
            input("\n  Press Enter to continue...")
            
        elif choice == "10":
            print("\n\033[93m[RUNNING SYSTEM SNAPSHOTS BACKUP & ROLLBACK PIPELINE]\033[0m")
            try:
                subprocess.run([sys.executable, "scripts/pmn_backup.py"], check=True)
            except Exception as e:
                print(f"\n\033[91m[ERROR] Gagal menjalankan utilitas backup: {e}\033[0m")
            input("\n  Press Enter to continue...")
            
        elif choice == "11":
            print("\n\033[93m[STAGED DOCX IMPORT WITH VALIDATION LAYERS]\033[0m")
            print("This will run the new multi-stage pipeline with early validation checks.")
            try:
                from scripts.docx_import_pipeline import run_staged_import
                from pathlib import Path

                # Reuse the same private docx_source detection logic
                parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
                if os.path.exists(os.path.join(parent_dir, "private", "docx_source")):
                    docx_folder = os.path.join(parent_dir, "private", "docx_source")
                elif os.path.exists(r"D:\pmn-workspace\private\docx_source"):
                    docx_folder = r"D:\pmn-workspace\private\docx_source"
                else:
                    docx_folder = "docx_source"

                docx_files = []
                if os.path.exists(docx_folder):
                    docx_files = [f for f in os.listdir(docx_folder) if f.endswith(".docx") and not f.startswith("~$")]

                if not docx_files:
                    print(f"\n[ERROR] Tidak ada file .docx di {docx_folder}")
                else:
                    print(f"\nDitemukan file di {docx_folder}:")
                    for i, f in enumerate(docx_files, 1):
                        print(f"  [{i}] {f}")

                    try:
                        selection = int(input("\nPilih nomor file untuk di-import dengan staged validation: ").strip())
                        if 1 <= selection <= len(docx_files):
                            chosen_file = os.path.join(docx_folder, docx_files[selection-1])
                            report = run_staged_import(Path(chosen_file), verbose=True)
                            report.print_detailed_report()

                            if report.overall_success:
                                print("\n[INFO] Staged validation passed. You can now proceed with normal Import (menu 3) or Compile.")
                            else:
                                print("\n[WARN] Staged validation menemukan masalah. Disarankan perbaiki dulu sebelum import penuh.")
                        else:
                            print("Pilihan tidak valid.")
                    except ValueError:
                        print("Input tidak valid.")
            except Exception as e:
                print(f"\n[ERROR] Gagal menjalankan staged pipeline: {e}")
            input("\n  Press Enter to continue...")

        elif choice == "12":
            print("\n\033[93m[BANTUAN EDIT UI / TAMPILAN WEBSITE]\033[0m")
            print("Mengubah tampilan website melibatkan 3 file utama:")
            print("  • index.ui.html   → Struktur & kerangka halaman")
            print("  • style.css       → Semua desain visual (warna, spacing, tema, dll)")
            print("  • app.js          → Logika interaktif (pencarian, AI, popover, dll)")
            print()
            print("Pilih aksi cepat:")
            print("  [o] Buka ketiga file UI di editor default Windows")
            print("  [b] Backup ketiga file UI sekaligus (ke folder backups/ui/)")
            print("  [f] Buka folder UI saja di Explorer")
            print("  [g] Buka UI_EDITING_GUIDE.md (panduan lengkap)")
            print("  [q] Buka UI_QUICK_REFERENCE.md (versi 1 halaman untuk dicetak)")
            print("  [x] Kembali ke menu utama")
            
            sub_choice = input("\nPilihan: ").strip().lower()
            
            if sub_choice == "o":
                print("\nMembuka file UI...")
                os.system("start index.ui.html")
                os.system("start style.css")
                os.system("start app.js")
                print("Ketiga file telah dibuka di program default Anda.")
                
            elif sub_choice == "b":
                print("\nMelakukan backup ketiga file UI...")
                try:
                    import shutil
                    from datetime import datetime
                    
                    ui_backup_dir = os.path.join("..", "private", "backups", "ui")
                    os.makedirs(ui_backup_dir, exist_ok=True)
                    
                    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                    backup_subdir = os.path.join(ui_backup_dir, f"ui_backup_{timestamp}")
                    os.makedirs(backup_subdir, exist_ok=True)
                    
                    files_to_backup = ["index.ui.html", "style.css", "app.js"]
                    for f in files_to_backup:
                        if os.path.exists(f):
                            shutil.copy2(f, os.path.join(backup_subdir, f))
                            print(f"  ✓ {f} dibackup")
                        else:
                            print(f"  ! {f} tidak ditemukan")
                    
                    print(f"\nBackup selesai ke: {os.path.abspath(backup_subdir)}")
                except Exception as e:
                    print(f"\n[ERROR] Gagal backup UI: {e}")
                    
            elif sub_choice == "f":
                print("\nMembuka folder UI...")
                # Buka folder public (tempat UI files berada)
                os.system("start .")
                print("Folder UI telah dibuka di Explorer.")
                
            elif sub_choice == "g":
                if os.path.exists("UI_EDITING_GUIDE.md"):
                    os.system("start UI_EDITING_GUIDE.md")
                    print("UI_EDITING_GUIDE.md telah dibuka.")
                else:
                    print("File UI_EDITING_GUIDE.md tidak ditemukan di root.")
                    
            elif sub_choice == "q":
                if os.path.exists("UI_QUICK_REFERENCE.md"):
                    os.system("start UI_QUICK_REFERENCE.md")
                    print("UI_QUICK_REFERENCE.md (versi ringkas) telah dibuka.")
                else:
                    print("File UI_QUICK_REFERENCE.md tidak ditemukan.")
            else:
                print("Kembali ke menu utama.")
            input("\n  Tekan Enter untuk kembali...")

        elif choice == "0":
            print("\n  Closing PMN Console. Sampai jumpa, Komandan! 🫡")
            time.sleep(1)
            break
        else:
            print("\n  \033[91mPilihan tidak valid. Silakan masukkan angka 0 s.d 10.\033[0m")
            time.sleep(1.5)

if __name__ == "__main__":
    main()
