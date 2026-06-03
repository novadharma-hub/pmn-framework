#!/usr/bin/env python3
import os
import sys
from pathlib import Path

def convert_docx_to_pdf(docx_path: Path, pdf_path: Path):
    # Dynamically import win32com to prevent errors on non-Windows platforms
    try:
        import win32com.client
    except ImportError:
        print("[ERROR] pywin32 library is not installed. Run: pip install pywin32")
        sys.exit(1)

    docx_abs = str(docx_path.resolve())
    pdf_abs = str(pdf_path.resolve())

    print(f"[*] Commencing PDF generation via MS Word COM Interface:")
    print(f"    Source: {docx_abs}")
    print(f"    Target: {pdf_abs}")

    if not docx_path.exists():
        print(f"[ERROR] Source docx file does not exist: {docx_abs}")
        sys.exit(1)

    pdf_path.parent.mkdir(parents=True, exist_ok=True)

    # Initialize Word
    try:
        word = win32com.client.Dispatch("Word.Application")
        word.Visible = False
    except Exception as e:
        print(f"[ERROR] Failed to start Microsoft Word application via COM: {e}")
        sys.exit(1)

    try:
        doc = word.Documents.Open(docx_abs)
        # wdFormatPDF = 17
        doc.SaveAs(pdf_abs, FileFormat=17)
        doc.Close()
        print(f"[SUCCESS] PDF successfully generated at: {pdf_abs}")
    except Exception as e:
        print(f"[ERROR] An error occurred during conversion: {e}")
        sys.exit(1)
    finally:
        try:
            word.Quit()
        except Exception:
            pass

def main():
    if len(sys.argv) < 3:
        print("Usage: python docx_to_pdf.py <input_docx_path> <output_pdf_path>")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    convert_docx_to_pdf(input_path, output_path)

if __name__ == "__main__":
    main()
