# -*- coding: utf-8 -*-
import os
import sys
import json
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# PMN GDrive Configuration
# The ID of the folder where public PDFs are shared
# Based on the link provided in index.ui.html: 1y1c7XCnYGLAydALvTTAR5EQeUrz4zCjS
PUBLIC_FOLDER_ID = "1y1c7XCnYGLAydALvTTAR5EQeUrz4zCjS"

def get_gdrive_service():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Path relative to public/scripts/
    creds_path = os.path.join(os.path.dirname(os.path.dirname(script_dir)), "private", "credentials", "gdrive_service_account.json")
    
    if not os.path.exists(creds_path):
        raise FileNotFoundError(f"GDrive credentials not found at: {creds_path}")
        
    scopes = ['https://www.googleapis.com/auth/drive']
    creds = service_account.Credentials.from_service_account_file(creds_path, scopes=scopes)
    return build('drive', 'v3', credentials=creds)

def upload_pdf(file_path):
    service = get_gdrive_service()
    filename = os.path.basename(file_path)
    
    # 1. Search for existing file with the same name in the public folder
    query = f"name = '{filename}' and '{PUBLIC_FOLDER_ID}' in parents and trashed = false"
    results = service.files().list(q=query, spaces='drive', fields='files(id, name)').execute()
    items = results.get('files', [])
    
    media = MediaFileUpload(file_path, mimetype='application/pdf', resumable=True)
    
    if items:
        # 2. Update existing file (Replace)
        file_id = items[0]['id']
        print(f"[*] Found existing file on GDrive (ID: {file_id}). Updating...")
        updated_file = service.files().update(
            fileId=file_id,
            media_body=media
        ).execute()
        print(f"[v] GDrive Update Success: {filename} (ID: {updated_file.get('id')})")
        return updated_file.get('id')
    else:
        # 3. Upload as new file
        print(f"[*] File {filename} not found on GDrive. Uploading new...")
        file_metadata = {
            'name': filename,
            'parents': [PUBLIC_FOLDER_ID]
        }
        new_file = service.files().create(
            body=file_metadata,
            media_body=media,
            fields='id'
        ).execute()
        print(f"[v] GDrive Upload Success: {filename} (ID: {new_file.get('id')})")
        return new_file.get('id')

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python gdrive_uploader.py <path_to_pdf>")
        sys.exit(1)
        
    target_pdf = sys.argv[1]
    if not os.path.exists(target_pdf):
        print(f"[ERROR] File not found: {target_pdf}")
        sys.exit(1)
        
    try:
        upload_pdf(target_pdf)
    except Exception as e:
        print(f"[ERROR] GDrive Pipeline Failed: {e}")
        sys.exit(1)
