@echo off
title PMN Framework - Central Diagnostics System
color 0B
echo =============================================================
echo       PMN FRAMEWORK CENTRAL DIAGNOSTICS & SYSTEM AUDIT      
echo =============================================================
echo Running exhaust checkup on modular folders, JSON data, and UI skeleton...
echo.

python "%~dp0scripts\pmn_diagnostics.py"

echo.
echo =============================================================
echo [GUIDE] The diagnostic report has been saved to:
echo         D:\pmn-framework\LENGKAPI_DIAGNOSIS_UNTUK_AI.md
echo.
echo Open this file in notepad/markdown, COPY its contents,
echo and PASTE into ChatGPT Free, Claude Web, or Gemini Web
echo for instant, precise offline debugging assistance!
echo =============================================================
pause
