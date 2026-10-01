@echo off
cd /d C:\Projects\EnglishMastery
start /min npm run dev
timeout /t 8 /nobreak >nul
start "" http://127.0.0.1:3000/
