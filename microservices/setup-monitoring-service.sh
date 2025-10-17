#!/bin/bash

# Monitoring Service Setup Script
# ===============================

echo "🚀 Setting up Monitoring Service..."

# Navigate to monitoring service directory
cd microservices/monitoring_service

# Copy environment file
echo "📋 Copying environment configuration..."
cp env.example .env

# Install PHP dependencies
echo "📦 Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

# Generate application key
echo "🔑 Generating application key..."
php artisan key:generate

# Run database migrations
echo "🗄️ Running database migrations..."
php artisan migrate --force

# Clear and cache configuration
echo "⚡ Optimizing application..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Set proper permissions
echo "🔐 Setting permissions..."
chmod -R 755 storage bootstrap/cache

echo "✅ Monitoring Service setup complete!"
echo ""
echo "📊 Service Information:"
echo "   - URL: http://localhost:8003"
echo "   - Health Check: http://localhost:8003/api/health"
echo "   - Test Connection: http://localhost:8003/api/test-scholarship-connection"
echo ""
echo "🔧 To start the service:"
echo "   php artisan serve --host=0.0.0.0 --port=8003"
echo ""
echo "📚 Available API Endpoints:"
echo "   GET  /api/health                    - Health check"
echo "   GET  /api/education-metrics         - Get education metrics"
echo "   GET  /api/student-trends            - Get student trends"
echo "   GET  /api/program-effectiveness     - Get program effectiveness"
echo "   GET  /api/school-performance        - Get school performance"
echo "   POST /api/generate-report           - Generate monitoring report"
echo "   GET  /api/test-scholarship-connection - Test scholarship service connection"
