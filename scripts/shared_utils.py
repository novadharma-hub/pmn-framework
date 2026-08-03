"""
shared_utils.py — Fungsi yang dipakai oleh pmn_console.py DAN modularizer.py.
Extracted untuk mengeliminasi duplikasi get_backup_path().
"""
import os


def get_backup_path(filename="index.html.bak"):
    """Return the correct path for a backup file inside pmn-workspace layout.

    Prefers private/backups/<filename> when running inside the pmn-workspace
    layout (public/ folder detected). Falls back to local <filename> for
    single-folder usage.

    Args:
        filename: Nama file backup (default: "index.html.bak").
                  pmn_console pakai "index.offline.html.bak".
    """
    try:
        cwd = os.getcwd()

        # Case 1: running from public/ folder directly
        if os.path.basename(cwd).lower() == "public":
            parent = os.path.dirname(cwd)
            private_dir = os.path.join(parent, "private")
            if os.path.exists(private_dir):
                bak_path = os.path.join(private_dir, "backups", filename)
                os.makedirs(os.path.dirname(bak_path), exist_ok=True)
                return bak_path

        # Case 2: shared_utils.py ada di public/scripts/ → naik 1 level ke public/
        script_dir = os.path.dirname(os.path.abspath(__file__))
        potential_public = os.path.dirname(script_dir)
        if os.path.basename(potential_public).lower() == "public":
            parent = os.path.dirname(potential_public)
            private_dir = os.path.join(parent, "private")
            if os.path.exists(private_dir):
                bak_path = os.path.join(private_dir, "backups", filename)
                os.makedirs(os.path.dirname(bak_path), exist_ok=True)
                return bak_path
    except Exception:
        pass

    return filename
