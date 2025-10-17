# Monitoring Service

A comprehensive monitoring and analytics service for the GSM (Government Scholarship Management) system that provides real-time insights into education metrics, student performance, and program effectiveness.

## 🚀 Features

### Core Monitoring Capabilities
- **Education Metrics**: Real-time tracking of student enrollment, academic performance, and program statistics
- **Student Trends**: Analysis of enrollment patterns, graduation rates, and performance trends over time
- **Program Effectiveness**: Evaluation of scholarship programs and their impact on student success
- **School Performance**: Monitoring of partner school performance and student outcomes
- **Report Generation**: Automated generation of comprehensive monitoring reports

### Data Sources
- **Scholarship Service**: Student data, applications, and academic records
- **Auth Service**: User authentication and authorization data
- **Partner Schools**: School information and enrollment data

## 🏗️ Architecture

### Service Dependencies
```
Monitoring Service (Port 8003)
├── Scholarship Service (Port 8001) - Primary data source
├── Auth Service (Port 8002) - Authentication
└── Database (MySQL) - Local metrics storage
```

### API Endpoints

#### Health & Status
- `GET /api/health` - Service health check
- `GET /api/test-scholarship-connection` - Test connection to scholarship service

#### Education Monitoring
- `GET /api/education-metrics` - Get comprehensive education metrics
- `GET /api/student-trends` - Get student performance trends
- `GET /api/program-effectiveness` - Get program effectiveness data
- `GET /api/school-performance` - Get school performance metrics

#### Reporting
- `POST /api/generate-report` - Generate monitoring reports

## 📊 Data Models

### MonitoringReport
```php
- id: Primary key
- report_type: Type of report (comprehensive, student_trends, etc.)
- generated_at: Timestamp of generation
- generated_by: User ID who generated the report
- parameters: JSON parameters used for report generation
- file_url: Path to generated report file (optional)
```

### MonitoringMetric
```php
- id: Primary key
- metric_name: Name of the metric
- metric_value: Numeric value of the metric
- metric_date: Date when metric was recorded
- notes: Additional notes about the metric
```

## 🔧 Setup Instructions

### Prerequisites
- PHP 8.1+
- Composer
- MySQL 8.0+
- Laravel 10+

### Quick Setup

#### Linux/Mac
```bash
chmod +x ../../setup-monitoring-service.sh
../../setup-monitoring-service.sh
```

#### Windows
```cmd
..\..\setup-monitoring-service.bat
```

### Manual Setup

1. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your database and service URLs
   ```

2. **Install Dependencies**
   ```bash
   composer install
   ```

3. **Generate Application Key**
   ```bash
   php artisan key:generate
   ```

4. **Run Migrations**
   ```bash
   php artisan migrate
   ```

5. **Start Service**
   ```bash
   php artisan serve --host=0.0.0.0 --port=8003
   ```

## 🌐 Environment Variables

### Required Configuration
```env
# Application
APP_NAME="Monitoring Service"
APP_URL=http://localhost:8003

# Database
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=monitoring_service
DB_USERNAME=root
DB_PASSWORD=your_password

# Service URLs
SCHOLARSHIP_SERVICE_URL=http://localhost:8001
AUTH_SERVICE_URL=http://localhost:8002
```

### Optional Configuration
```env
# Monitoring Settings
MONITORING_INTERVAL=300
REPORT_GENERATION_ENABLED=true
DASHBOARD_REFRESH_INTERVAL=60

# Notifications
NOTIFICATIONS_ENABLED=true
SLACK_WEBHOOK_URL=your_webhook_url
EMAIL_NOTIFICATIONS=true
```

## 📈 Usage Examples

### Get Education Metrics
```bash
curl -X GET "http://localhost:8003/api/education-metrics" \
  -H "Accept: application/json"
```

### Generate Report
```bash
curl -X POST "http://localhost:8003/api/generate-report" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "comprehensive",
    "date_range": "30_days"
  }'
```

### Test Service Connection
```bash
curl -X GET "http://localhost:8003/api/test-scholarship-connection"
```

## 🔄 Data Flow

### Real-time Monitoring
1. **Data Collection**: Service fetches data from scholarship service APIs
2. **Processing**: Data is processed and metrics are calculated
3. **Storage**: Metrics are stored in local database for historical tracking
4. **API Response**: Processed data is returned to frontend

### Report Generation
1. **Request**: Frontend requests report generation with parameters
2. **Data Aggregation**: Service collects data from multiple sources
3. **Analysis**: Data is analyzed and insights are generated
4. **Storage**: Report is stored in database with metadata
5. **Response**: Report data is returned to frontend

## 🛠️ Development

### Adding New Metrics
1. Create new method in `MonitoringController`
2. Add corresponding route in `routes/web.php`
3. Update frontend to consume new endpoint

### Custom Report Types
1. Add new report type to `MonitoringReport` model
2. Implement report generation logic in `MonitoringController`
3. Update frontend report generation interface

## 🔍 Monitoring & Debugging

### Health Checks
- Service health: `GET /api/health`
- Scholarship service connection: `GET /api/test-scholarship-connection`

### Logs
- Application logs: `storage/logs/laravel.log`
- Monitor service-to-service communication
- Track data fetching errors and fallbacks

### Database Queries
```sql
-- View recent reports
SELECT * FROM monitoring_reports ORDER BY generated_at DESC LIMIT 10;

-- View metrics by name
SELECT * FROM monitoring_metrics WHERE metric_name = 'total_students';

-- View metrics for date range
SELECT * FROM monitoring_metrics 
WHERE metric_date BETWEEN '2024-01-01' AND '2024-12-31';
```

## 🚨 Troubleshooting

### Common Issues

1. **Service Connection Failed**
   - Check if scholarship service is running on port 8001
   - Verify `SCHOLARSHIP_SERVICE_URL` in `.env`
   - Check network connectivity

2. **Database Connection Error**
   - Verify MySQL is running
   - Check database credentials in `.env`
   - Ensure database exists

3. **No Data Returned**
   - Check if scholarship service has data
   - Verify API endpoints are accessible
   - Check service logs for errors

### Debug Commands
```bash
# Test database connection
php artisan tinker
>>> DB::connection()->getPdo();

# Test service connection
php artisan tinker
>>> Http::get('http://localhost:8001/api/health');

# Clear caches
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

## 📚 API Documentation

### Response Format
All API responses follow this format:
```json
{
  "success": true,
  "data": { ... },
  "timestamp": "2024-01-01T00:00:00.000000Z",
  "source": "monitoring_service"
}
```

### Error Format
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## 🔐 Security

- Service-to-service communication uses HTTP (consider HTTPS for production)
- No direct database access from frontend
- All data processing happens server-side
- Input validation on all endpoints

## 📝 License

This service is part of the GSM (Government Scholarship Management) system.

## 🤝 Contributing

1. Follow Laravel coding standards
2. Add tests for new features
3. Update documentation for API changes
4. Test with real data from scholarship service

## 📞 Support

For issues and questions:
1. Check service logs
2. Verify service connections
3. Test with health check endpoints
4. Review this documentation
