# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import re

def create_github_release(tag_name, pdf_path, md_path):
    print(f"[*] Creating GitHub Release for tag: {tag_name}...")

    # Robust gh detection
    gh_path = "gh" # Default
    standard_paths = [
        "C:\\Program Files\\GitHub CLI\\gh.exe",
        os.path.join(os.environ.get("LOCALAPPDATA", ""), "Programs", "GitHub CLI", "gh.exe")
    ]

    found_gh = False
    # Check if 'gh' is in PATH
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
        found_gh = True
    except (subprocess.CalledProcessError, FileNotFoundError):
        # Check standard paths
        for path in standard_paths:
            if os.path.exists(path):
                gh_path = f'"{path}"'
                found_gh = True
                break

    if not found_gh:
        print("[ERROR] GitHub CLI (gh) not found. Please install it to use automated releases.")
        return False

    # Create the release using gh CLI
    # --generate-notes automatically creates a changelog from commit messages
    cmd = f"{gh_path} release create {tag_name} {pdf_path} {md_path} --title \"PMN Framework {tag_name}\" --generate-notes"

    try:
        # Using shell=True because gh_path might be a quoted string with spaces
        subprocess.run(cmd, check=True, shell=True)
        print(f"[v] GitHub Release {tag_name} created and assets uploaded successfully!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"[ERROR] Failed to create GitHub release: {e}")
        return False


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python create_release.py <tag_name> <pdf_path> <md_path>")
        sys.exit(1)
        
    tag = sys.argv[1]
    pdf = sys.argv[2] if len(sys.argv) > 2 else "dist/PMN_Latest.pdf"
    md = sys.argv[3] if len(sys.argv) > 3 else "dist/PMN_Latest.md"
    
    create_github_release(tag, pdf, md)
