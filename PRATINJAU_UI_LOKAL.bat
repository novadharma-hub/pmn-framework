@echo off
title PMN FRAMEWORK - PRATINJAU UI LOKAL
color 0B

echo ===========================================================
echo   🖥️  MODE PRATINJAU PENGEMBANGAN (LOKAL)
echo ===========================================================
echo.
echo [!] Tool ini akan menukar index.html secara sementara
echo     agar Anda bisa melihat aplikasi asli via 'npm run dev'.
echo.
echo [1] AKTIFKAN PRATINJAU (Tukar ke Aplikasi Asli)
echo [2] MATIKAN PRATINJAU (Kembalikan ke Mode Maintenance)
echo [3] KELUAR
echo.

set /p opt="Pilih opsi (1-3): "

if "%opt%"=="1" (
    echo [*] Menyiapkan aplikasi asli...
    if exist "index.html.maintenance_backup" (
        copy /y "index.html" "index.maintenance.html" >nul
        copy /y "index.html.maintenance_backup" "index.html" >nul
        echo [v] SELESAI: index.html sekarang adalah APLIKASI ASLI.
        echo [*] Jalankan 'npm run dev' untuk melihat hasilnya.
    ) else (
        echo [X] ERROR: File backup aplikasi asli tidak ditemukan!
    )
)

if "%opt%"=="2" (
    echo [*] Mengaktifkan kembali mode maintenance...
    if exist "index.maintenance.html" (
        copy /y "index.maintenance.html" "index.html" >nul
        echo [v] SELESAI: index.html sekarang adalah COVER MAINTENANCE.
    ) else (
        echo [X] ERROR: File cover maintenance tidak ditemukan!
    )
)

echo.
pause
