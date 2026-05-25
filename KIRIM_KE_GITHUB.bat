@echo off
title PMN WORKSPACE - KIRIM KE GITHUB
color 0B
echo =======================================================================
echo          PMN WORKSPACE - PENDUKUNG PUSH GITHUB OTOMATIS (AMAN)
echo =======================================================================
echo.
echo Skrip ini akan membantu commit dan push ke GitHub publik.
echo PENTING: Selalu baca daftar perubahan sebelum menyetujui push.
echo.
echo [*] Melakukan pengecekan status Git lokal...
git status
echo.
echo =======================================================================
echo.
choice /c YN /m "Lanjut stage SEMUA perubahan yang terlihat di atas?"
if errorlevel 2 (
    echo.
    echo [BATAL] Tidak ada file yang di-stage. Gunakan git add file tertentu bila perlu.
    pause
    exit /b 0
)

echo.
echo [*] Menambahkan seluruh perubahan non-ignored ke Git...
git add -A

echo.
echo [*] Ringkasan file yang akan masuk commit:
git diff --cached --stat
echo.
choice /c YN /m "Apakah ringkasan staged changes di atas sudah benar?"
if errorlevel 2 (
    echo.
    echo [BATAL] Commit dibatalkan. Jalankan git reset untuk melepas staged changes jika perlu.
    pause
    exit /b 0
)

set /p commit_msg="Masukkan pesan pembaruan Anda (Contoh: Update bab 5): "
if "%commit_msg%"=="" set commit_msg=Pembaruan naskah rutin PMN

echo.
echo [*] Membuat komit dengan pesan: "%commit_msg%"...
git commit -m "%commit_msg%"
if errorlevel 1 (
    echo.
    echo [ERROR] Commit gagal. Periksa pesan error Git di atas.
    pause
    exit /b 1
)

echo.
echo [*] Mendorong ke GitHub (origin/main)...
git push origin main
if errorlevel 1 (
    echo.
    echo [ERROR] Push gagal. Periksa koneksi, auth GitHub, atau konflik remote.
    pause
    exit /b 1
)

echo.
echo =======================================================================
echo   [OK] Sukses! Perubahan Anda telah aman dan steril terunggah ke GitHub!
echo =======================================================================
echo.
pause
