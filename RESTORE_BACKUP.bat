@echo off
title PMN Framework - Restore Stable Backup
color 0C

echo ===========================================================
echo    ⚠️ PEMULIHAN CADANGAN STABIL (PMN FRAMEWORK BACKUP)
echo ===========================================================
echo.
echo Perintah ini akan mengembalikan berkas style.css dan
echo index.ui.html ke kondisi cadangan sebelum perombakan visual.
echo Gaya visual Modern UI yang baru akan dihapus dari workspace lokal.
echo.
echo Pastikan berkas .bak Anda ada di folder ini.
echo.
set /p "confirm=Apakah Anda yakin ingin memulihkan cadangan? (Y/N): "

if /i "%confirm%"=="Y" (
    echo.
    if exist "style.css.bak" (
        copy /y "style.css.bak" "style.css" >nul
        echo [✓] style.css berhasil dikembalikan ke versi cadangan.
    ) else (
        echo [X] Eror: Berkas style.css.bak tidak ditemukan!
    )

    if exist "index.ui.html.bak" (
        copy /y "index.ui.html.bak" "index.ui.html" >nul
        echo [✓] index.ui.html berhasil dikembalikan ke versi cadangan.
    ) else (
        echo [X] Eror: Berkas index.ui.html.bak tidak ditemukan!
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
