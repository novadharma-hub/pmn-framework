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

def verify_ui_files():
    # Change working directory to script location to ensure relative paths resolve correctly
    script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
    root_dir = os.path.dirname(script_dir)
    
    ui_html_path = os.path.join(root_dir, "index.ui.html")
    css_path = os.path.join(root_dir, "style.css")
    js_path = os.path.join(root_dir, "app.js")
    
    has_errors = False
    
    print("\n      AUDITING UI SKELETON, STYLES, AND SCRIPTS...")
    
    # 1. Audit index.ui.html
    if os.path.exists(ui_html_path):
        try:
            with open(ui_html_path, "r", encoding="utf-8") as f:
                html_content = f.read()
            
            # Check core container elements
            required = ["id=\"prose\"", "id=\"sidebar\"", "id=\"home-view\"", "id=\"reader-view\""]
            for req in required:
                if req not in html_content:
                    print(f"\033[91m[UI ERROR] Missing core container in index.ui.html: {req}!\033[0m")
                    has_errors = True
            
            # Tag Balancer
            tags = re.findall(r'<(/?[a-z0-9\-]+)(?:\s+[^>]*?)?>', html_content.lower())
            stack = []
            for tag in tags:
                if tag.startswith('/'):
                    close_tag = tag[1:]
                    if stack:
                        open_tag = stack.pop()
                        if open_tag != close_tag and open_tag in ['div', 'span', 'p', 'section', 'article', 'nav', 'header', 'footer']:
                            print(f"\033[93m[UI WARN] Unbalanced HTML in index.ui.html: Expected </{open_tag}> but found </{close_tag}>!\033[0m")
                else:
                    if tag not in ['br', 'img', 'hr', 'input', 'meta', 'link', 'col', 'base', 'embed', 'param', 'source', 'track', 'wbr']:
                        stack.append(tag)
        except Exception as e:
            print(f"\033[91m[UI ERROR] Could not read index.ui.html: {e}\033[0m")
            has_errors = True
            
    # 2. Audit style.css
    if os.path.exists(css_path):
        try:
            with open(css_path, "r", encoding="utf-8") as f:
                css_content = f.read()
            open_braces = css_content.count("{")
            close_braces = css_content.count("}")
            if open_braces != close_braces:
                print(f"\033[91m[CSS ERROR] Unbalanced curly braces in style.css! Open: {open_braces}, Close: {close_braces}\033[0m")
                has_errors = True
        except Exception as e:
            print(f"\033[91m[UI ERROR] Could not read style.css: {e}\033[0m")
            has_errors = True
            
    # 3. Audit app.js
    if os.path.exists(js_path):
        try:
            with open(js_path, "r", encoding="utf-8") as f:
                js_content = f.read()
            
            for open_char, close_char, name in [("{", "}", "curly braces"), ("[", "]", "square brackets"), ("(", ")", "parentheses")]:
                o_count = js_content.count(open_char)
                c_count = js_content.count(close_char)
                if o_count != c_count:
                    print(f"\033[91m[JS ERROR] Unbalanced {name} in app.js! Open: {o_count}, Close: {c_count}\033[0m")
                    has_errors = True
        except Exception as e:
            print(f"\033[91m[UI ERROR] Could not read app.js: {e}\033[0m")
            has_errors = True
            
    return not has_errors


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
                
    # Run UI Files Verification
    ui_passed = verify_ui_files()
    if not ui_passed:
        has_warnings = True
                
    print("\033[90m" + "-" * 65 + "\033[0m")
    if has_warnings:
        print("\033[93m[STATUS] Formatting & UI audit completed with warnings/errors. Please review the points above.\033[0m")
    else:
        print("\033[92m[STATUS] 100% OK! All modular JSON and UI formatting checks passed successfully!\033[0m")
    print("=" * 65)
    return not has_warnings

if __name__ == "__main__":
    verify_formatting()
