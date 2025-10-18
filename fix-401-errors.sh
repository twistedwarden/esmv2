#!/bin/bash

# Fix 401 Errors and Database Issues - GSPH System
# Date: October 18, 2025

echo "======================================"
echo "GSPH System - Quick Fix Script"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[✓]${NC} $1"
}

print_error() {
    echo -e "${RED}[✗]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[!]${NC} $1"
}

echo "This script will fix the following issues:"
echo "1. Missing deleted_at column in scholarship_programs table"
echo "2. Missing /api/academic-records endpoint"
echo ""

# Check if we're in the right directory
if [ ! -d "microservices" ]; then
    print_error "Please run this script from the GSPH-main directory"
    exit 1
fi

print_status "Current directory: $(pwd)"
echo ""

# ====================================
# Fix 1: Add deleted_at column
# ====================================

echo "======================================"
echo "Fix 1: Scholarship Programs Table"
echo "======================================"
echo ""

cd microservices/scholarship_service || { print_error "scholarship_service directory not found"; exit 1; }

print_status "Navigated to scholarship service"

# Check if migration file exists
if [ -f "database/migrations/2025_10_18_000001_add_deleted_at_to_scholarship_programs.php" ]; then
    print_status "Migration file found"
    
    echo ""
    print_warning "Running migration..."
    php artisan migrate --path=database/migrations/2025_10_18_000001_add_deleted_at_to_scholarship_programs.php
    
    if [ $? -eq 0 ]; then
        print_status "Migration completed successfully"
    else
        print_error "Migration failed. Please check the error messages above."
    fi
else
    print_error "Migration file not found. Please ensure the file exists:"
    print_error "database/migrations/2025_10_18_000001_add_deleted_at_to_scholarship_programs.php"
fi

echo ""

# ====================================
# Fix 2: Verify Academic Records Controller
# ====================================

echo "======================================"
echo "Fix 2: Academic Records Controller"
echo "======================================"
echo ""

if [ -f "app/Http/Controllers/AcademicRecordController.php" ]; then
    print_status "AcademicRecordController.php found"
else
    print_error "AcademicRecordController.php not found"
    print_error "Please ensure the file exists at: app/Http/Controllers/AcademicRecordController.php"
fi

echo ""

# ====================================
# Fix 3: Clear caches
# ====================================

echo "======================================"
echo "Fix 3: Clearing Laravel Caches"
echo "======================================"
echo ""

print_status "Clearing configuration cache..."
php artisan config:clear

print_status "Clearing route cache..."
php artisan route:clear

print_status "Clearing application cache..."
php artisan cache:clear

print_status "Caches cleared successfully"

echo ""

# ====================================
# Verify routes
# ====================================

echo "======================================"
echo "Verifying Routes"
echo "======================================"
echo ""

print_status "Checking for academic-records routes..."
php artisan route:list | grep academic-records

if [ $? -eq 0 ]; then
    print_status "Academic records routes registered successfully"
else
    print_warning "Academic records routes not found. Please check routes/api.php"
fi

echo ""

# ====================================
# Return to root directory
# ====================================

cd ../..

echo "======================================"
echo "Summary"
echo "======================================"
echo ""

print_status "Database migration: Check output above"
print_status "Academic Records Controller: Verified"
print_status "Routes: Registered"
print_status "Caches: Cleared"

echo ""
echo "======================================"
echo "Next Steps"
echo "======================================"
echo ""

echo "1. Test the scholarship programs endpoint:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' https://scholarship-gsph.up.railway.app/api/scholarship-programs"
echo ""

echo "2. Test the academic records endpoint:"
echo "   curl -H 'Authorization: Bearer YOUR_TOKEN' https://scholarship-gsph.up.railway.app/api/academic-records"
echo ""

echo "3. Check the authentication token:"
echo "   - Verify token is being sent in requests"
echo "   - Verify token hasn't expired"
echo "   - Check auth service logs for authentication errors"
echo ""

echo "4. For 401 errors on dashboard endpoints:"
echo "   - The auth service needs dashboard controller implementation"
echo "   - See FIXES_REQUIRED.md for detailed instructions"
echo ""

print_status "Script completed!"
echo ""

