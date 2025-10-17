#!/bin/bash

# Education & Monitoring Services Setup Script
# ===========================================

echo "🚀 Setting up Education & Monitoring Services for GSM"
echo "====================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check if we're in the right directory
if [ ! -d "microservices" ]; then
    print_error "Please run this script from the project root directory"
    exit 1
fi

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check PHP
if command -v php &> /dev/null; then
    PHP_VERSION=$(php -r "echo PHP_VERSION;")
    print_status "PHP found: $PHP_VERSION"
else
    print_error "PHP not found. Please install PHP 8.1 or higher"
    exit 1
fi

# Check Composer
if command -v composer &> /dev/null; then
    print_status "Composer found"
else
    print_error "Composer not found. Please install Composer"
    exit 1
fi

# Check MySQL
if command -v mysql &> /dev/null; then
    print_status "MySQL found"
else
    print_warning "MySQL not found. Please install MySQL 8.0 or higher"
fi

echo ""
echo "📦 Setting up Scholarship & Education Service..."
echo "================================================"

# Setup Scholarship Service
cd microservices/scholarship_service

# Install dependencies
echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "Installing Node.js dependencies..."
npm install

# Setup environment
if [ ! -f ".env" ]; then
    echo "Creating environment file..."
    cp env.example .env
    print_status "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Generate app key
echo "Generating application key..."
php artisan key:generate

print_status "Scholarship & Education Service setup complete"

echo ""
echo "📊 Setting up Monitoring Service..."
echo "=================================="

# Setup Monitoring Service
cd ../monitoring_service

# Install dependencies
echo "Installing PHP dependencies..."
composer install --no-dev --optimize-autoloader

echo "Installing Node.js dependencies..."
npm install

# Setup environment
if [ ! -f ".env" ]; then
    echo "Creating environment file..."
    cp env.example .env
    print_status "Environment file created"
else
    print_warning "Environment file already exists"
fi

# Generate app key
echo "Generating application key..."
php artisan key:generate

print_status "Monitoring Service setup complete"

echo ""
echo "🗄️  Database Setup Instructions"
echo "==============================="
echo "Please run the following commands to set up your databases:"
echo ""
echo "1. Create databases:"
echo "   mysql -u root -p -e \"CREATE DATABASE scholarship_service;\""
echo "   mysql -u root -p -e \"CREATE DATABASE monitoring_service;\""
echo ""
echo "2. Run migrations for Scholarship Service:"
echo "   cd microservices/scholarship_service"
echo "   php artisan migrate"
echo ""
echo "3. Run migrations for Monitoring Service:"
echo "   cd microservices/monitoring_service"
echo "   php artisan migrate"
echo "   mysql -u root -p monitoring_service < monitoring_service.sql"
echo ""

echo "🚀 Starting Services"
echo "==================="
echo "To start the services, run the following commands in separate terminals:"
echo ""
echo "Terminal 1 - Scholarship & Education Service:"
echo "cd microservices/scholarship_service"
echo "php artisan serve --port=8002"
echo ""
echo "Terminal 2 - Monitoring Service:"
echo "cd microservices/monitoring_service"
echo "php artisan serve --port=8004"
echo ""

echo "🧪 Testing the Setup"
echo "==================="
echo "After starting the services, test them with:"
echo ""
echo "# Test Scholarship Service"
echo "curl http://localhost:8002/api/health"
echo ""
echo "# Test Monitoring Service"
echo "curl http://localhost:8004/api/health"
echo ""

echo "📚 Documentation"
echo "==============="
echo "For detailed setup instructions, see:"
echo "- microservices/EDUCATION_MONITORING_SETUP.md"
echo "- microservices/scholarship_service/README.md"
echo "- microservices/monitoring_service/README.md"
echo ""

print_status "Setup script completed successfully!"
echo ""
echo "Next steps:"
echo "1. Configure your .env files with proper database credentials"
echo "2. Set up the databases as instructed above"
echo "3. Start the services"
echo "4. Test the API endpoints"
echo "5. Update your frontend configuration"
