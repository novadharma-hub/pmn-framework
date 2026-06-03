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
        
        # 3. IDENTIFY ALL 24 POLLUTED PARAGRAPHS & THEIR DESTINATIONS
        PARAGRAPH_MAPPING = [
            # Section 3.0b
            ("The naturalistic fallacy, as Moore formulated it", "3.0b"),
            ("The objection misdescribes what the bridge does", "3.0b"),
            ("The bridge is conditional, not derivational", "3.0b"),
            
            # Section 3.0c
            ("The stability argument provides the second leg", "3.0c"),
            ("The argument is not that instability proves", "3.0c"),
            ("This matters for the framework's epistemic status", "3.0c"),
            
            # Section 3.0d
            ("A common misreading of PMN treats it as reducing", "3.0d"),
            ("The misreading conflates the evaluative anchor", "3.0d"),
            ("The correct reading is that the biological floor", "3.0d"),
            
            # Section 3.0e
            ("A second misreading treats PMN's use of", "3.0e"),
            ("The anti-foreclosure criterion is prohibitory, not teleological", "3.0e"),
            ("PMN explicitly rejects strong teleology", "3.0e"),
            
            # Section 3.0f
            ("Sections 3.0b through 3.0e clear the ground", "3.0f"),
            ("PMN's normative architecture is conditional", "3.0f"),
            ("This conditionality is a precision, not a weakness", "3.0f"),
            
            # Section 7.3b
            ("Institutional capture is the process by which", "7.3b"),
            ("Capture follows a recognizable sequence", "7.3b"),
            ("Detection at stages one and two is the only", "7.3b"),
            
            # Section 7.3c-ii
            ("Cosmological capture is a distinct mechanism", "7.3c-ii"),
            ("Cosmological capture operates through belief", "7.3c-ii"),
            ("The diagnostic challenge is that cosmological", "7.3c-ii"),
            
            # Section 12.1b
            ("The stress-testing methodology evaluates proposed", "12.1b"),
            ("The Multi-Level Consequence Procedure specifies", "12.1b"),
            ("The obligation arises because the layers are causally", "12.1b"),
        ]

        p_by_prefix = {}
        for p, text in polluted_paras:
            matched = False
            for prefix, sec_id in PARAGRAPH_MAPPING:
                if text.startswith(prefix):
                    p_by_prefix[prefix] = p
                    matched = True
                    break
            if not matched:
                print(f"[WARN] Non-heading paragraph in TOC did not match any prefix: {text[:60]}")

        print(f"[*] Found {len(p_by_prefix)} of 24 paragraphs to move.")

        # 4. REMOVE ALL POLLUTED PARAGRAPHS FROM TOC BLOCK
        for p in p_by_prefix.values():
            body.remove(p)
            
        # Also clean up any unmatched polluted paras
        to_delete = []
        for p, text in polluted_paras:
            matched = False
            for prefix, sec_id in PARAGRAPH_MAPPING:
                if text.startswith(prefix):
                    matched = True
                    break
            if not matched:
                to_delete.append(p)
                
        for p in to_delete:
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
            for p in list(body)[body_start_xml_idx:]:
                if get_para_text(p) == exact_text:
                    return p
            return None
            
        def find_p_by_prefix(prefix):
            for p in list(body)[body_start_xml_idx:]:
                if get_para_text(p).startswith(prefix):
                    return p
            return None

        # --- INSERT 3.0b PARAGRAPHS ---
        p_pmn_does_not = find_p_by_prefix("PMN does not make")
        if p_pmn_does_not is not None:
            idx = list(body).index(p_pmn_does_not)
            p1 = p_by_prefix.get("The naturalistic fallacy, as Moore formulated it")
            p2 = p_by_prefix.get("The objection misdescribes what the bridge does")
            p3 = p_by_prefix.get("The bridge is conditional, not derivational")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 3.0b TOC paragraphs after 'PMN does not make...'")
        else:
            print("[WARN] Could not find 'PMN does not make' paragraph in body!")

        # --- INSERT 3.0c PARAGRAPHS ---
        p_normative_enters = find_p_by_prefix("The normative dimension enters")
        if p_normative_enters is not None:
            idx = list(body).index(p_normative_enters)
            p1 = p_by_prefix.get("The stability argument provides the second leg")
            p2 = p_by_prefix.get("The argument is not that instability proves")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            print("[*] Integrated 3.0c TOC paragraphs P1 & P2 after 'The normative dimension enters...'")
            
        p_logical_struct = find_p_by_prefix("The logical structure")
        if p_logical_struct is not None:
            idx = list(body).index(p_logical_struct)
            p3 = p_by_prefix.get("This matters for the framework's epistemic status")
            if p3 is not None:
                body.insert(idx + 1, p3)
                print("[*] Integrated 3.0c TOC paragraph P3 after logical structure paragraph.")
        else:
            print("[WARN] Could not find logical structure paragraph in body!")

        # --- INSERT 3.0d PARAGRAPHS ---
        p_floor = find_p_by_prefix("The biological floor is a floor")
        if p_floor is not None:
            idx = list(body).index(p_floor)
            p1 = p_by_prefix.get("A common misreading of PMN treats it as reducing")
            p2 = p_by_prefix.get("The misreading conflates the evaluative anchor")
            p3 = p_by_prefix.get("The correct reading is that the biological floor")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 3.0d TOC paragraphs after 'The biological floor is a floor...'")
        else:
            print("[WARN] Could not find 'The biological floor is a floor' paragraph in body!")

        # --- INSERT 3.0e PARAGRAPHS ---
        p_diff = find_p_by_prefix("The difference between a teleological claim")
        if p_diff is not None:
            idx = list(body).index(p_diff)
            p1 = p_by_prefix.get("A second misreading treats PMN's use of")
            p2 = p_by_prefix.get("The anti-foreclosure criterion is prohibitory, not teleological")
            p3 = p_by_prefix.get("PMN explicitly rejects strong teleology")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 3.0e TOC paragraphs after 'The difference between...'")
        else:
            print("[WARN] Could not find 'The difference between a teleological claim' paragraph in body!")

        # --- INSERT 3.0f PARAGRAPHS ---
        p_30f_heading = find_p_by_text("Conditional Normative Framework: The Summary Statement")
        if p_30f_heading is not None:
            idx = list(body).index(p_30f_heading)
            p1 = p_by_prefix.get("Sections 3.0b through 3.0e clear the ground")
            p2 = p_by_prefix.get("PMN's normative architecture is conditional")
            p3 = p_by_prefix.get("This conditionality is a precision, not a weakness")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 3.0f TOC paragraphs immediately after heading.")
        else:
            print("[WARN] Could not find 3.0f heading in body!")

        # --- INSERT 7.3b PARAGRAPHS ---
        p_73b_heading = find_p_by_text("7.3b Early Detection of Institutional Capture")
        if p_73b_heading is not None:
            idx = list(body).index(p_73b_heading)
            p1 = p_by_prefix.get("Institutional capture is the process by which")
            p2 = p_by_prefix.get("Capture follows a recognizable sequence")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            print("[*] Integrated 7.3b intro and sequence summary after heading.")
            
            p_stage4 = find_p_by_prefix("Stage 4")
            if p_stage4 is not None:
                idx_s4 = list(body).index(p_stage4)
                p3 = p_by_prefix.get("Detection at stages one and two is the only")
                if p3 is not None:
                    body.insert(idx_s4 + 1, p3)
                    print("[*] Integrated 7.3b detection paragraph after Stage 4.")
        else:
            print("[WARN] Could not find 7.3b heading in body!")

        # --- INSERT 7.3c-ii PARAGRAPHS ---
        p_gen_theory = find_p_by_prefix("The general capture theory of section 7.3c identifies")
        if p_gen_theory is not None:
            idx = list(body).index(p_gen_theory)
            p1 = p_by_prefix.get("Cosmological capture is a distinct mechanism")
            p2 = p_by_prefix.get("Cosmological capture operates through belief")
            p3 = p_by_prefix.get("The diagnostic challenge is that cosmological")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 7.3c-ii TOC paragraphs after first body paragraph.")
        else:
            print("[WARN] Could not find cosmological capture first body paragraph!")

        # --- INSERT 12.1b PARAGRAPHS ---
        p_mechanism = find_p_by_prefix("The mechanism by which second-order effects")
        if p_mechanism is not None:
            idx = list(body).index(p_mechanism)
            p1 = p_by_prefix.get("The stress-testing methodology evaluates proposed")
            p2 = p_by_prefix.get("The Multi-Level Consequence Procedure specifies")
            p3 = p_by_prefix.get("The obligation arises because the layers are causally")
            if p1 is not None: body.insert(idx + 1, p1); idx += 1
            if p2 is not None: body.insert(idx + 1, p2); idx += 1
            if p3 is not None: body.insert(idx + 1, p3); idx += 1
            print("[*] Integrated 12.1b TOC paragraphs after second body paragraph.")
        else:
            print("[WARN] Could not find 12.1b second body paragraph!")

        # 5b. PREPEND NUMBERS TO UNNUMBERED HEADINGS IN THE BODY
        headings_to_number = {
            "The Naturalistic Fallacy Objection and Why It Does Not Apply Here": "3.0b ",
            "The Stability Argument: The Bridge That Is Not a Derivation": "3.0c ",
            "Against the Reductionism Reading": "3.0d ",
            "Against the Teleology Reading": "3.0e ",
            "Conditional Normative Framework: The Summary Statement": "3.0f ",
            "A General Theory of Capture: Mechanism, Stages, and Detection Across Organizational Forms": "7.3c-i ",
            "Cosmological Capture: When Belief Distorts the Institution From Within": "7.3c-ii ",
            "Second-Order Effects as Analytical Obligation: The Multi-Level Consequence Procedure": "12.1b "
        }
        
        paras_after_clean = list(body)
        for heading_p in paras_after_clean[body_start_xml_idx:]:
            p_text = get_para_text(heading_p)
            if p_text in headings_to_number:
                prefix = headings_to_number[p_text]
                t_elem = heading_p.find(".//w:t", NS)
                if t_elem is not None:
                    t_elem.text = prefix + (t_elem.text or "")
                    print(f"[+] Numbered body heading: '{prefix}{p_text}'")

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
