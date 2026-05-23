# -*- coding: utf-8 -*-
import os
import sys
import json
import re
import subprocess
import time

def clear_screen():
    os.system('cls' if os.name == 'nt' else 'clear')

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
    backup_path = "index.html.bak"
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
    
    # Premium Menu Option Rows
    print(" \033[97m[COMMAND MENU - SELECT ACTION]\033[0m")
    print("  \033[92m[1]\033[0m LIGHTNING COMPILE  \033[90m(Rebuild index.html + Backup + AI Corpus)\033[0m")
    print("  \033[92m[2]\033[0m LAUNCH DEV SERVER \033[90m(Run simple HTTP server + Browser preview)\033[0m")
    print("  \033[92m[3]\033[0m EXTRACT TO CHUNKS  \033[90m(Split monolithic data into 21 edit JSONs)\033[0m")
    print("  \033[92m[4]\033[0m SYSTEM BLUEPRINT  \033[90m(Print master AI.md system architecture)\033[0m")
    print("  \033[91m[0]\033[0m EXIT TERMINAL")
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
    # Set Windows Console title and color if on Windows
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
            choice = input(" \033[93mEnter choice [0-4]: \033[0m").strip()
        except KeyboardInterrupt:
            print("\n\n  Exiting control dashboard. Sampai jumpa, Komandan!")
            break
            
        if choice == "1":
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
            confirm = input("\n  \033[91m[WARNING]\033[0m This will split parts.json and overwrite modular chunks. Proceed? (y/n): ").strip().lower()
            if confirm == 'y':
                print("\n\033[96m[RUNNING] Splitting monolithic parts.json...\033[0m")
                try:
                    subprocess.run([sys.executable, "modularizer.py", "split"], check=True)
                except Exception as e:
                    print(f"\n\033[91m[ERROR] Split operation failed: {e}\033[0m")
            else:
                print("\n  Operation canceled.")
            input("\n  Press Enter to continue...")
            
        elif choice == "4":
            show_blueprint()
            
        elif choice == "0":
            print("\n  Closing PMN Console. Sampai jumpa, Komandan Ali Ikhsan! 🫡")
            time.sleep(1)
            break
        else:
            print("\n  \033[91mInvalid option. Please input 0, 1, 2, 3, or 4.\033[0m")
            time.sleep(1.5)

if __name__ == "__main__":
    main()
