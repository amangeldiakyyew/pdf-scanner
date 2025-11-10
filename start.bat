@echo off
echo ========================================
echo  PDF Scanner - Student Management System
echo ========================================
echo.

:: Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    echo.
)

echo Starting server...
echo.
echo Access the application at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

node src/server.js

pause

