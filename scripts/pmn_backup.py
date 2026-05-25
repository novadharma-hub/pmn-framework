# -*- coding: utf-8 -*-
import os
import sys
import zipfile
import time
import shutil
import re

sys.stdout.reconfigure(encoding='utf-8')

def get_source_files():
    root_dir = r"D:\pmn-framework"
    sources = []
    
    # Core source files
    core_files = ["index.ui.html", "style.css", "app.js"]
    for f in core_files:
        if os.path.exists(os.path.join(root_dir, f)):
            sources.append((os.path.join(root_dir, f), f))
            
    # Modular data files in data/
    data_dir = os.path.join(root_dir, "data")
    if os.path.exists(data_dir):
        for root, dirs, files in os.walk(data_dir):
            for file in files:
                # Exclude the massive compiled parts.json monolith to save space
                if file == "parts.json":
                    continue
                full_path = os.path.join(root, file)
                rel_path = os.path.relpath(full_path, root_dir)
                sources.append((full_path, rel_path))
                
    return sources

def create_snapshot(auto=False):
    root_dir = r"D:\pmn-framework"
    os.chdir(root_dir)
    
    backup_dir = os.path.join(root_dir, "backups")
    if not os.path.exists(backup_dir):
        os.makedirs(backup_dir)
        print(f"[DIR] Created backup directory: {backup_dir}")
        
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    prefix = "auto_snapshot" if auto else "user_snapshot"
    zip_filename = f"{prefix}_{timestamp}.zip"
    zip_path = os.path.join(backup_dir, zip_filename)
    
    sources = get_source_files()
    
    print(f"[*] Packaging {len(sources)} source files into lightweight snapshot...")
    try:
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
            for full_path, rel_path in sources:
                z.write(full_path, rel_path)
                
        size_kb = os.path.getsize(zip_path) / 1024
        print(f"\033[92m[SUCCESS] Workspace Snapshot Created successfully!\033[0m")
        print(f"   -> Backup File: `backups\\{zip_filename}` ({size_kb:.1f} KB)")
        
        # Snapshot Rotation: Keep only the 10 most recent backups to save disk space
        rotate_snapshots(backup_dir)
        return True
    except Exception as e:
        print(f"\033[91m[ERROR] Failed to create snapshot: {e}\033[0m")
        return False

def rotate_snapshots(backup_dir):
    try:
        files = [os.path.join(backup_dir, f) for f in os.listdir(backup_dir) if f.endswith(".zip")]
        if len(files) <= 12: # Keep up to 12 snapshots
            return
        # Sort by modification time (oldest first)
        files.sort(key=os.path.getmtime)
        to_delete = files[:-12]
        for f in to_delete:
            os.remove(f)
            print(f"   [ROTATION] Deleted oldest snapshot to save space: {os.path.basename(f)}")
    except Exception as e:
        print(f"   [WARN] Rotation check failed: {e}")

def list_snapshots():
    root_dir = r"D:\pmn-framework"
    backup_dir = os.path.join(root_dir, "backups")
    if not os.path.exists(backup_dir):
        return []
        
    files = [f for f in os.listdir(backup_dir) if f.endswith(".zip")]
    # Sort newest first
    files.sort(key=lambda x: os.path.getmtime(os.path.join(backup_dir, x)), reverse=True)
    return files

def restore_snapshot(zip_name):
    root_dir = r"D:\pmn-framework"
    os.chdir(root_dir)
    
    zip_path = os.path.join(root_dir, "backups", zip_name)
    if not os.path.exists(zip_path):
        print(f"\033[91m[ERROR] Snapshot file not found: {zip_path}\033[0m")
        return False
        
    print(f"\n\033[93m[ROLLBACK] Initiating system rollback to: {zip_name}...\033[0m")
    
    # 1. Take a safety snapshot of the CURRENT state before overwriting
    print("[*] Taking safety snapshot of current state before rollback...")
    create_snapshot(auto=True)
    
    # 2. Extract and restore
    print(f"[*] Extracting snapshot package...")
    try:
        with zipfile.ZipFile(zip_path, "r") as z:
            # Overwrite all files inside the zip
            z.extractall(root_dir)
            
        print(f"\033[92m[SUCCESS] Workspace files successfully restored to snapshot state!\033[0m")
        
        # 3. Automatically trigger compilation to ensure index.html matches the restored source state
        print("\n[*] Re-compiling website final production HTML to match restored sources...")
        import subprocess
        subprocess.run([sys.executable, "modularizer.py", "compile"], check=True)
        return True
    except Exception as e:
        print(f"\033[91m[ERROR] Rollback failed: {e}\033[0m")
        return False

if __name__ == "__main__":
    if len(sys.argv) > 1:
        cmd = sys.argv[1].lower()
        if cmd == "create":
            create_snapshot(auto=False)
        elif cmd == "create_auto":
            create_snapshot(auto=True)
        elif cmd == "list":
            snaps = list_snapshots()
            for s in snaps:
                print(s)
        elif cmd == "restore" and len(sys.argv) > 2:
            restore_snapshot(sys.argv[2])
    else:
        # Default behavior: Interactive Menu for human double-click execution
        while True:
            print("\n\033[96m=============================================================")
            print("         PMN WORKSPACE SNAPSHOT BACKUP & ROLLBACK UTILITY     ")
            print("=============================================================\033[0m")
            print("  \033[92m[1]\033[0m Create New Source Snapshot   \033[90m(Backup all modular JSONs & UI files)\033[0m")
            print("  \033[92m[2]\033[0m Restore Workspace from Snapshot \033[90m(Rollback system to previous state)\033[0m")
            print("  \033[91m[0]\033[0m Exit Utility")
            print("\033[96m=============================================================\033[0m")
            
            try:
                ch = input("  Enter choice [0-2]: ").strip()
            except KeyboardInterrupt:
                break
                
            if ch == "1":
                print("\n[*] Starting manual source code backup...")
                create_snapshot(auto=False)
                input("\n  Press Enter to continue...")
                
            elif ch == "2":
                snapshots = list_snapshots()
                if not snapshots:
                    print("\n  \033[91m[WARNING] No snapshots found in backups/ directory!\033[0m")
                    input("\n  Press Enter to continue...")
                    continue
                    
                print("\n  Available Workspace Snapshots (Newest first):")
                for idx, snap in enumerate(snapshots):
                    snap_path = os.path.join("backups", snap)
                    mtime = os.path.getmtime(snap_path)
                    time_str = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(mtime))
                    size_kb = os.path.getsize(snap_path) / 1024
                    print(f"    \033[92m[{idx + 1:2d}]\033[0m {snap:<32} ({time_str} | {size_kb:.1f} KB)")
                print("    \033[91m[ n]\033[0m Cancel Rollback")
                
                try:
                    sel = input(f"\n  Select snapshot to restore [1-{len(snapshots)}] (or 'n'): ").strip().lower()
                    if sel.isdigit() and 1 <= int(sel) <= len(snapshots):
                        selected_snap = snapshots[int(sel) - 1]
                        restore_snapshot(selected_snap)
                    else:
                        print("\n  Rollback canceled.")
                except Exception as e:
                    print(f"\n  \033[91m[ERROR] Rollback failed: {e}\033[0m")
                input("\n  Press Enter to continue...")
                
            elif ch == "0":
                print("\n  Closing Backup Utility. Stay safe, Komandan! 🫡")
                time.sleep(1)
                break
            else:
                print("\n  \033[91mInvalid choice. Please enter 0, 1, or 2.\033[0m")
                time.sleep(1.5)
