<!-- 54c2a53b-c5b4-44bd-8236-bfa81df2fb75 9ccfbb7f-1b5b-41cc-b389-f871719f5074 -->
# Production to Local Development Migration Plan

## Overview

This plan migrates all production endpoint URLs to local development configuration for the auth, scholarship, and aid services. The monitoring service will be documented for future setup.

## Port Configuration

| Service | Port | URL |

|---------|------|-----|

| Auth Service | 8000 | http://localhost:8000 |

| Scholarship Service | 8001 | http://localhost:8001 |

| Aid Service | 8002 | http://localhost:8002 |

| Monitoring Service | 8003 | http://localhost:8003 |

| Frontend | 5173 | http://localhost:5173 |

## Files to Modify

### 1. Frontend Configuration Files

**GSM/src/config/api.js**

- Change `AUTH_SERVICE.BASE_URL` from `https://auth-gsph.up.railway.app` to `http://localhost:8000`
- Change `SCHOLARSHIP_SERVICE.BASE_URL` from `https://scholarship-gsph.up.railway.app` to `http://localhost:8001`
- Add `AID_SERVICE.BASE_URL` as `http://localhost:8002` (currently missing)
- Add `MONITORING_SERVICE.BASE_URL` as `http://localhost:8003` (for future use)

**GSM/src/config/environment.ts**

- Change default `apiBaseUrl` from `https://auth-gsph.up.railway.app/api` to `http://localhost:8000/api`

**GSM/src/store/v1authStore.ts**

- Change `API_BASE_URL` from `https://auth-gsph.up.railway.app/api` to `http://localhost:8000/api`

### 2. Service-Specific Files

**GSM/src/services/studentApiService.js**

- Change `SCHOLARSHIP_API` default from `https://scholarship-gsph.up.railway.app/api` to `http://localhost:8001/api`

**GSM/src/services/studentRegistrationService.js**

- Change `this.baseURL` default from `https://scholarship-gsph.up.railway.app/api` to `http://localhost:8001/api`

**GSM/src/services/sscAssignmentService.js**

- Change `SCHOLARSHIP_API` default from `https://scholarship-gsph.up.railway.app/api` to `http://localhost:8001/api`

**GSM/src/services/archivedDataService.js**

- Change `SCHOLARSHIP_API` default from `https://scholarship-gsph.up.railway.app/api` to `http://localhost:8001/api`

**GSM/src/admin/components/modules/schoolAid/services/schoolAidService.ts**

- Change `API_BASE_URL` default from `https://aid-gsph.up.railway.app/api` to `http://localhost:8002/api`

### 3. Hardcoded URLs in Components

**GSM/src/pages/GatewayLogin.tsx**

- Check for hardcoded auth service URLs and replace with `http://localhost:8000`

**GSM/src/admin/components/modules/UserManagement/SchoolAssignmentModal.jsx**

- Check for hardcoded auth service URLs and replace with `http://localhost:8000`

**GSM/src/partner-school/PartnerSchoolDashboard.jsx**

- Check for hardcoded auth service URLs and replace with `http://localhost:8000`

### 4. Other Frontend Files to Check

Files identified as containing production URLs:

- `GSM/src/admin/components/modules/interviewer/ApplicationViewModal.jsx`
- `GSM/src/admin/components/modules/UserManagement/UserManagement.jsx`
- `GSM/src/admin/contexts/NotificationContext.tsx`
- `GSM/src/utils/softDeleteUtils.js`
- `GSM/src/admin/components/modules/AuditLog/AuditLog.jsx`
- `GSM/src/admin/components/modules/security/DocumentSecurityDashboard.jsx`
- `GSM/src/admin/components/modules/partnerSchool/PSDStudentPopulation.jsx`
- `GSM/src/services/dashboardService.js`
- `GSM/src/services/settingsService.js`
- `GSM/src/services/schoolService.js`
- `GSM/src/services/partnerSchoolService.js`

## Documentation to Create

### 1. Local Development Setup Guide

Create `GSM/LOCAL_DEVELOPMENT.md` with:

- Port configuration reference table
- Environment variable setup instructions
- Service startup sequence
- Common troubleshooting tips
- How to switch back to production

### 2. Environment Variables Reference

Create `GSM/.env.local.example` with:

```
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
```

### 3. Update Existing Documentation

Update `GSM/env.example` to include all new environment variables for local development

## Backend Service Verification

### 1. CORS Configuration

Verify all services have CORS configured for `http://localhost:5173`:

- `microservices/auth_service/config/cors.php`
- `microservices/scholarship_service/config/cors.php`
- `microservices/aid_service/config/cors.php`
- `microservices/monitoring_service/config/cors.php` (when created)

### 2. Service Inter-communication

Check service-to-service communication URLs:

- `microservices/scholarship_service/config/services.php` - should reference `http://localhost:8000` for auth
- `microservices/aid_service/config/services.php` - should reference `http://localhost:8000` for auth
- `microservices/monitoring_service/config/services.php` - when created

## Implementation Order

1. Update central configuration files (api.js, environment.ts)
2. Update service-specific files
3. Search and replace hardcoded URLs in components
4. Create documentation files
5. Test each service endpoint
6. Verify CORS configuration
7. Document any issues encountered

## Testing Checklist

After migration, verify:

- [ ] Auth service login/logout works
- [ ] Scholarship service endpoints respond
- [ ] Aid service endpoints respond
- [ ] Frontend can fetch data from all services
- [ ] CORS errors are resolved
- [ ] Google OAuth redirects correctly
- [ ] No console errors for missing endpoints

## Rollback Plan

If issues occur:

1. Keep a backup of production URLs in comments
2. Use environment variables to toggle between local/production
3. Document any issues in the troubleshooting section

## Notes

- Monitoring service has no .env file yet - document setup requirements only
- All changes maintain production URLs as fallback in environment variables
- Frontend will use local development by default, can override with .env file