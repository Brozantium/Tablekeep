@echo off
setlocal
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 goto use_py
where python >nul 2>nul
if %errorlevel%==0 goto use_python
echo Python was not found. Install Python 3 from https://www.python.org/downloads/windows/
pause
exit /b 1
:use_py
echo Starting Tablekeep server at http://localhost:8000
start "Tablekeep server" /min py -m http.server 8000
 goto browser
:use_python
echo Starting Tablekeep server at http://localhost:8000
start "Tablekeep server" /min python -m http.server 8000
:browser
timeout /t 2 >nul
start "" http://localhost:8000
echo Keep the Tablekeep server window open while using the app.
echo Close the small server window to stop the local server.
pause
