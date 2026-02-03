@echo off
REM DIS-CYRA - Frontend Startup Script

echo.
echo =====================================================================
echo   DIS-CYRA - Frontend Startup
echo =====================================================================
echo.

cd /d d:\Affiliate\smart-affiliate-platform\frontend
echo Frontend directory: %cd%
echo.
echo Starting frontend on http://localhost:3000
echo.
call npm start
