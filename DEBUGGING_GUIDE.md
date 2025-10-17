# ESM v2 Debugging Guide

This guide helps you troubleshoot common issues in the ESM v2 project.

## Quick Start

1. **Check all services**: `node scripts/check-services.js`
2. **Check port availability**: `node scripts/check-ports.js`
3. **Validate environment**: `node scripts/validate-env.js`
4. **Restart a service**: `node scripts/restart-service.js <service-name>`

## Common Issues & Solutions

### 1. Port Configuration Issues

**Problem**: 405 Method Not Allowed errors
**Cause**: Frontend trying to connect to wrong port
**Solution**: 
```bash
# Check current configuration
node scripts/check-services.js

# Fix port configuration (already done in this setup)
# Auth service should be on port 8000, not 8001
```

**Files to check**:
- `GSM/src/config/api.js` - Should use port 8000 for auth
- `GSM/src/config/environment.ts` - Should use port 8000 for auth
- `GSM/src/store/v1authStore.ts` - Should use port 8000 for auth

### 2. Service Not Starting

**Problem**: Service fails to start or crashes
**Solution**:
```bash
# Check if ports are available
node scripts/check-ports.js

# Kill processes on specific port
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Restart specific service
node scripts/restart-service.js auth
```

### 3. Environment Configuration Issues

**Problem**: Missing environment variables
**Solution**:
```bash
# Validate all environment files
node scripts/validate-env.js

# Copy example files
cp microservices/auth_service/.env.example microservices/auth_service/.env
cp GSM/.env.example GSM/.env

# Generate Laravel keys
cd microservices/auth_service && php artisan key:generate
cd microservices/scholarship_service && php artisan key:generate
cd microservices/aid_service && php artisan key:generate
cd microservices/monitoring_service && php artisan key:generate
```

### 4. React Hooks Errors

**Problem**: "Rendered fewer hooks than expected"
**Cause**: Early returns before hooks or conditional hook calls
**Solution**:
- Move all `useState` and `useEffect` hooks to the top of components
- Avoid early returns before hooks
- Don't call hooks conditionally

**Example fix**:
```typescript
// ❌ Wrong - early return before hooks
function MyComponent() {
  if (loading) return <div>Loading...</div>;
  const [state, setState] = useState();
  // ...
}

// ✅ Correct - hooks first, then early returns
function MyComponent() {
  const [state, setState] = useState();
  const [loading, setLoading] = useState(true);
  
  if (loading) return <div>Loading...</div>;
  // ...
}
```

### 5. CORS Issues

**Problem**: CORS errors in browser console
**Solution**:
- Ensure services are running on correct ports
- Check CORS configuration in Laravel services
- Verify frontend is calling correct URLs

### 6. Database Connection Issues

**Problem**: Database connection errors
**Solution**:
```bash
# Check database configuration
cd microservices/auth_service
php artisan config:show database

# Test database connection
php artisan tinker
# In tinker: DB::connection()->getPdo();

# Run migrations
php artisan migrate
```

### 7. Google OAuth Issues

**Problem**: Google OAuth not working
**Solution**:
- Verify `VITE_GOOGLE_CLIENT_ID` is set in `GSM/.env`
- Check Google OAuth callback URL configuration
- Ensure auth service is running on port 8000
- Test OAuth endpoint: `POST http://localhost:8000/api/auth/google`

## Service Ports Reference

| Service | Port | URL | Status Check |
|---------|------|-----|--------------|
| Frontend | 5173 | http://localhost:5173 | `node scripts/check-services.js` |
| Auth Service | 8000 | http://127.0.0.1:8000 | `curl http://127.0.0.1:8000/api/health` |
| Scholarship Service | 8001 | http://127.0.0.1:8001 | `curl http://127.0.0.1:8001/api/health` |
| Aid Service | 8002 | http://127.0.0.1:8002 | `curl http://127.0.0.1:8002/api/health` |
| Monitoring Service | 8003 | http://127.0.0.1:8003 | `curl http://127.0.0.1:8003/api/health` |

## Debugging Scripts

### Service Health Check
```bash
node scripts/check-services.js
```
Tests all services and reports their status.

### Port Availability Check
```bash
node scripts/check-ports.js
```
Checks if required ports are available before starting services.

### Environment Validation
```bash
node scripts/validate-env.js
```
Validates all .env files have required variables.

### Service Restart
```bash
node scripts/restart-service.js auth
node scripts/restart-service.js scholarship
node scripts/restart-service.js aid
node scripts/restart-service.js monitoring
node scripts/restart-service.js frontend
```
Kills and restarts specific services.

## Manual Testing

### Test Auth Service
```bash
# Health check
curl http://127.0.0.1:8000/api/health

# Test login
curl -X POST http://127.0.0.1:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'

# Test Google OAuth
curl -X POST http://127.0.0.1:8000/api/auth/google \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'
```

### Test Frontend
```bash
# Check if frontend is running
curl http://localhost:5173

# Check API calls in browser dev tools
# Network tab should show calls to port 8000
```

## Log Files

### Laravel Services
- `microservices/*/storage/logs/laravel.log`
- `microservices/*/storage/logs/laravel-{date}.log`

### Frontend
- Browser console (F12)
- Vite dev server output

## Performance Issues

### Check Service Performance
```bash
# Check response times
node scripts/check-services.js

# Monitor resource usage
# Windows: Task Manager
# Or: Get-Process | Sort-Object CPU -Descending
```

### Database Performance
```bash
# Check slow queries
cd microservices/auth_service
php artisan tinker
# In tinker: DB::getQueryLog();
```

## Emergency Recovery

### Reset Everything
```bash
# Kill all services
netstat -ano | findstr :5173 | ForEach-Object { $pid = ($_ -split '\s+')[4]; if($pid) { taskkill /PID $pid /F } }
netstat -ano | findstr :8000 | ForEach-Object { $pid = ($_ -split '\s+')[4]; if($pid) { taskkill /PID $pid /F } }
netstat -ano | findstr :8001 | ForEach-Object { $pid = ($_ -split '\s+')[4]; if($pid) { taskkill /PID $pid /F } }
netstat -ano | findstr :8002 | ForEach-Object { $pid = ($_ -split '\s+')[4]; if($pid) { taskkill /PID $pid /F } }
netstat -ano | findstr :8003 | ForEach-Object { $pid = ($_ -split '\s+')[4]; if($pid) { taskkill /PID $pid /F } }

# Clear Laravel caches
cd microservices/auth_service && php artisan config:clear && php artisan cache:clear && php artisan route:clear
cd microservices/scholarship_service && php artisan config:clear && php artisan cache:clear && php artisan route:clear
cd microservices/aid_service && php artisan config:clear && php artisan cache:clear && php artisan route:clear
cd microservices/monitoring_service && php artisan config:clear && php artisan cache:clear && php artisan route:clear

# Restart all services
npm run start:all
```

## Getting Help

1. Check this debugging guide first
2. Run the diagnostic scripts
3. Check the logs
4. Verify environment configuration
5. Test individual services manually

## Prevention

- Always use the provided scripts to start/stop services
- Keep environment files up to date
- Monitor service health regularly
- Use proper error handling in code
- Test changes incrementally
