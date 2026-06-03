#!/usr/bin/env python3
import os
import re
import zipfile
import tempfile
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
W_NS = "{%s}" % NS["w"]

def get_para_text(p_element):
    return "".join(node.text or "" for node in p_element.findall(".//w:t", NS)).strip()

def main():
    docx_path = Path("../private/docs/v117.6/PMN_Framework_v117.6.docx")
    if not docx_path.exists():
        docx_path = Path("../private/docx_source/PMN_Framework_v117.6.docx")
        
    print(f"[*] Loading manuscript from: {docx_path}")
    
    # 1. READ ORIGINAL ZIP CONTENT
    temp_dir = tempfile.mkdtemp()
    try:
        with zipfile.ZipFile(docx_path, "r") as z:
            z.extractall(temp_dir)
            
        doc_xml_path = Path(temp_dir) / "word" / "document.xml"
        tree = ET.parse(doc_xml_path)
        root = tree.getroot()
        
        body = root.find("w:body", NS)
        if body is None:
            raise ValueError("w:body element not found in XML!")
            
        paras = body.findall("w:p", NS)
        print(f"[*] Extracted {len(paras)} raw paragraphs from XML.")
        
        # 2. IDENTIFY TOC BOUNDARIES & POLLUTED PARAGRAPHS
        # We find paragraphs by matching text exactly
        contents_idx = -1
        first_preface_idx = -1
        second_preface_idx = -1
        
        for idx, p in enumerate(paras):
            text = get_para_text(p)
            if text == "Contents" and contents_idx == -1:
                contents_idx = idx
            elif text == "Preface":
                if first_preface_idx == -1:
                    first_preface_idx = idx
                elif second_preface_idx == -1:
                    second_preface_idx = idx
                    
        print(f"[*] Contents Index: {contents_idx}")
        print(f"[*] First Preface (TOC) Index: {first_preface_idx}")
        print(f"[*] Second Preface (Body) Index: {second_preface_idx}")
        
        if contents_idx == -1 or first_preface_idx == -1 or second_preface_idx == -1:
            raise ValueError("Could not find TOC start or end boundary indices!")
            
        # Polluted paragraphs sit inside the TOC range: [contents_idx + 1 : second_preface_idx]
        SPECIAL_HEADINGS = {"Preface", "How to Read This Document", "Coda", "Intellectual Debts", "Bibliography"}
        def is_valid_heading_text(text):
            if text in SPECIAL_HEADINGS:
                return True
            if re.match(r"^Part\s+[IVXLC]+:", text):
                return True
            if re.match(r"^([0-9]+(?:\.[0-9A-Za-z-]+)*)\s+(.+)$", text):
                return True
            return False
            
        polluted_paras = []
        for idx in range(first_preface_idx, second_preface_idx):
            p = paras[idx]
            text = get_para_text(p)
            if text and not is_valid_heading_text(text):
                polluted_paras.append((p, text))
                
        print(f"[*] Identified {len(polluted_paras)} polluted paragraphs in TOC.")
        
        # 3. SELECT KEY PARAGRAPHS TO MOVE & DELETE OTHERS
        # We will match the text of these 5 unique paragraphs
        p_73b_intro = None
        p_73b_stages = None
        p_73b_detection = None
        p_73c_cosmo = None
        p_121b_obligation = None
        
        to_delete = []
        
        for p, text in polluted_paras:
            if text.startswith("Institutional capture is the process by which the concentrated interests that an institution is designed to constrain"):
                p_73b_intro = p
                print("[+] Found unique intro paragraph for 7.3b.")
            elif text.startswith("Capture follows a recognizable sequence. In the first stage, access asymmetry is established"):
                p_73b_stages = p
                print("[+] Found unique stages paragraph for 7.3b (Stage 5).")
            elif text.startswith("Detection at stages one and two is the only tractable intervention point"):
                p_73b_detection = p
                print("[+] Found unique detection paragraph for 7.3b.")
            elif text.startswith("Cosmological capture is a distinct mechanism from the sequential capture described in 7.3c-i"):
                p_73c_cosmo = p
                print("[+] Found unique cosmological capture intro paragraph.")
            elif text.startswith("The obligation arises because the layers are causally connected"):
                p_121b_obligation = p
                print("[+] Found unique obligation paragraph for 12.1b.")
            else:
                to_delete.append(p)
                
        print(f"[*] Configured {len(to_delete)} duplicate/outdated drafts for deletion.")
        
        # 4. REMOVE POLLUTED PARAGRAPHS FROM TOC BLOCK
        # To avoid index shifting issues, we delete elements directly from the XML tree parent
        for p in to_delete:
            body.remove(p)
            
        # We also temporarily remove the 5 paragraphs to be moved so they are no longer in the TOC
        for p in [p_73b_intro, p_73b_stages, p_73b_detection, p_73c_cosmo, p_121b_obligation]:
            if p is not None:
                body.remove(p)
                
        print("[*] Successfully cleaned the TOC page of the XML tree.")
        
        # 5. FIND DESTINATION PARAGRAPHS IN THE BODY & INSERT MOVED PARAGRAPHS
        # Re-fetch body paragraphs to get updated index list
        paras_after_clean = list(body)
        
        # Find the second Preface element (start of body) in XML tree children
        preface_count = 0
        body_start_xml_idx = -1
        for idx, p in enumerate(paras_after_clean):
            if get_para_text(p) == "Preface":
                preface_count += 1
                if preface_count == 2:
                    body_start_xml_idx = idx
                    break
                    
        print(f"[*] XML body start index: {body_start_xml_idx}")
        
        def find_p_by_text(exact_text):
            for p in paras_after_clean[body_start_xml_idx:]:
                if get_para_text(p) == exact_text:
                    return p
            return None
            
        def find_p_by_prefix(prefix):
            for p in paras_after_clean[body_start_xml_idx:]:
                if get_para_text(p).startswith(prefix):
                    return p
            return None

        # Insert Target 1 (7.3b Intro) and Target 2 (7.3b Stages)
        p_73b_heading = find_p_by_text("7.3b Early Detection of Institutional Capture")
        if p_73b_heading is not None:
            idx = paras_after_clean.index(p_73b_heading)
            # Insert intro paragraph right after heading
            if p_73b_intro is not None:
                body.insert(idx + 1, p_73b_intro)
                print(f"[*] Inserted 7.3b intro paragraph at XML index {idx + 1}.")
                paras_after_clean = list(body) # Refresh
                
            # Insert stages paragraph right after intro
            p_73b_intro_inserted = find_p_by_prefix("Institutional capture is the process by which the concentrated interests that an institution is designed to constrain")
            if p_73b_intro_inserted is not None and p_73b_stages is not None:
                idx_stages = paras_after_clean.index(p_73b_intro_inserted)
                body.insert(idx_stages + 1, p_73b_stages)
                print(f"[*] Inserted 7.3b stages paragraph (with Stage 5) at XML index {idx_stages + 1}.")
                paras_after_clean = list(body) # Refresh
        else:
            print("[WARN] Could not find '7.3b Early Detection...' heading in body!")

        # Insert Target 3 (7.3b Detection) after Stage 4 paragraph in body
        p_stage4 = find_p_by_prefix("Stage 4")
        if p_stage4 is not None:
            idx_s4 = paras_after_clean.index(p_stage4)
            if p_73b_detection is not None:
                body.insert(idx_s4 + 1, p_73b_detection)
                print(f"[*] Inserted 7.3b detection paragraph after Stage 4 at XML index {idx_s4 + 1}.")
                paras_after_clean = list(body) # Refresh
        else:
            print("[WARN] Could not find Stage 4 paragraph in body!")

        # Insert Target 4 (Cosmological Capture Intro)
        p_cosmo_heading = find_p_by_text("Cosmological Capture: When Belief Distorts the Institution From Within")
        if p_cosmo_heading is not None:
            idx_cosmo = paras_after_clean.index(p_cosmo_heading)
            if p_73c_cosmo is not None:
                body.insert(idx_cosmo + 1, p_73c_cosmo)
                print(f"[*] Inserted cosmological capture intro paragraph at XML index {idx_cosmo + 1}.")
                paras_after_clean = list(body) # Refresh
        else:
            print("[WARN] Could not find 'Cosmological Capture...' heading in body!")

        # Insert Target 5 (12.1b Obligation)
        p_121b_heading = find_p_by_text("Second-Order Effects as Analytical Obligation: The Multi-Level Consequence Procedure")
        if p_121b_heading is not None:
            idx_121b = paras_after_clean.index(p_121b_heading)
            if p_121b_obligation is not None:
                body.insert(idx_121b + 1, p_121b_obligation)
                print(f"[*] Inserted 12.1b obligation paragraph at XML index {idx_121b + 1}.")
        else:
            print("[WARN] Could not find 'Second-Order Effects...' heading in body!")

        # 6. WRITE BACK TO XML AND ZIP IT UP
        tree.write(doc_xml_path, encoding="utf-8", xml_declaration=True)
        print("[*] Document XML successfully rewritten.")
        
        # Repackage the zip file safely outside temp_dir to prevent WinError 32
        repack_dir = tempfile.mkdtemp()
        output_temp_docx = Path(repack_dir) / "PMN_Framework_v117.6_Repaired.docx"
        
        with zipfile.ZipFile(output_temp_docx, "w", zipfile.ZIP_DEFLATED) as z_out:
            for root_dir, _, files in os.walk(temp_dir):
                for file in files:
                    file_path = Path(root_dir) / file
                    arcname = os.path.relpath(file_path, temp_dir)
                    z_out.write(file_path, arcname)
                    
        # Overwrite original files safely
        dest_paths = [
            Path("../private/docs/v117.6/PMN_Framework_v117.6.docx"),
            Path("../private/docx_source/PMN_Framework_v117.6.docx")
        ]
        
        for dest in dest_paths:
            if dest.parent.exists():
                try:
                    shutil.copy2(output_temp_docx, dest)
                    print(f"[SUCCESS] Repaired manuscript written to: {dest}")
                except PermissionError:
                    print(f"[WARN] Permission Denied: Could not overwrite {dest.name} (probably open in MS Word).")
                    fallback_dest = dest.parent / f"{dest.stem}_Repaired.docx"
                    try:
                        shutil.copy2(output_temp_docx, fallback_dest)
                        print(f"[SUCCESS] Saved copy to fallback: {fallback_dest}")
                    except PermissionError:
                        print(f"[ERROR] Could not write fallback either. Make sure no process is holding {fallback_dest.name}.")
                
    finally:
        shutil.rmtree(temp_dir)
        if 'repack_dir' in locals() and repack_dir and os.path.exists(repack_dir):
            try:
                shutil.rmtree(repack_dir)
            except Exception:
                pass
        print("[*] Cleanup of temp files completed.")

if __name__ == "__main__":
    main()
