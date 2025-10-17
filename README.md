# GoServePH ESM v2 – Setup Guide

This repository contains:
- `GSM/` React (Vite) frontend using Tailwind, React Router, and Zustand
- `microservices/auth_service/` Laravel API for authentication (ported from PHP login)

The login UI matches `gsm_login-main/Login/index.html` while keeping the color palette. Frontend consumes the Laravel auth endpoints.

## Prerequisites
- Node.js 18+ and npm 9+
- PHP 8.2+
- Composer 2+
- SQLite (bundled) or MySQL/PostgreSQL (optional)
- Git

On Windows, use PowerShell and ensure PHP and Composer are on PATH.

## Quick Start (Development)

### 1) Clone
```bash
git clone <your-repo-url> esmv2
cd esmv2
```

### 2) Frontend (GSM)
```bash
cd GSM
npm install
npm run dev
```
Dev server default: `http://localhost:5173`

### 3) Backend (Laravel auth_service)
Open a new terminal:
```bash
cd microservices/auth_service
copy .env.example .env  # Windows (or: cp .env.example .env)

composer install
php artisan key:generate

# SQLite quick start
# .env: DB_CONNECTION=sqlite
if not exist database mkdir database
cd database & type NUL > database.sqlite & cd ..

php artisan migrate --force
# php artisan db:seed --class=Database\Seeders\DatabaseSeeder --force  # optional

php artisan serve --host=127.0.0.1 --port=8000
```
API base: `http://127.0.0.1:8000/api`

### 4) Frontend API config
Frontend uses `http://localhost:8000/api` by default in `GSM/src/store/v1authStore.ts`.
If you prefer an env file, create `GSM/.env`:
```
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```
and read `import.meta.env.VITE_API_BASE_URL` in the store.

## Environment Configuration

### Laravel `microservices/auth_service/.env`
SQLite example:
```
APP_NAME=GoServePH
APP_ENV=local
APP_KEY=base64:GENERATED_BY_KEY_GENERATE
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

LOG_CHANNEL=stack
LOG_LEVEL=debug

DB_CONNECTION=sqlite

SESSION_DRIVER=file
SESSION_LIFETIME=120
```
MySQL example:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=goserveph
DB_USERNAME=root
DB_PASSWORD=yourpassword
```

## Scripts

### Frontend (from `GSM/`)
- `npm run dev` – start Vite dev server
- `npm run build` – production build
- `npm run preview` – preview built app

### Backend (from `microservices/auth_service/`)
- `php artisan serve` – run API server
- `php artisan migrate` – run DB migrations

## Auth Endpoints
- `POST /api/gsm/check-email` – check if email exists/active
- `POST /api/gsm/login` – authenticate and return user + token

Ensure CORS allows the frontend origin (`http://localhost:5173`).

## Project Structure
```
GSM/
  src/pages/GatewayLogin.tsx        # GSM UI + two-step login + modals
  src/pages/Portal.tsx              # CTA sizing adjustments
  src/index.css                     # Brand gradient + utilities
  public/GSM_logo.png
  public/GSPH.svg
microservices/
  auth_service/
    app/Http/Controllers/GsmAuthController.php
    routes/api.php
    database/
      migrations/
```

## Service Ports Reference

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Frontend | 5173 | http://localhost:5173 | React Vite dev server |
| Auth Service | 8000 | http://127.0.0.1:8000 | User authentication & OAuth |
| Scholarship Service | 8001 | http://127.0.0.1:8001 | Scholarship management |
| Aid Service | 8002 | http://127.0.0.1:8002 | Financial aid distribution |
| Monitoring Service | 8003 | http://127.0.0.1:8003 | System monitoring & logs |

## Debugging & Troubleshooting

### Quick Debug Commands
```bash
# Check all services health
node scripts/check-services.js

# Check port availability
node scripts/check-ports.js

# Validate environment files
node scripts/validate-env.js

# Restart specific service
node scripts/restart-service.js auth

# Start all services with debug logging
start_services_debug.bat
```

### Common Issues

**405 Method Not Allowed**
- Cause: Port configuration mismatch
- Fix: Ensure auth service runs on port 8000, not 8001
- Check: `GSM/src/config/api.js` uses `http://localhost:8000`

**React Hooks Error**
- Cause: Early returns before hooks or conditional hook calls
- Fix: Move all `useState`/`useEffect` to component top
- See: `DEBUGGING_GUIDE.md` for detailed examples

**Service Won't Start**
- Check: `node scripts/check-ports.js`
- Kill processes: `netstat -ano | findstr :PORT` then `taskkill /PID PID /F`
- Restart: `node scripts/restart-service.js <service-name>`

**Environment Issues**
- Validate: `node scripts/validate-env.js`
- Copy examples: `cp .env.example .env` in each service
- Generate keys: `php artisan key:generate` in Laravel services

### Debugging Tools
- **Health Check**: `scripts/check-services.js` - Tests all service connectivity
- **Port Check**: `scripts/check-ports.js` - Verifies port availability
- **Env Validation**: `scripts/validate-env.js` - Checks environment files
- **Service Restart**: `scripts/restart-service.js` - Restarts individual services
- **API Tests**: `tests/api-tests.http` - REST Client test collection
- **VS Code Debug**: `.vscode/launch.json` - Debug configurations

### Detailed Troubleshooting
See `DEBUGGING_GUIDE.md` for comprehensive troubleshooting guide.

## Troubleshooting (Legacy)
- Frontend cannot reach API: verify Laravel runs on `127.0.0.1:8000` and CORS includes `http://localhost:5173`.
- PHP extension errors: enable `pdo_sqlite`/`pdo_mysql` in `php.ini` as needed.
- Migrations fail: confirm DB connection and file permissions; for SQLite ensure `database/database.sqlite` exists and is writable.
- Port conflicts: change Vite port (`--port 5174`) or Laravel `--port`.

## Production Notes
- Build frontend (`npm run build`) and host behind a static server or reverse proxy.
- Host Laravel with HTTPS; set `APP_ENV=production`, `APP_DEBUG=false`, and secure CORS.

## License
Proprietary – Internal use for GoServePH.
