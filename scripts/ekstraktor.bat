@echo off
title Ekstraktor HTML ke JS/CSS/JSON
echo ==============================================
echo Alat Pemecah File HTML Super Besar (Monolith)
echo ==============================================
echo.

:: Cek apakah Python sudah terinstal
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python tidak terdeteksi di komputer Anda!
    echo Silakan install Python dari python.org dan centang "Add Python to PATH".
    pause
    exit
)

:: Jalankan script ekstraktor
python ekstraktor.py

echo.
pause