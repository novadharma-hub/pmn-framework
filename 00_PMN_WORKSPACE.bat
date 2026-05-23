@echo off
title PMN Framework - Command Dashboard
mode con: cols=70 lines=28
color 0F

:: Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ============================================================
    echo [ERROR] Python was not detected on your system!
    echo Please install Python and ensure it is added to your PATH.
    echo ============================================================
    pause
    exit
)

:: Move working directory to script location
cd /d "%~dp0"

:loop
cls
python pmn_console.py
if %errorlevel% neq 0 (
    echo.
    echo ============================================================
    echo [WARNING] Console exited with an error. 
    echo Press any key to restart the dashboard launcher.
    echo ============================================================
    pause
    goto loop
)
exit
