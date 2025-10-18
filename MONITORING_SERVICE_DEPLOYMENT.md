# Monitoring Service Deployment Guide

## 🚀 Deploy to Railway

### Prerequisites
1. Railway account
2. GitHub repository with monitoring service code
3. Database access (MySQL)

### Step 1: Prepare the Monitoring Service

1. **Navigate to the monitoring service directory:**
   ```bash
   cd microservices/monitoring_service
   ```

2. **Create production .env file:**
   ```bash
   cp env.example .env
   ```

3. **Update .env with production values:**
   ```env
   APP_NAME="Monitoring Service"
   APP_ENV=production
   APP_KEY=base64:your_app_key_here
   APP_DEBUG=false
   APP_URL=https://monitoring-gsph.up.railway.app

   DB_CONNECTION=mysql
   DB_HOST=your_railway_db_host
   DB_PORT=3306
   DB_DATABASE=your_railway_db_name
   DB_USERNAME=your_railway_db_user
   DB_PASSWORD=your_railway_db_password

   AUTH_SERVICE_URL=https://auth-gsph.up.railway.app
   SCHOLARSHIP_SERVICE_URL=https://scholarship-gsph.up.railway.app
   AID_SERVICE_URL=https://aid-gsph.up.railway.app
   ```

### Step 2: Deploy to Railway

1. **Connect to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Create new project
   - Connect your GitHub repository

2. **Configure the service:**
   - Select the `microservices/monitoring_service` directory
   - Set build command: `composer install --no-dev --optimize-autoloader`
   - Set start command: `php artisan serve --host=0.0.0.0 --port=$PORT`

3. **Set environment variables in Railway:**
   - Copy all variables from your .env file
   - Add Railway-specific database credentials

4. **Deploy:**
   - Railway will automatically build and deploy
   - Monitor the logs for any issues

### Step 3: Verify Deployment

1. **Test health endpoint:**
   ```bash
   curl https://monitoring-gsph.up.railway.app/api/health
   ```

2. **Test education metrics:**
   ```bash
   curl https://monitoring-gsph.up.railway.app/api/education-metrics
   ```

3. **Test scholarship service connection:**
   ```bash
   curl https://monitoring-gsph.up.railway.app/api/test-scholarship-connection
   ```

### Step 4: Update Frontend Configuration

The frontend is already configured to use `https://monitoring-gsph.up.railway.app`, so no changes are needed.

## 🔧 Local Development

If you want to run the monitoring service locally:

1. **Install dependencies:**
   ```bash
   cd microservices/monitoring_service
   composer install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   php artisan key:generate
   ```

3. **Run migrations:**
   ```bash
   php artisan migrate
   ```

4. **Start the service:**
   ```bash
   php artisan serve --port=8003
   ```

## 📊 API Endpoints

Once deployed, the monitoring service provides:

- `GET /api/health` - Service health check
- `GET /api/education-metrics` - Comprehensive education data
- `GET /api/student-trends` - Student performance trends
- `GET /api/program-effectiveness` - Program effectiveness data
- `GET /api/school-performance` - School performance metrics
- `POST /api/generate-report` - Generate monitoring reports
- `GET /api/test-scholarship-connection` - Test scholarship service connection

## 🎯 Integration Status

✅ **Frontend Integration Complete**
- DataAggregator updated to use monitoring service
- Fallback to direct API calls when monitoring service unavailable
- Error handling and graceful degradation

✅ **API Service Client Ready**
- MonitoringApiService created
- TypeScript support
- Authentication handling

✅ **Configuration Updated**
- API endpoints configured
- Service URLs set
- Helper functions available

## 🚨 Troubleshooting

### Common Issues

1. **Service not responding:**
   - Check Railway deployment logs
   - Verify environment variables
   - Test database connection

2. **Database connection errors:**
   - Verify Railway database credentials
   - Run migrations: `php artisan migrate`
   - Check database permissions

3. **API timeout errors:**
   - Increase timeout in MonitoringController
   - Check scholarship service availability
   - Verify service URLs

### Debug Commands

```bash
# Check service health
curl https://monitoring-gsph.up.railway.app/api/health

# Test scholarship connection
curl https://monitoring-gsph.up.railway.app/api/test-scholarship-connection

# Get education metrics
curl https://monitoring-gsph.up.railway.app/api/education-metrics
```

## 📈 Next Steps

1. **Deploy the monitoring service** to Railway
2. **Test the integration** using the test files
3. **Monitor performance** and adjust as needed
4. **Add more metrics** as required
5. **Set up automated reports** if needed

The education dashboard will automatically start using real data once the monitoring service is deployed and accessible!
