@echo off
title Smart Stay Homes Launcher
echo ========================================================
echo   Starting Smart Stay Homes (Backend + Frontend)
echo ========================================================

start "Smart Stay Backend (Port 5000)" cmd /k "cd /d %~dp0backend && npm.cmd run dev"
timeout /t 2 /nobreak >nul
start "Smart Stay Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm.cmd run dev"

echo Backend running on: http://localhost:5000
echo Frontend running on: http://localhost:5173
echo.
