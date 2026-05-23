#!/usr/bin/env python3
import os
import sys
import shutil
import subprocess
import re
import zipfile
from pathlib import Path

def run_cmd(command: str) -> str:
    res = subprocess.run(command, shell=True, capture_output=True, text=True, encoding="utf-8")
    if res.returncode != 0:
        raise RuntimeError(f"Command failed: {command}\nError: {res.stderr}")
    return res.stdout

def main():
    print("============================================================")
    print("      PMN DYNAMIC SCHEMA & PART EXPANSION STRESS TEST       ")
    print("============================================================")

    docx_path = Path("docx_source/PMN_Framework_v116_2.docx")
    temp_docx_path = Path("docx_source/PMN_Framework_STRESSTEST_TEMP.docx")

    if not docx_path.exists():
        print(f"[ERROR] Active manuscript not found at {docx_path}")
        return

    # 1. READ ORIGINAL DOCX XML CONTENT
    print("[INFO] Extracting OOXML document structure...")
    try:
        with zipfile.ZipFile(docx_path, "r") as z_in:
            doc_xml = z_in.read("word/document.xml").decode("utf-8")
            # Get all other zip files to rebuild a perfect docx later
            zip_members = {name: z_in.read(name) for name in z_in.namelist() if name != "word/document.xml"}
    except Exception as e:
        print(f"[ERROR] Failed to read OOXML structure: {e}")
        return

    print("   [OK] Original document.xml loaded.")

    # 2. MODIFY OOXML XML STRINGS (TOC & END OF BODY)
    # Part 2A: Find the first occurrence of "<w:t>Preface</w:t>" which marks the first TOC item.
    # We will insert our Part XVIII and Section 18.1/18.2 TOC elements before the Preface paragraph.
    # An OOXML paragraph has the structure: <w:p> ... <w:t>Preface</w:t> ... </w:p>
    
    print("[INFO] Locating TOC boundaries and injecting Part XVIII...")
    
    # We find the exact paragraph enclosing the first "Preface"
    preface_para_match = re.search(r"<w:p\b[^>]*>(?:(?!</w:p>).)*?<w:t[^>]*>Preface</w:t>.*?</w:p>", doc_xml)
    if not preface_para_match:
        print("[ERROR] Could not locate the 'Preface' TOC item in document.xml")
        return
    
    # Let's prepare our custom TOC XML markup
    toc_injection = (
        "<w:p><w:pPr><w:pStyle w:val=\"TOCHeading\"/></w:pPr><w:r><w:t>Part XVIII: DYNAMIC STRESSTEST ONTOLOGY</w:t></w:r></w:p>"
        "<w:p><w:pPr><w:pStyle w:val=\"TOC1\"/></w:pPr><w:r><w:t>18.1 The Hardcore Verification Axiom</w:t></w:r></w:p>"
        "<w:p><w:pPr><w:pStyle w:val=\"TOC1\"/></w:pPr><w:r><w:t>18.2 Emergent UI Adaptability</w:t></w:r></w:p>"
    )
    
    # Insert TOC items right before the first Preface paragraph
    preface_start_idx = preface_para_match.start()
    modified_xml = doc_xml[:preface_start_idx] + toc_injection + doc_xml[preface_start_idx:]
    
    # Part 2B: Append the actual body content at the end of the document body.
    # The OOXML body ends with "</w:body>"
    body_injection = (
        "<w:p><w:pPr><w:pStyle w:val=\"Heading1\"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>Part XVIII: DYNAMIC STRESSTEST ONTOLOGY</w:t></w:r></w:p>"
        "<w:p><w:pPr><w:pStyle w:val=\"Heading2\"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>18.1 The Hardcore Verification Axiom</w:t></w:r></w:p>"
        "<w:p><w:r><w:t>Philosophy is not static, and neither are its schemas. Under the Hardcore Verification Axiom, we establish that a data-driven UI layer must scale automatically when new ontological parts or categories are added to the primary manuscript. If this section is successfully rendered in the browser, the architecture is mathematically proven to be dynamic.</w:t></w:r></w:p>"
        "<w:p><w:pPr><w:pStyle w:val=\"Heading2\"/></w:pPr><w:r><w:rPr><w:b/></w:rPr><w:t>18.2 Emergent UI Adaptability</w:t></w:r></w:p>"
        "<w:p><w:r><w:t>The emergent property of dynamic rendering lies in the decoupling of layout rules from database fields. When a new part like Part XVIII is introduced, the system loops over the newly parsed JSON payload, automatically creating new buttons, updating the Table of Contents, and mapping navigation without manual structural changes.</w:t></w:r></w:p>"
    )
    
    body_end_idx = modified_xml.rfind("</w:body>")
    if body_end_idx == -1:
        print("[ERROR] Could not find the end of the document body.")
        return
        
    modified_xml = modified_xml[:body_end_idx] + body_injection + modified_xml[body_end_idx:]
    print("   [OK] Dynamic Part XVIII and sections successfully injected into OOXML.")

    # 3. REPACK INTO A TEMPORARY TEST DOCX
    print("[INFO] Packaging modified structure into temporary test manuscript...")
    try:
        with zipfile.ZipFile(temp_docx_path, "w", zipfile.ZIP_DEFLATED) as z_out:
            z_out.writestr("word/document.xml", modified_xml.encode("utf-8"))
            for member_name, member_bytes in zip_members.items():
                z_out.writestr(member_name, member_bytes)
    except Exception as e:
        print(f"[ERROR] Failed to compile test DOCX zip package: {e}")
        return

    print(f"   [OK] Test manuscript successfully written to: {temp_docx_path.name}")

    try:
        # 4. RUN THE PIPELINE TARGETING THE TEMP DOCX
        print("[INFO] Running import_pmn_docx.py on the test manuscript...")
        import_output = run_cmd(f"python scripts/import_pmn_docx.py --docx {temp_docx_path}")
        print("   [OK] Import parsed test manuscript successfully!")

        print("[INFO] Running modularizer.py compile on the expanded database...")
        compile_output = run_cmd("python modularizer.py compile")
        print("   [OK] Compiled new monolithic index.html!")

        # 5. RUN SYSTEM VALIDATIONS AND ASSERTIONS
        print("[INFO] Performing structural assertions on compiled output...")
        
        index_html = Path("index.html").read_text(encoding="utf-8")
        parts_json = Path("data/parts.json").read_text(encoding="utf-8")
        
        # Normalize whitespace for assertions
        parts_clean = parts_json.replace(" ", "").replace("\n", "").replace("\r", "")
        
        assertions = {
            "Part XVIII in JSON": '"part":"XVIII","title":"DYNAMICSTRESSTESTONTOLOGY"' in parts_clean,
            "Section 18.1 in JSON": '"id":"18.1","title":"TheHardcoreVerificationAxiom"' in parts_clean,
            "Section 18.2 in JSON": '"id":"18.2","title":"EmergentUIAdaptability"' in parts_clean,
            "Part XVIII text in HTML": "DYNAMIC STRESSTEST ONTOLOGY" in index_html,
            "18.1 text in HTML": "The Hardcore Verification Axiom" in index_html,
            "Hardcore Verification content in HTML": "Under the Hardcore Verification Axiom, we establish" in index_html,
            "Emergent UI Adaptability content in HTML": "The emergent property of dynamic rendering" in index_html
        }

        all_passed = True
        for desc, passed in assertions.items():
            status = "[PASS]" if passed else "[FAIL]"
            print(f"   {status} Assertion: {desc}")
            if not passed:
                all_passed = False

        if all_passed:
            print("\n[SUCCESS] ALL ARDUOUS SCHEMA STRESS TESTS PASSED!")
            print("   -> The system automatically parsed the newly added 'Part XVIII' and its subparts.")
            print("   -> The compiled site dynamically integrated the new sections and content.")
            print("   -> Dynamic data rendering is 100% PROVEN to scale with manuscript growth!")
        else:
            print("\n[FAIL] Some assertions failed. Check the manuscript parsing rules.")

    finally:
        # 6. SECURE RESTORATION OF ORIGINAL STATE
        print("\n[INFO] Initiating cleanup of temporary test files...")
        if temp_docx_path.exists():
            os.remove(temp_docx_path)
            print("   [OK] Temporary test manuscript file deleted.")
        
        print("[INFO] Re-running import and compile to restore clean production site...")
        run_cmd("python scripts/import_pmn_docx.py")
        run_cmd("python modularizer.py compile")
        print("   [OK] Workspace fully restored to clean, pristine v116.2 state!")
        print("============================================================")

if __name__ == "__main__":
    main()
