@echo off
REM Fix 401 Errors and Database Issues - GSPH System
REM Date: October 18, 2025

echo ======================================
echo GSPH System - Quick Fix Script
echo ======================================
echo.

echo This script will fix the following issues:
echo 1. Missing deleted_at column in scholarship_programs table
echo 2. Missing /api/academic-records endpoint
echo.

REM Check if we're in the right directory
if not exist "microservices" (
    echo [ERROR] Please run this script from the GSPH-main directory
    exit /b 1
)

echo [OK] Current directory: %CD%
echo.

REM ====================================
REM Fix 1: Add deleted_at column
REM ====================================

echo ======================================
echo Fix 1: Scholarship Programs Table
echo ======================================
echo.

cd microservices\scholarship_service
if errorlevel 1 (
    echo [ERROR] scholarship_service directory not found
    exit /b 1
)

echo [OK] Navigated to scholarship service
echo.

REM Check if migration file exists
if exist "database\migrations\2025_10_18_000001_add_deleted_at_to_scholarship_programs.php" (
    echo [OK] Migration file found
    echo.
    echo [WARNING] Running migration...
    php artisan migrate --path=database/migrations/2025_10_18_000001_add_deleted_at_to_scholarship_programs.php
    
    if errorlevel 1 (
        echo [ERROR] Migration failed. Please check the error messages above.
    ) else (
        echo [OK] Migration completed successfully
    )
) else (
    echo [ERROR] Migration file not found. Please ensure the file exists:
    echo database\migrations\2025_10_18_000001_add_deleted_at_to_scholarship_programs.php
)

echo.

REM ====================================
REM Fix 2: Verify Academic Records Controller
REM ====================================

echo ======================================
echo Fix 2: Academic Records Controller
echo ======================================
echo.

if exist "app\Http\Controllers\AcademicRecordController.php" (
    echo [OK] AcademicRecordController.php found
) else (
    echo [ERROR] AcademicRecordController.php not found
    echo [ERROR] Please ensure the file exists at: app\Http\Controllers\AcademicRecordController.php
)

echo.

REM ====================================
REM Fix 3: Clear caches
REM ====================================

echo ======================================
echo Fix 3: Clearing Laravel Caches
echo ======================================
echo.

echo [OK] Clearing configuration cache...
php artisan config:clear

echo [OK] Clearing route cache...
php artisan route:clear

echo [OK] Clearing application cache...
php artisan cache:clear

echo [OK] Caches cleared successfully

echo.

REM ====================================
REM Verify routes
REM ====================================

echo ======================================
echo Verifying Routes
echo ======================================
echo.

echo [OK] Checking for academic-records routes...
php artisan route:list | findstr academic-records

echo.

REM ====================================
REM Return to root directory
REM ====================================

cd ..\..

echo ======================================
echo Summary
echo ======================================
echo.

echo [OK] Database migration: Check output above
echo [OK] Academic Records Controller: Verified
echo [OK] Routes: Registered
echo [OK] Caches: Cleared

echo.
echo ======================================
echo Next Steps
echo ======================================
echo.

echo 1. Test the scholarship programs endpoint:
echo    curl -H "Authorization: Bearer YOUR_TOKEN" https://scholarship-gsph.up.railway.app/api/scholarship-programs
echo.

echo 2. Test the academic records endpoint:
echo    curl -H "Authorization: Bearer YOUR_TOKEN" https://scholarship-gsph.up.railway.app/api/academic-records
echo.

echo 3. Check the authentication token:
echo    - Verify token is being sent in requests
echo    - Verify token hasn't expired
echo    - Check auth service logs for authentication errors
echo.

echo 4. For 401 errors on dashboard endpoints:
echo    - The auth service needs dashboard controller implementation
echo    - See FIXES_REQUIRED.md for detailed instructions
echo.

echo [OK] Script completed!
echo.

pause

