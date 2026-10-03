@echo off
setlocal
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\push-to-github.ps1"
set "pushResult=%ERRORLEVEL%"
echo.
pause
exit /b %pushResult%
