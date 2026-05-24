@echo off
echo.
echo ========================================
echo    🛑 STOPPING MELODIC JUSTICE SERVERS
echo ========================================
echo.

:: Kill ONLY processes on ports 3000 and 5000 (leave other Node processes alone)
echo Stopping servers on ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1

:: Wait a moment
timeout /t 2 /nobreak > nul

:: Verify ports are free
powershell -Command "if ((Get-NetTCPConnection -LocalPort 3000,5000 -ErrorAction SilentlyContinue).Count -eq 0) { Write-Host '✅ All servers stopped successfully!' } else { Write-Host '⚠️ Some processes may still be running' }"

echo.
echo Servers have been stopped.
echo You can now restart them with start-servers.bat
echo.
pause