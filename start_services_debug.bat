@echo off
REM ESM v2 Debug Services Startup Script
REM This script starts all services with debug logging

echo ========================================
echo ESM v2 Debug Services Startup
echo ========================================
echo.

REM Check if Node.js is available
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 18+ and try again
    pause
    exit /b 1
)

REM Check if PHP is available
php --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: PHP is not installed or not in PATH
    echo Please install PHP 8.2+ and try again
    pause
    exit /b 1
)

echo 1. Checking port availability...
node scripts/check-ports.js
if errorlevel 1 (
    echo.
    echo WARNING: Some ports are in use. Continuing anyway...
    echo You may need to kill existing processes manually.
    echo.
    pause
)

echo.
echo 2. Validating environment files...
node scripts/validate-env.js
if errorlevel 1 (
    echo.
    echo WARNING: Some environment files are missing or incomplete.
    echo Please check the validation output above.
    echo.
    pause
)

echo.
echo 3. Killing existing processes on required ports...
echo Killing processes on ports 5173, 8000, 8001, 8002, 8003...

REM Kill frontend (port 5173)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5173') do (
    if not "%%a"=="0" (
        echo Killing process %%a on port 5173
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Kill auth service (port 8000)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    if not "%%a"=="0" (
        echo Killing process %%a on port 8000
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Kill scholarship service (port 8001)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8001') do (
    if not "%%a"=="0" (
        echo Killing process %%a on port 8001
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Kill aid service (port 8002)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8002') do (
    if not "%%a"=="0" (
        echo Killing process %%a on port 8002
        taskkill /PID %%a /F >nul 2>&1
    )
)

REM Kill monitoring service (port 8003)
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8003') do (
    if not "%%a"=="0" (
        echo Killing process %%a on port 8003
        taskkill /PID %%a /F >nul 2>&1
    )
)

echo.
echo 4. Waiting 3 seconds for ports to be released...
timeout /t 3 /nobreak >nul

echo.
echo 5. Starting all services with debug logging...
echo.

REM Start all services using concurrently
echo Starting services with concurrently...
echo Frontend: http://localhost:5173
echo Auth Service: http://127.0.0.1:8000
echo Scholarship Service: http://127.0.0.1:8001
echo Aid Service: http://127.0.0.1:8002
echo Monitoring Service: http://127.0.0.1:8003
echo.

npm run start:all

echo.
echo ========================================
echo Services startup completed
echo ========================================
echo.
echo To check service health: node scripts/check-services.js
echo To restart a service: node scripts/restart-service.js <service-name>
echo To stop all services: Press Ctrl+C
echo.
pause
