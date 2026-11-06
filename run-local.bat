@echo off
setlocal
cd /d "%~dp0"

set "PYTHON_CMD=py"
where py >nul 2>nul
if errorlevel 1 (
  set "PYTHON_CMD=python"
  where python >nul 2>nul
  if errorlevel 1 (
    echo Python was not found.
    echo Install Python 3 from https://www.python.org/downloads/windows/
    pause
    exit /b 1
  )
)

echo Starting Tablekeep at http://127.0.0.1:8000/
start "Tablekeep Local Server" /min cmd /c "%PYTHON_CMD% -m http.server 8000 --bind 127.0.0.1"
timeout /t 2 >nul
start "" "http://127.0.0.1:8000/"
echo.
echo Tablekeep is running in your browser.
echo Keep the small server window open while using the app.
echo Close the server window to stop it.
echo.
pause
