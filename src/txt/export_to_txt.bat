@echo off
:: Mengatur folder sumber relatif terhadap folder txt ini
set "TXT_DIR=%~dp0"
set "SRC_DIR=%~dp0.."
set "COMP_DIR=%SRC_DIR%\components"

echo [1/2] Memperbarui file utama (App.tsx, main.tsx)...
copy /Y "%SRC_DIR%\App.tsx" "%TXT_DIR%App.tsx.txt" >nul
copy /Y "%SRC_DIR%\main.tsx" "%TXT_DIR%main.tsx.txt" /Y >nul

echo [2/2] Memperbarui komponen dari folder components...
for %%f in ("%COMP_DIR%\*.tsx") do (
    echo Menimpa %%~nxf.txt...
    copy /Y "%%f" "%TXT_DIR%%%~nxf.txt" >nul
)

echo.
echo Selesai! Versi .txt di folder ini telah diperbarui (selalu menimpa yang lama).
echo Lokasi: %TXT_DIR%
echo.
pause
