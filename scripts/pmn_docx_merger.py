#!/usr/bin/env python3
import os
from docx import Document
from pathlib import Path

def merge_docx_files(source_dir, output_path):
    """
    Menggabungkan semua file .docx dari sebuah direktori menjadi satu file besar.
    Sangat berguna untuk menyatukan fragmen-fragmen tulisan dari AI.
    """
    merged_document = Document()
    
    # Ambil semua file .docx dan urutkan secara alfabetis (atau sesuaikan)
    files = sorted([f for f in os.listdir(source_dir) if f.endswith('.docx')])
    
    if not files:
        print(f"[!] Tidak ada file .docx ditemukan di {source_dir}")
        return

    first_file = True
    for file_name in files:
        file_path = os.path.join(source_dir, file_name)
        print(f"[*] Menggabungkan: {file_name}")
        
        sub_doc = Document(file_path)
        
        # Tambahkan page break antar file (kecuali file pertama)
        if not first_file:
            merged_document.add_page_break()
        
        # Copy isi paragraf
        for element in sub_doc.element.body:
            merged_document.element.body.append(element)
            
        first_file = False

    merged_document.save(output_path)
    print(f"\n[v] SELESAI! Dokumen gabungan tersimpan di: {output_path}")

if __name__ == "__main__":
    # Folder input: taruh fragmen-fragmen docx di sini
    input_folder = "private/docx_source/fragments"
    # File output
    output_file = "private/docx_source/PMN_365_Halaman_Full.docx"
    
    os.makedirs(input_folder, exist_ok=True)
    
    print("===========================================================")
    print("      PMN DOCX MERGER (Automated Fragment Joiner)          ")
    print("===========================================================")
    print(f"\nPetunjuk: Taruh file-file .docx kecil Anda di folder:\n{input_folder}\n")
    
    confirm = input("Lanjut menggabungkan? (Y/N): ")
    if confirm.lower() == 'y':
        merge_docx_files(input_folder, output_file)
