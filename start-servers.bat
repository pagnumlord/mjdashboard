@echo off
echo.
echo ========================================
echo    🎬 MELODIC JUSTICE DASHBOARD 🎬
echo ========================================
echo.
echo Starting servers...

:: Check if we're in the right directory
if not exist "backend" (
    echo ERROR: backend folder not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERROR: frontend folder not found!
    echo Make sure you're running this from the project root directory.
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if backend dependencies are installed
if not exist "backend\node_modules" (
    echo Installing backend dependencies...
    cd backend
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install backend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

:: Check if frontend dependencies are installed
if not exist "frontend\node_modules" (
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies!
        pause
        exit /b 1
    )
    cd ..
)

:: Kill only processes on ports 3000 and 5000 (leave other Node processes alone)
echo Cleaning up any existing processes on ports 3000 and 5000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING"') do taskkill /f /pid %%a >nul 2>&1
timeout /t 2 /nobreak > nul

:: Start the backend server (Express/Node.js) in background
echo Starting backend server (Express)...
start /B "" cmd /c "cd backend && node server.js > backend.log 2>&1"

:: Wait for backend to initialize
echo Waiting for backend to initialize...
timeout /t 8 /nobreak > nul

:: Verify backend is running
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:5000/api/check-connection' -TimeoutSec 5 | Out-Null; Write-Host 'Backend is running!' } catch { Write-Host 'WARNING: Backend may not be running properly'; exit 1 }" 
if errorlevel 1 (
    echo.
    echo ⚠️  Backend startup issues detected. Check backend.log for details.
    echo Continuing anyway...
)

:: Start the frontend server (React) in background
echo Starting frontend server (React)...
set BROWSER=none
start /B "" cmd /c "cd frontend && npm start > frontend.log 2>&1"

:: Wait for frontend to compile and start
echo Waiting for frontend to compile...
echo This may take 30-60 seconds for the first time...
timeout /t 25 /nobreak > nul

:: Verify frontend is running and open browser
echo Checking if frontend is ready...
powershell -Command "for ($i=1; $i -le 10; $i++) { try { Invoke-WebRequest -Uri 'http://localhost:3000' -TimeoutSec 3 | Out-Null; Write-Host 'Frontend is ready!'; break } catch { if ($i -eq 10) { Write-Host 'Frontend took longer than expected' } else { Start-Sleep 3 } } }"

:: Open the dashboard in default browser
echo Opening dashboard in browser...
start "" "http://localhost:3000"

echo.
echo ========================================
echo    ✅ DASHBOARD STARTUP COMPLETE! ✅
echo ========================================
echo.
echo Backend (Express):  http://localhost:5000
echo Frontend (React):   http://localhost:3000
echo Dashboard opened in your default browser!
echo.
echo Servers are running in the background.
echo.
echo 📝 Logs are saved to:
echo    - backend.log (backend server logs)
echo    - frontend.log (frontend build logs)
echo.
echo 🛑 To stop servers, run: stop-servers.bat
echo    Or manually kill Node.js processes
echo.

:: For auto-startup mode, remove the pause
if "%1"=="auto" (
    echo Running in auto-startup mode - closing in 5 seconds...
    timeout /t 5 /nobreak > nul
) else (
    echo Press any key to close this startup window...
    echo (Servers will continue running in background)
    pause > nul
)