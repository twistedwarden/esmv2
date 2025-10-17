<!-- 28eb2c87-8e9e-4760-85fb-1fd55f1ff98f 08347a7d-c724-422a-b337-5d1970b41568 -->
# Debugging Setup and Configuration Fix Plan

## Issue Summary

The project has port configuration mismatches causing 405 errors. The frontend expects auth service on port 8001, but documentation and some scripts use port 8000. Standardizing to port 8000.

## Phase 1: Fix Port Configuration Mismatch

### 1.1 Update Frontend API Configuration

**File: `GSM/src/config/api.js`**

- Change `AUTH_SERVICE.BASE_URL` from `http://localhost:8001` to `http://localhost:8000`

**File: `GSM/src/config/environment.ts`**

- Change default `apiBaseUrl` from `http://localhost:8001/api` to `http://localhost:8000/api`

**File: `GSM/src/store/v1authStore.ts`**

- Change `API_BASE_URL` fallback from `http://localhost:8001/api` to `http://localhost:8000/api`

### 1.2 Update Microservice Port Configuration

**File: `package.json` (root)**

- Verify auth service uses port 8000 (already correct)
- Verify scholarship service uses port 8001
- Verify aid service uses port 8002
- Verify monitoring service uses port 8003

### 1.3 Update Environment Switch Documentation

**File: `.cursor/switch-api-environment.md`**

- Update all localhost references to use correct ports
- Auth: 8000 (not 8001)
- Scholarship: 8001 (not 8002)
- Aid: 8002 (not 8003)
- Monitoring: 8003 (not 8004)

## Phase 2: Add Debugging Infrastructure

### 2.1 Create Service Health Check Script

**New File: `scripts/check-services.js`**

```javascript
// Health check script for all microservices
// Tests connectivity and reports status
```

### 2.2 Create Debug Configuration File

**New File: `.vscode/launch.json`**

```json
{
  "configurations": [
    {
      "name": "Debug Frontend",
      "type": "chrome",
      "request": "launch",
      "url": "http://localhost:5173"
    }
  ]
}
```

### 2.3 Create Environment Validation Script

**New File: `scripts/validate-env.js`**

```javascript
// Validates all .env files exist and have required variables
```

### 2.4 Add Logging Configuration

**File: `GSM/src/config/logger.ts`** (new)

```typescript
// Centralized logging configuration
// Console logging for dev, structured for production
```

## Phase 3: Create Debugging Documentation

### 3.1 Create Troubleshooting Guide

**New File: `DEBUGGING_GUIDE.md`**

- Common errors and solutions
- Port conflicts resolution
- Service status checking
- API endpoint testing
- React hooks debugging
- CORS issues

### 3.2 Create Quick Start Debug Script

**New File: `start_services_debug.bat`**

```batch
@echo off
REM Start all services with debug logging
REM Kill existing processes on ports
REM Start fresh instances
```

### 3.3 Update Main README

**File: `README.md`**

- Add debugging section
- Add port reference table
- Add common issues section

## Phase 4: Add Development Tools

### 4.1 Create Port Check Utility

**New File: `scripts/check-ports.js`**

```javascript
// Check if ports are in use before starting services
```

### 4.2 Add Service Restart Script

**New File: `scripts/restart-service.js`**

```javascript
// Kill and restart specific service by name
```

### 4.3 Create API Test Collection

**New File: `tests/api-tests.http`** (REST Client format)

```http
### Auth Service Health
GET http://localhost:8000/api/health

### Login Test
POST http://localhost:8000/api/login
Content-Type: application/json

{
  "username": "test",
  "password": "test"
}
```

## Phase 5: Environment File Templates

### 5.1 Create Frontend Environment Template

**File: `GSM/.env.example`**

```
VITE_API_BASE_URL=http://localhost:8000/api
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_BREVO_API_KEY=your-brevo-api-key
VITE_DEBUG_MODE=true
VITE_SHOW_OTP_IN_DEV=true
```

### 5.2 Verify Backend Environment Templates

- Ensure all microservices have `.env.example`
- Add debugging flags where missing

## Phase 6: Add Error Tracking

### 6.1 Create Error Boundary Component

**File: `GSM/src/components/ErrorBoundary.tsx`** (new)

```typescript
// React error boundary for graceful error handling
```

### 6.2 Add Global Error Handler

**File: `GSM/src/utils/errorHandler.ts`** (new)

```typescript
// Centralized error handling and logging
```

## Files to Modify

1. `GSM/src/config/api.js` - Fix port 8001 → 8000
2. `GSM/src/config/environment.ts` - Fix port 8001 → 8000
3. `GSM/src/store/v1authStore.ts` - Fix port 8001 → 8000
4. `.cursor/switch-api-environment.md` - Fix port references
5. `README.md` - Add debugging section

## New Files to Create

1. `scripts/check-services.js`
2. `scripts/validate-env.js`
3. `scripts/check-ports.js`
4. `scripts/restart-service.js`
5. `.vscode/launch.json`
6. `GSM/src/config/logger.ts`
7. `DEBUGGING_GUIDE.md`
8. `start_services_debug.bat`
9. `tests/api-tests.http`
10. `GSM/.env.example`
11. `GSM/src/components/ErrorBoundary.tsx`
12. `GSM/src/utils/errorHandler.ts`

## Expected Outcomes

- Auth service consistently accessible on port 8000
- All frontend API calls use correct ports
- Easy-to-use debugging scripts
- Comprehensive error handling
- Clear documentation for troubleshooting
- Service health monitoring

### To-dos

- [ ] Fix port configuration mismatch in frontend config files
- [ ] Update switch-api-environment.md with correct port references
- [ ] Create service health check script
- [ ] Create debugging utility scripts (port check, restart, validate)
- [ ] Create comprehensive debugging guide
- [ ] Add error boundary and global error handler
- [ ] Create environment file templates with debugging flags
- [ ] Add VS Code debugging configuration