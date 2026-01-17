@echo off
REM DIS-CYRA - Quick Start Script
REM This script starts both backend and frontend servers

echo.
echo =====================================================================
echo   DIS-CYRA - Startup Script
echo =====================================================================
echo.

echo [1/2] Starting Backend Server...
echo.
cd /d d:\Affiliate\smart-affiliate-platform\backend
echo Backend directory: %cd%
echo Command: npm run dev
echo.
echo Note: If you get errors, ensure MongoDB is running
echo.
call npm run dev &
echo.
echo Backend started on http://localhost:5000
echo.
pause
