@echo off
echo Setting up Melodic Justice Project...
echo.

echo Step 1: Creating data directory in backend folder...
mkdir backend\data
mkdir backend\uploads

echo Step 2: Installing backend dependencies...
cd backend
call npm install
cd ..

echo Step 3: Installing frontend dependencies...
cd frontend
call npm install
cd ..

echo.
echo Setup complete! Now you can run start-servers.bat to start the application.
echo.
pause