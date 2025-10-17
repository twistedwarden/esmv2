# Education & Monitoring Services Setup Guide

This guide will help you set up the Education and Monitoring services for the GSM (GoServePH) system.

## Overview

The GSM system consists of several microservices:
- **Auth Service** (Port 8001) - User authentication and management
- **Scholarship & Education Service** (Port 8002) - Handles scholarships and education data
- **Aid Service** (Port 8003) - Financial aid distribution
- **Monitoring Service** (Port 8004) - System monitoring and reporting

## Prerequisites

- PHP 8.1 or higher
- Composer
- MySQL 8.0 or higher
- Node.js 18+ (for frontend)
- Git

## 1. Education Service Setup (Scholarship Service)

The education functionality is integrated into the scholarship service, which handles:
- Academic records management
- Student enrollment tracking
- GPA calculation and monitoring
- Educational performance analytics
- Partner school management

### Step 1: Navigate to the Scholarship Service
```bash
cd microservices/scholarship_service
```

### Step 2: Install Dependencies
```bash
composer install
npm install
```

### Step 3: Environment Configuration
```bash
# Copy the environment template
cp env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE scholarship_service;"

# Run migrations
php artisan migrate

# Seed initial data (optional)
php artisan db:seed
```

### Step 5: Start the Service
```bash
php artisan serve --port=8002
```

## 2. Monitoring Service Setup

The monitoring service provides:
- System health monitoring
- Performance metrics collection
- Report generation
- Dashboard analytics
- Service integration monitoring

### Step 1: Navigate to the Monitoring Service
```bash
cd microservices/monitoring_service
```

### Step 2: Install Dependencies
```bash
composer install
npm install
```

### Step 3: Environment Configuration
```bash
# Copy the environment template
cp env.example .env

# Generate application key
php artisan key:generate
```

### Step 4: Database Setup
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE monitoring_service;"

# Run migrations
php artisan migrate

# Import the monitoring schema
mysql -u root -p monitoring_service < monitoring_service.sql
```

### Step 5: Start the Service
```bash
php artisan serve --port=8004
```

## 3. Environment Configuration

### Scholarship Service (.env)
Key configuration variables:
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=scholarship_service
DB_USERNAME=root
DB_PASSWORD=your_password

# Education Features
ACADEMIC_RECORDS_ENABLED=true
ENROLLMENT_VERIFICATION_ENABLED=true
GPA_CALCULATION_ENABLED=true
ACADEMIC_WARNING_THRESHOLD=2.0
ACADEMIC_PROBATION_THRESHOLD=1.5

# Document Security
DOCUMENT_ENCRYPTION_ENABLED=true
DOCUMENT_STORAGE_PATH=storage/app/documents
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,jpg,jpeg,png,doc,docx
```

### Monitoring Service (.env)
Key configuration variables:
```env
# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=monitoring_service
DB_USERNAME=root
DB_PASSWORD=your_password

# Service Integration
AUTH_SERVICE_URL=http://localhost:8001
SCHOLARSHIP_SERVICE_URL=http://localhost:8002
AID_SERVICE_URL=http://localhost:8003

# Monitoring Configuration
MONITORING_INTERVAL=300
REPORT_GENERATION_ENABLED=true
DASHBOARD_REFRESH_INTERVAL=60
```

## 4. Database Schema

### Education Data (Scholarship Service)
- `academic_records` - Student academic performance
- `students` - Student profiles and information
- `schools` - Partner educational institutions
- `scholarship_applications` - Scholarship applications
- `documents` - Academic and supporting documents

### Monitoring Data (Monitoring Service)
- `monitoring_reports` - Generated system reports
- `monitoring_metrics` - System performance metrics
- `service_health` - Service status tracking
- `performance_logs` - Performance monitoring data

## 5. API Endpoints

### Education Service (Port 8002)
```
GET  /api/health                    # Service health check
GET  /api/students                  # List students
GET  /api/students/{id}             # Get student details
POST /api/students                  # Create student
PUT  /api/students/{id}             # Update student
GET  /api/academic-records          # List academic records
POST /api/academic-records          # Create academic record
GET  /api/schools                   # List partner schools
GET  /api/scholarship-categories    # List scholarship categories
```

### Monitoring Service (Port 8004)
```
GET  /api/health                    # Service health check
GET  /api/metrics                   # System metrics
GET  /api/reports                   # Available reports
POST /api/reports/generate          # Generate report
GET  /api/dashboard                 # Dashboard data
GET  /api/services/status           # All services status
```

## 6. Testing the Setup

### Test Education Service
```bash
# Health check
curl http://localhost:8002/api/health

# List students
curl http://localhost:8002/api/students

# List academic records
curl http://localhost:8002/api/academic-records
```

### Test Monitoring Service
```bash
# Health check
curl http://localhost:8004/api/health

# Get metrics
curl http://localhost:8004/api/metrics

# Get dashboard data
curl http://localhost:8004/api/dashboard
```

## 7. Frontend Integration

Update your frontend environment variables:
```env
# In GSM/.env
VITE_SCHOLARSHIP_API_URL=http://localhost:8002/api
VITE_MONITORING_API_URL=http://localhost:8004/api
```

## 8. Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials
   - Ensure databases exist

2. **Port Already in Use**
   - Check if services are already running
   - Use different ports if needed
   - Kill existing processes

3. **Permission Errors**
   - Ensure proper file permissions
   - Check storage directory permissions
   - Verify database user permissions

4. **Service Communication Issues**
   - Verify all services are running
   - Check service URLs in .env files
   - Ensure CORS is properly configured

### Logs
- Scholarship Service: `storage/logs/laravel.log`
- Monitoring Service: `storage/logs/laravel.log`
- Frontend: Browser console

## 9. Production Deployment

For production deployment:
1. Set `APP_ENV=production`
2. Set `APP_DEBUG=false`
3. Use strong database passwords
4. Configure proper SSL certificates
5. Set up proper logging and monitoring
6. Configure backup strategies

## 10. Next Steps

After successful setup:
1. Test all API endpoints
2. Verify database connections
3. Test service-to-service communication
4. Configure monitoring alerts
5. Set up automated backups
6. Document any custom configurations

## Support

For issues or questions:
1. Check the logs first
2. Verify environment configuration
3. Test individual services
4. Check database connectivity
5. Review service documentation
