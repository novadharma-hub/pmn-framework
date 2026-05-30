# -*- coding: utf-8 -*-
import os
import sys
import subprocess
import re

def create_github_release(tag_name, pdf_path, md_path):
    print(f"[*] Creating GitHub Release for tag: {tag_name}...")
    
    # Check if 'gh' CLI is installed
    try:
        subprocess.run(["gh", "--version"], check=True, capture_output=True)
    except (subprocess.CalledProcessError, FileNotFoundError):
        print("[ERROR] GitHub CLI (gh) not found. Please install it to use automated releases.")
        return False

    # Create the release using gh CLI
    # --generate-notes automatically creates a changelog from commit messages
    cmd = [
        "gh", "release", "create", tag_name,
        pdf_path,
        md_path,
        "--title", f"PMN Framework {tag_name}",
        "--generate-notes"
    ]
    
    try:
        # Check if release already exists to avoid error (though tag should be unique)
        subprocess.run(cmd, check=True)
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
