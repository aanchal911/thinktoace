@echo off
echo Starting ThinkToAce StudyMate Server...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if package.json exists
if not exist package.json (
    echo Error: package.json not found
    echo Please run this script from the ThinkToAce directory
    pause
    exit /b 1
)

REM Install dependencies if node_modules doesn't exist
if not exist node_modules (
    echo Installing dependencies...
    npm install
    echo.
)

REM Start the server
echo Starting StudyMate Server on http://localhost:5000
echo Press Ctrl+C to stop the server
echo.
node server.js

pause