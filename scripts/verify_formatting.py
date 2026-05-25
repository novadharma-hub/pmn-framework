#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import sys
import json
import re

# Ensure stdout handles UTF-8 correctly on Windows cp1252 consoles
if sys.platform.startswith('win'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

def verify_formatting():
    print("=" * 65)
    print("      PMN MANUSCRIPT FORMATTING & INTEGRITY CHECKER TOOL")
    print("=" * 65)
    
    # Change working directory to script location to ensure relative paths resolve correctly
    script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
    root_dir = os.path.dirname(script_dir)
    parts_dir = os.path.join(root_dir, "data", "parts")
    
    if not os.path.exists(parts_dir):
        print(f"[ERROR] Directory '{parts_dir}' not found!")
        return False
        
    part_files = [f for f in os.listdir(parts_dir) if f.startswith("part_") and f.endswith(".json")]
    
    has_warnings = False
    
    for filename in sorted(part_files):
        filepath = os.path.join(parts_dir, filename)
        try:
            with open(filepath, "r", encoding="utf-8") as f:
                sections = json.load(f)
        except Exception as e:
            print(f"\033[91m[ERROR] Could not read {filename}: {e}\033[0m")
            has_warnings = True
            continue
            
        for sec in sections:
            sec_id = sec.get("id", "unknown")
            html = sec.get("html", "")
            
            # Check 1: Merged entries check (multiple strong tags within a single <p> tag)
            p_blocks = re.findall(r'<p>(.*?)</p>', html, re.DOTALL)
            for idx, p in enumerate(p_blocks):
                strong_tags = re.findall(r'<strong>(.*?)</strong>', p)
                # If there are multiple strong bolded tags in one paragraph, it might be a merged entry
                if len(strong_tags) > 1:
                    # Ignore common inline formatting patterns like multiple bold terms in standard text
                    first_tag = strong_tags[0].strip()
                    # Merged entries usually have list-like strong names at start
                    if len(first_tag) < 50 and any(char.isalpha() for char in first_tag):
                        print(f"\033[93m[WARN] Possible merged list entry in {filename} (Section {sec_id}):\033[0m")
                        print(f"       Paragraph has {len(strong_tags)} bolded names: {strong_tags}")
                        print(f"       Excerpt: \"{p[:140]}...\"")
                        has_warnings = True
                    
            # Check 2: Editorial placeholders check
            placeholders = ["chicago author-date", "author-date format", "placeholder", "todo", "draft", "instruction"]
            for pl in placeholders:
                if pl in html.lower():
                    # Ignore legitimate bibliography references
                    if pl == "chicago" and "university of chicago" in html.lower():
                        continue
                    print(f"\033[93m[WARN] Potential editorial placeholder '{pl}' found in {filename} (Section {sec_id})!\033[0m")
                    has_warnings = True
                    
            # Check 3: HTML Tag Balancing
            tags = re.findall(r'<(/?[a-z0-9]+)(?:\s+[^>]*?)?>', html.lower())
            stack = []
            for tag in tags:
                if tag.startswith('/'):
                    close_tag = tag[1:]
                    if not stack:
                        print(f"\033[91m[HTML ERROR] Unbalanced HTML in {filename} (Section {sec_id}): Closing tag </{close_tag}> has no matching open tag!\033[0m")
                        has_warnings = True
                    else:
                        open_tag = stack.pop()
                        if open_tag != close_tag:
                            print(f"\033[91m[HTML ERROR] Unbalanced HTML in {filename} (Section {sec_id}): Expected </{open_tag}> but found </{close_tag}>!\033[0m")
                            has_warnings = True
                else:
                    if tag not in ['br', 'img', 'hr', 'input', 'meta', 'link']: # ignore self-closing
                        stack.append(tag)
            if stack:
                print(f"\033[91m[HTML ERROR] Unbalanced HTML in {filename} (Section {sec_id}): Open tags {stack} were never closed!\033[0m")
                has_warnings = True
                
    print("\033[90m" + "-" * 65 + "\033[0m")
    if has_warnings:
        print("\033[93m[STATUS] Formatting audit completed with warnings. Please review the points above.\033[0m")
    else:
        print("\033[92m[STATUS] 100% OK! All modular JSON formatting checks passed successfully!\033[0m")
    print("=" * 65)
    return not has_warnings

if __name__ == "__main__":
    verify_formatting()
