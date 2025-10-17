# Local Development Setup Guide

## Overview
This guide explains how to run the GoServePH GSM system in local development mode with all services running on localhost.

## Port Configuration

| Service | Port | URL | Status |
|---------|------|-----|--------|
| Auth Service | 8000 | http://localhost:8000 | ✅ Active |
| Scholarship Service | 8001 | http://localhost:8001 | ✅ Active |
| Aid Service | 8002 | http://localhost:8002 | ✅ Active |
| Monitoring Service | 8003 | http://localhost:8003 | ⚠️ Future |
| Frontend | 5173 | http://localhost:5173 | ✅ Active |

## Environment Variables Setup

### 1. Create .env.local file
Copy the example environment file and customize for your local setup:

```bash
cp .env.local.example .env.local
```

### 2. Required Environment Variables

```env
# Auth Service
VITE_API_BASE_URL=http://localhost:8000/api

# Scholarship Service
VITE_SCHOLARSHIP_API_URL=http://localhost:8001/api

# Aid Service
VITE_AID_API_URL=http://localhost:8002/api

# Monitoring Service (Future)
VITE_MONITORING_API_URL=http://localhost:8003/api

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173

# Other configurations
VITE_DEBUG_MODE=true
VITE_SHOW_OTP_IN_DEV=true
VITE_APP_NAME=GoServePH
VITE_APP_VERSION=1.0.0
```

## Service Startup Sequence

### 1. Start Backend Services

**Auth Service (Port 8000):**
```bash
cd microservices/auth_service
php artisan serve --port=8000 --host=127.0.0.1
```

**Scholarship Service (Port 8001):**
```bash
cd microservices/scholarship_service
php artisan serve --port=8001 --host=127.0.0.1
```

**Aid Service (Port 8002):**
```bash
cd microservices/aid_service
php artisan serve --port=8002 --host=127.0.0.1
```

**Monitoring Service (Port 8003):**
```bash
cd microservices/monitoring_service
php artisan serve --port=8003 --host=127.0.0.1
```

### 2. Start Frontend

```bash
cd GSM
npm run dev
```

## Database Setup

### 1. Create Local Databases

Create separate MySQL databases for each service:

```sql
CREATE DATABASE auth_service;
CREATE DATABASE scholarship_service;
CREATE DATABASE aid_service;
CREATE DATABASE monitoring_service;
```

### 2. Configure Database Connections

Update each service's `.env` file with local database credentials:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=auth_service  # or scholarship_service, aid_service, monitoring_service
DB_USERNAME=root
DB_PASSWORD=your_password
```

### 3. Run Migrations

For each service:
```bash
cd microservices/[service_name]
php artisan migrate
```

## Common Troubleshooting

### 1. Port Already in Use
```bash
# Find process using port
netstat -ano | findstr :8000

# Kill process (Windows)
taskkill /PID [PID_NUMBER] /F

# Kill process (Linux/Mac)
kill -9 [PID_NUMBER]
```

### 2. CORS Errors
Ensure all services have CORS configured for `http://localhost:5173`:

- Check `config/cors.php` in each service
- Verify `allowed_origins` includes `http://localhost:5173`

### 3. Database Connection Issues
- Verify MySQL is running
- Check database credentials in `.env` files
- Ensure databases exist
- Run `php artisan config:clear` after changing `.env`

### 4. Service Not Responding
- Check if service is running on correct port
- Verify no firewall blocking the port
- Check service logs for errors
- Ensure all dependencies are installed

### 5. Frontend Build Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run dev
```

## Switching Back to Production

### 1. Update Environment Variables
Change `.env.local` to use production URLs:

```env
VITE_API_BASE_URL=https://auth-gsph.up.railway.app/api
VITE_SCHOLARSHIP_API_URL=https://scholarship-gsph.up.railway.app/api
VITE_AID_API_URL=https://aid-gsph.up.railway.app/api
```

### 2. Or Use Production Environment
```bash
# Remove local environment file
rm .env.local

# The app will use production URLs as fallback
```

## Development Workflow

### 1. Making Changes
- All URL changes are centralized in `src/config/api.js`
- Service-specific URLs use environment variables
- Hardcoded URLs should be avoided

### 2. Testing Changes
- Test each service endpoint individually
- Verify frontend can connect to all services
- Check browser console for errors
- Test authentication flow

### 3. Debugging
- Use browser developer tools
- Check service logs
- Verify network requests in Network tab
- Use `VITE_DEBUG_MODE=true` for additional logging

## File Structure

```
GSM/
├── src/
│   ├── config/
│   │   ├── api.js              # Central API configuration
│   │   └── environment.ts      # Environment variables
│   ├── services/               # Service-specific API calls
│   └── store/
│       └── v1authStore.ts     # Auth store with API URLs
├── .env.local.example         # Environment variables template
└── LOCAL_DEVELOPMENT.md       # This file
```

## Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all services are running
3. Check browser console for errors
4. Review service logs
5. Ensure all environment variables are set correctly

