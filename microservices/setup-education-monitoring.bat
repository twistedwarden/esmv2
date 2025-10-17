@echo off
REM Education & Monitoring Services Setup Script for Windows
REM ======================================================

echo 🚀 Setting up Education & Monitoring Services for GSM
echo =====================================================

REM Check if we're in the right directory
if not exist "microservices" (
    echo ✗ Please run this script from the project root directory
    pause
    exit /b 1
)

echo 🔍 Checking prerequisites...

REM Check PHP
php --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ PHP found
) else (
    echo ✗ PHP not found. Please install PHP 8.1 or higher
    pause
    exit /b 1
)

REM Check Composer
composer --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ Composer found
) else (
    echo ✗ Composer not found. Please install Composer
    pause
    exit /b 1
)

REM Check MySQL
mysql --version >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ MySQL found
) else (
    echo ⚠ MySQL not found. Please install MySQL 8.0 or higher
)

echo.
echo 📦 Setting up Scholarship & Education Service...
echo ================================================

REM Setup Scholarship Service
cd microservices\scholarship_service

REM Install dependencies
echo Installing PHP dependencies...
composer install --no-dev --optimize-autoloader

echo Installing Node.js dependencies...
npm install

REM Setup environment
if not exist ".env" (
    echo Creating environment file...
    copy env.example .env
    echo ✓ Environment file created
) else (
    echo ⚠ Environment file already exists
)

REM Generate app key
echo Generating application key...
php artisan key:generate

echo ✓ Scholarship & Education Service setup complete

echo.
echo 📊 Setting up Monitoring Service...
echo ==================================

REM Setup Monitoring Service
cd ..\monitoring_service

REM Install dependencies
echo Installing PHP dependencies...
composer install --no-dev --optimize-autoloader

echo Installing Node.js dependencies...
npm install

REM Setup environment
if not exist ".env" (
    echo Creating environment file...
    copy env.example .env
    echo ✓ Environment file created
) else (
    echo ⚠ Environment file already exists
)

REM Generate app key
echo Generating application key...
php artisan key:generate

echo ✓ Monitoring Service setup complete

echo.
echo 🗄️  Database Setup Instructions
echo ===============================
echo Please run the following commands to set up your databases:
echo.
echo 1. Create databases:
echo    mysql -u root -p -e "CREATE DATABASE scholarship_service;"
echo    mysql -u root -p -e "CREATE DATABASE monitoring_service;"
echo.
echo 2. Run migrations for Scholarship Service:
echo    cd microservices\scholarship_service
echo    php artisan migrate
echo.
echo 3. Run migrations for Monitoring Service:
echo    cd microservices\monitoring_service
echo    php artisan migrate
echo    mysql -u root -p monitoring_service ^< monitoring_service.sql
echo.

echo 🚀 Starting Services
echo ===================
echo To start the services, run the following commands in separate command prompts:
echo.
echo Command Prompt 1 - Scholarship & Education Service:
echo cd microservices\scholarship_service
echo php artisan serve --port=8002
echo.
echo Command Prompt 2 - Monitoring Service:
echo cd microservices\monitoring_service
echo php artisan serve --port=8004
echo.

echo 🧪 Testing the Setup
echo ===================
echo After starting the services, test them with:
echo.
echo REM Test Scholarship Service
echo curl http://localhost:8002/api/health
echo.
echo REM Test Monitoring Service
echo curl http://localhost:8004/api/health
echo.

echo 📚 Documentation
echo ===============
echo For detailed setup instructions, see:
echo - microservices\EDUCATION_MONITORING_SETUP.md
echo - microservices\scholarship_service\README.md
echo - microservices\monitoring_service\README.md
echo.

echo ✓ Setup script completed successfully!
echo.
echo Next steps:
echo 1. Configure your .env files with proper database credentials
echo 2. Set up the databases as instructed above
echo 3. Start the services
echo 4. Test the API endpoints
echo 5. Update your frontend configuration

pause
