@echo off
title PMN Framework - Central Backup & Rollback Utility
color 0E
echo =============================================================
echo       PMN FRAMEWORK CENTRAL BACKUP & ROLLBACK UTILITY      
echo =============================================================
echo Starting workspace snapshot manager...
echo.

python "%~dp0scripts\pmn_backup.py"

echo.
echo =============================================================
echo [INFO] Active snapshot session ended.
echo =============================================================
pause
