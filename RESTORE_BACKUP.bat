@echo off
title PMN Framework - Restore Stable Backup
color 0C

:: Detect private workspace layout (similar to other tools)
if exist "D:\pmn-workspace\private\backups" (
    set "BACKUP_DIR=D:\pmn-workspace\private\backups"
) else (
    set "BACKUP_DIR=%~dp0"
)

echo ===========================================================
echo    ⚠️ PEMULIHAN CADANGAN STABIL (PMN FRAMEWORK BACKUP)
echo ===========================================================
echo.
echo Perintah ini akan mengembalikan berkas style.css dan
echo index.ui.html ke kondisi cadangan sebelum perombakan visual.
echo Gaya visual Modern UI yang baru akan dihapus dari workspace lokal.
echo.
echo Backup location: %BACKUP_DIR%
echo.
set /p "confirm=Apakah Anda yakin ingin memulihkan cadangan? (Y/N): "

if /i "%confirm%"=="Y" (
    echo.
    if exist "%BACKUP_DIR%style.css.bak" (
        copy /y "%BACKUP_DIR%style.css.bak" "style.css" >nul
        echo [✓] style.css berhasil dikembalikan ke versi cadangan.
    ) else (
        echo [X] Eror: Berkas style.css.bak tidak ditemukan di %BACKUP_DIR%
    )

    if exist "%BACKUP_DIR%index.ui.html.bak" (
        copy /y "%BACKUP_DIR%index.ui.html.bak" "index.ui.html" >nul
        echo [✓] index.ui.html berhasil dikembalikan ke versi cadangan.
    ) else (
        echo [X] Eror: Berkas index.ui.html.bak tidak ditemukan di %BACKUP_DIR%
    )

    echo.
    echo [INFO] Menjalankan kompilasi ulang otomatis...
    python modularizer.py compile
    echo.
    echo ===========================================================
    echo [✓] SUKSES! Cadangan stabil telah aktif kembali sepenuhnya.
    echo ===========================================================
) else (
    echo.
    echo [X] Pemulihan dibatalkan oleh pengguna.
)

echo.
pause
