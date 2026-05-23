@echo off
title PMN Framework - Compile Modular Document
echo ============================================================
echo   PMN FRAMEWORK ONE-CLICK SYNCHRONIZATION & BUILD SYSTEM
echo ============================================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python was not detected on your computer!
    echo Please install Python and make sure it is added to your PATH.
    pause
    exit
)

:: Run compiler script
cd /d "%~dp0.."
python modularizer.py compile

echo.
echo ============================================================
echo   All files synchronized and index.html compiled!
echo   Double-click index.html or run buka_web.bat to preview.
echo ============================================================
echo.
pause
