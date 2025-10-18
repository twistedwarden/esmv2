#!/bin/bash

# Fix Scholarship Service Migrations
# This script will help fix the migration issues

echo "🔧 Fixing Scholarship Service Migrations"
echo "========================================"

# Check if we're in the right directory
if [ ! -f "artisan" ]; then
    echo "❌ Error: Not in Laravel project directory"
    echo "Please run this script from the scholarship service directory"
    exit 1
fi

echo "✅ Found Laravel project"

# Check database connection
echo "🔍 Testing database connection..."
php artisan migrate:status > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection successful"
else
    echo "❌ Database connection failed"
    echo "Please check your database configuration in .env"
    exit 1
fi

# Reset migrations (if needed)
echo "🔄 Resetting migrations..."
php artisan migrate:reset --force

# Run migrations
echo "🚀 Running migrations..."
php artisan migrate --force

if [ $? -eq 0 ]; then
    echo "✅ Migrations completed successfully!"
else
    echo "❌ Migration failed"
    echo "Please check the error messages above"
    exit 1
fi

# Run seeders (optional)
echo "🌱 Running seeders..."
php artisan db:seed --force

echo "🎉 All done! Your scholarship service should now be working."
