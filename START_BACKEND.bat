@echo off
chcp 65001 >nul
title MOTU Backend Launcher
color 0B

echo.
echo  ==========================================
echo   MOTU Backend Launcher
echo  ==========================================
echo.

REM Find Python - check common paths
set "PYTHON="

if exist "%LOCALAPPDATA%\Programs\Python\Python311\python.exe" set "PYTHON=%LOCALAPPDATA%\Programs\Python\Python311\python.exe"
if exist "%LOCALAPPDATA%\Programs\Python\Python310\python.exe" set "PYTHON=%LOCALAPPDATA%\Programs\Python\Python310\python.exe"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PYTHON=%LOCALAPPDATA%\Programs\Python\Python312\python.exe"
if exist "C:\Python311\python.exe" set "PYTHON=C:\Python311\python.exe"
if exist "C:\Python310\python.exe" set "PYTHON=C:\Python310\python.exe"
if exist "C:\Python312\python.exe" set "PYTHON=C:\Python312\python.exe"
if exist "C:\Program Files\Python311\python.exe" set "PYTHON=C:\Program Files\Python311\python.exe"
if exist "C:\Program Files\Python310\python.exe" set "PYTHON=C:\Program Files\Python310\python.exe"
if exist "C:\Program Files\Python312\python.exe" set "PYTHON=C:\Program Files\Python312\python.exe"

if "%PYTHON%"=="" (
    echo  [ERROR] Python not found!
    echo.
    echo  Please install Python from https://python.org/downloads
    echo  Make sure to CHECK "Add Python to PATH" during installation.
    echo.
    pause
    exit /b 1
)

echo  [OK] Found Python: %PYTHON%
echo.

REM Go to backend src
cd /d "%~dp0backend\src"

echo  [INFO] Working directory: %CD%
echo.

REM Check dependencies
echo  [CHECK] Checking dependencies...
"%PYTHON%" -c "import fastapi, uvicorn, sqlalchemy, pydantic_settings, psutil" 2>nul
if errorlevel 1 (
    echo  [INSTALL] Installing dependencies...
    "%PYTHON%" -m pip install fastapi uvicorn sqlalchemy pydantic-settings psutil
    if errorlevel 1 (
        echo  [ERROR] Failed to install dependencies.
        pause
        exit /b 1
    )
) else (
    echo  [OK] All dependencies found.
)

REM Clean old DB
echo.
echo  [CLEAN] Checking for old database...
if exist "motu.db" (
    echo  [CLEAN] Removing old database for schema migration...
    del /f /q "motu.db" "motu.db-shm" "motu.db-wal" 2>nul
) else (
    echo  [OK] No old database found.
)

REM Start
echo.
echo  ==========================================
echo   Starting MOTU Backend on http://localhost:8000
echo  ==========================================
echo.
echo  Press Ctrl+C to stop
echo.

"%PYTHON%" run.py

echo.
echo  Backend stopped.
pause
