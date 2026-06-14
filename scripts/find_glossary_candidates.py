# -*- coding: utf-8 -*-
import json
import re
import os

def find_candidates():
    # Paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(script_dir)
    parts_path = os.path.join(root_dir, "data", "parts.json")
    gl_path = os.path.join(root_dir, "data", "gl.json")
    
    if not os.path.exists(parts_path) or not os.path.exists(gl_path):
        print("[ERROR] Missing parts.json or gl.json")
        return
        
    with open(parts_path, "r", encoding="utf-8") as f:
        parts = json.load(f)
    with open(gl_path, "r", encoding="utf-8") as f:
        gl = json.load(f)
        
    gl_keys = set(k.lower() for k in gl.keys())
    
    # Extract all text
    corpus = []
    for part in parts:
        for sub in part.get("subs", []):
            corpus.append(sub.get("title", ""))
            # Strip HTML tags
            text = sub.get("html", "") + " " + sub.get("text", "")
            text_clean = re.sub(r"<[^>]+>", " ", text)
            corpus.append(text_clean)
            
    full_text = " ".join(corpus)
    
    # 1. Search for capitalized phrases (e.g. "Observer Position Effect")
    # Avoid matches at the beginning of sentences by checking the preceding character
    pattern = r'(?<!\.\s)(?<!\?\s)(?<!\!\s)(?<!\A)\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b'
    phrases = re.findall(pattern, full_text)
    
    candidates = {}
    for p in phrases:
        p_lower = p.lower().strip()
        # Filter out common false positives or short things
        if len(p_lower) < 6:
            continue
        if p_lower in gl_keys:
            continue
        # Avoid section headers or part names (like Part I, Section 1)
        if re.search(r'\bpart\b|\bsection\b|\bchapter\b|\bappendix\b', p_lower):
            continue
        candidates[p_lower] = candidates.get(p_lower, 0) + 1
        
    # Sort candidates by frequency
    sorted_candidates = sorted(candidates.items(), key=lambda x: x[1], reverse=True)
    
    print("\n=== TOP 20 GLOSSARY CANDIDATES FOUND IN MANUSCRIPT ===")
    count = 0
    for term, freq in sorted_candidates:
        if freq >= 2: # Appear at least twice
            print(f"- {term.title()} (appears {freq}x)")
            count += 1
            if count >= 20:
                break
                
    # 2. Also check if there are any undefined glossary terms that are cited in glg.json but missing
    glg_path = os.path.join(root_dir, "data", "glg.json")
    if os.path.exists(glg_path):
        with open(glg_path, "r", encoding="utf-8") as f:
            glg = json.load(f)
        all_glg_terms = set(t.lower() for terms in glg.values() for t in terms)
        missing = all_glg_terms - gl_keys
        if missing:
            print("\n=== MISSING TERMS (Defined in glg.json categories but missing in gl.json) ===")
            for m in missing:
                print(f"- {m}")
                
if __name__ == "__main__":
    find_candidates()
