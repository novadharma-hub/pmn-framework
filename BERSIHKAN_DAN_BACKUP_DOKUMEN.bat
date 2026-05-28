@echo off
title PMN-FRAMEWORK: SECURE DOCUMENT CLEANER
mode con: cols=80 lines=24

:: Tentukan path skrip Python lokal PMN
set "SCRIPT_PATH=%~dp0scripts\strip_metadata_and_backup.py"

:: Resolusi jalur dinamis untuk pmn-workspace
if exist "D:\pmn-workspace\private" (
    set "RAW_DIR=D:\pmn-workspace\private\raw_inputs"
    set "CLEAN_DIR=D:\pmn-workspace\private\clean_outputs"
) else (
    set "RAW_DIR=%~dp0docs\raw_inputs"
    set "CLEAN_DIR=%~dp0docs\clean_outputs"
)

:: Buat folder otomatis jika belum ada
if not exist "%RAW_DIR%" mkdir "%RAW_DIR%"
if not exist "%CLEAN_DIR%" mkdir "%CLEAN_DIR%"

:: Deteksi apakah berkas diseret langsung ke ikon bat
if not "%~1"=="" (
    set "TARGET_FILE=%~1"
    goto EXECUTE
)

:MENU
cls
echo ========================================================================
echo          PMN-FRAMEWORK: SECURE DOCUMENT CLEANER AND BACKUP
echo ========================================================================
echo.
echo   Alat ini akan secara otomatis:
echo   1. Membersihkan metadata (Nama Pembuat, Komputer, Revisi) - Anonymous
echo   2. Melakukan audit internal pasca-proses (Validasi metadata sensitif)
echo   3. Menyimpan salinan steril ke folder tujuan
echo   4. Mengunggah cadangan berkas aman langsung ke Telegram Log Group
echo.
echo ========================================================================
echo   [FOLDER RAW]   : %RAW_DIR%
echo   [FOLDER CLEAN] : %CLEAN_DIR%
echo ========================================================================
echo.

:: Periksa apakah ada file di folder raw_inputs
set "HAS_RAW_FILES=NO"
for /f %%A in ('dir /b /a-d "%RAW_DIR%" 2^>nul') do set "HAS_RAW_FILES=YES"

if "%HAS_RAW_FILES%"=="YES" (
    echo [INFO] Ditemukan dokumen mentah di folder raw_inputs!
    echo.
    choice /c YN /m "Apakah Anda ingin membersihkan seluruh isi folder raw_inputs secara massal?"
    if errorlevel 2 goto PROMPT_INPUT
    
    cls
    echo ========================================================================
    echo             MEMULAI PROSES DEKONTAMINASI MASSAL...
    echo ========================================================================
    python "%SCRIPT_PATH%"
    goto END
)

:PROMPT_INPUT
echo [TIPS] Anda bisa meletakkan dokumen di folder raw_inputs untuk pemrosesan massal,
echo        atau silakan menyeret (drag-and-drop) berkas target ke bawah ini:
echo.
set "TARGET_FILE="
set /p "TARGET_FILE=Masukkan alamat path berkas target (DOCX/PDF): "

:: Bersihkan tanda kutip jika diseret langsung ke CMD window
if defined TARGET_FILE (
    set "TARGET_FILE=%TARGET_FILE:"=%"
)

if "%TARGET_FILE%"=="" (
    echo.
    echo [WARN] Alamat berkas kosong. Silakan coba lagi.
    timeout /t 2 >nul
    goto MENU
)

:EXECUTE
cls
echo ========================================================================
echo                   MEMULAI PROSES DEKONTAMINASI...
echo ========================================================================
echo.
echo Target Berkas: %TARGET_FILE%
echo.

if not exist "%TARGET_FILE%" (
    echo [ERROR] Berkas tidak ditemukan di alamat yang diberikan!
    echo.
    pause
    goto MENU
)

:: Jalankan skrip Python PMN
python "%SCRIPT_PATH%" "%TARGET_FILE%"

:END
if errorlevel 1 (
    echo.
    echo ========================================================================
    echo [FAIL] Terjadi kegagalan atau berkas gagal lolos audit keamanan!
    echo Pastikan Python terpasang dan metadata sensitif tidak bocor.
    echo ========================================================================
) else (
    echo.
    echo ========================================================================
    echo [OK] Sukses! Berkas Anda aman, steril, dan berhasil di-backup.
    echo ========================================================================
)
echo.
echo Tekan tombol apa saja untuk keluar...
pause >nul
