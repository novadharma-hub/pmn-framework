@echo off
title PMN WORKSPACE - KIRIM KE GITHUB
color 0B
echo =======================================================================
echo          PMN WORKSPACE - PENDUKUNG PUSH GITHUB OTOMATIS (AMAN)
echo =======================================================================
echo.
echo Skrip ini akan menambahkan seluruh perubahan berkas steril Anda, 
echo membuat komit aman, dan mendorongnya ke GitHub publik secara instan.
echo.
echo [*] Melakukan pengecekan status Git lokal...
git status
echo.
echo =======================================================================
echo.
set /p commit_msg="Masukkan pesan pembaruan Anda (Contoh: Update bab 5): "
if "%commit_msg%"=="" set commit_msg=Pembaruan naskah rutin PMN

echo.
echo [*] Menambahkan berkas steril ke Git...
git add .

echo.
echo [*] Membuat komit dengan pesan: "%commit_msg%"...
git commit -m "%commit_msg%"

echo.
echo [*] Mendorong ke GitHub (origin/main)...
git push origin main

echo.
echo =======================================================================
echo   [OK] Sukses! Perubahan Anda telah aman dan steril terunggah ke GitHub!
echo =======================================================================
echo.
pause
