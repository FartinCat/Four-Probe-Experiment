@echo off
title Four-Probe Virtual Lab — Setup

echo.
echo  ================================================
echo   Four-Probe Method  ^|  Virtual Lab
echo  ================================================
echo.

REM ── Check Python is available ──
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Python not found.
    echo  Please install Python 3.8+ from https://www.python.org/downloads/
    echo  Make sure to tick "Add Python to PATH" during installation.
    pause
    exit /b 1
)

echo  [1/4] Python found.

REM ── Create virtual environment if it doesn't exist ──
if not exist "venv\" (
    echo  [2/4] Creating virtual environment...
    python -m venv venv
) else (
    echo  [2/4] Virtual environment already exists, skipping.
)

REM ── Activate venv and install dependencies ──
echo  [3/4] Installing dependencies into virtual environment...
call venv\Scripts\activate.bat
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

if errorlevel 1 (
    echo.
    echo  [ERROR] pip install failed. Check your internet connection.
    pause
    exit /b 1
)

echo  [4/4] Dependencies installed successfully.
echo.
echo  ================================================
echo   Starting server at  http://localhost:5050
echo   Press Ctrl+C to stop.
echo  ================================================
echo.

python app.py
