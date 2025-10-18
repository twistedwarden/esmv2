# Critical Fixes Required for GSPH System

## Date: October 18, 2025

## Overview

This document outlines the critical issues found in the GSPH system and the required fixes.

---

## 🔴 Issue 1: 401 Unauthorized Errors on Dashboard Endpoints

### Problem

Multiple dashboard API endpoints are returning 401 (Unauthorized) errors:

- `/api/dashboard/overview`
- `/api/dashboard/status-distribution`
- `/api/dashboard/ssc-workflow`
- `/api/dashboard/recent-activities`
- `/api/dashboard/scholarship-categories`
- `/api/dashboard/top-schools`
- `/api/admin/stats`
- `/api/admin/health`
- `/api/students` (scholarship service)
- `/api/archived` (scholarship service)

### Root Cause

The auth service endpoints require authentication middleware, but either:

1. The JWT token is not being properly validated
2. The authentication middleware is not correctly configured
3. The token is expired or invalid

### Solution Required

#### 1. Verify Auth Middleware Configuration

Check `microservices/auth_service/app/Http/Middleware/Authenticate.php`:

```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

class Authenticate
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false,
                'message' => 'No authorization token provided'
            ], 401);
        }

        try {
            $publicKey = file_get_contents(storage_path('keys/jwt_public.key'));
            $decoded = JWT::decode($token, new Key($publicKey, 'RS256'));

            // Attach user info to request
            $request->merge([
                'user_id' => $decoded->sub,
                'user_email' => $decoded->email ?? null,
                'user_role' => $decoded->role ?? 'user'
            ]);

            return $next($request);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired token',
                'error' => $e->getMessage()
            ], 401);
        }
    }
}
```

#### 2. Add Routes to Auth Service

In `microservices/auth_service/routes/api.php`, ensure these routes exist:

```php
// Dashboard routes (protected)
Route::middleware(['auth'])->prefix('dashboard')->group(function () {
    Route::get('/overview', [DashboardController::class, 'overview']);
    Route::get('/trends', [DashboardController::class, 'trends']);
    Route::get('/status-distribution', [DashboardController::class, 'statusDistribution']);
    Route::get('/ssc-workflow', [DashboardController::class, 'sscWorkflow']);
    Route::get('/scholarship-categories', [DashboardController::class, 'scholarshipCategories']);
    Route::get('/recent-activities', [DashboardController::class, 'recentActivities']);
    Route::get('/top-schools', [DashboardController::class, 'topSchools']);
});

// Admin routes (protected)
Route::middleware(['auth'])->prefix('admin')->group(function () {
    Route::get('/stats', [AdminController::class, 'stats']);
    Route::get('/health', [AdminController::class, 'health']);
});
```

#### 3. Create DashboardController

Create `microservices/auth_service/app/Http/Controllers/DashboardController.php`:

```php
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

class DashboardController extends Controller
{
    public function overview(Request $request)
    {
        try {
            // Fetch data from scholarship service
            $scholarshipService = env('SCHOLARSHIP_SERVICE_URL', 'https://scholarship-gsph.up.railway.app');
            $token = $request->bearerToken();

            $response = Http::withToken($token)
                ->get("{$scholarshipService}/api/applications/counts");

            $data = $response->successful() ? $response->json()['data'] : [];

            return response()->json([
                'success' => true,
                'data' => $data
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch dashboard overview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function statusDistribution(Request $request)
    {
        // Implementation
        return response()->json([
            'success' => true,
            'data' => [
                'approved' => 0,
                'pending' => 0,
                'rejected' => 0,
                'underReview' => 0
            ]
        ]);
    }

    public function sscWorkflow(Request $request)
    {
        // Implementation
        return response()->json([
            'success' => true,
            'data' => [
                'documentVerification' => 0,
                'financialReview' => 0,
                'academicReview' => 0,
                'finalApproval' => 0
            ]
        ]);
    }

    public function scholarshipCategories(Request $request)
    {
        // Implementation
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function recentActivities(Request $request)
    {
        $limit = $request->query('limit', 10);

        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function topSchools(Request $request)
    {
        return response()->json([
            'success' => true,
            'data' => []
        ]);
    }

    public function trends(Request $request)
    {
        $period = $request->query('period', 'monthly');

        return response()->json([
            'success' => true,
            'data' => [
                'monthly' => []
            ]
        ]);
    }
}
```

---

## 🔴 Issue 2: 500 Error - Missing `deleted_at` Column

### Problem

```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'scholarship_programs.deleted_at' in 'where clause'
```

### Root Cause

The `ScholarshipProgram` model uses Laravel's `SoftDeletes` trait, but the database table is missing the `deleted_at` column.

### Solution

I've created a migration file:

- **File**: `microservices/scholarship_service/database/migrations/2025_10_18_000001_add_deleted_at_to_scholarship_programs.php`

### Steps to Apply:

1. **Navigate to scholarship service**:

   ```bash
   cd microservices/scholarship_service
   ```

2. **Run the migration**:

   ```bash
   php artisan migrate
   ```

3. **Verify the column was added**:
   ```bash
   php artisan tinker
   >>> Schema::hasColumn('scholarship_programs', 'deleted_at');
   >>> exit
   ```

---

## 🔴 Issue 3: 404 Error - Missing `/api/academic-records` Endpoint

### Problem

Frontend is trying to access `/api/academic-records` which doesn't exist.

### Root Cause

Academic records are accessed through the students relationship, not as a separate endpoint.

### Solution

#### Option 1: Add the endpoint (Recommended)

Add to `microservices/scholarship_service/routes/api.php`:

```php
// Academic records routes
Route::middleware(['auth.auth_service'])->prefix('academic-records')->group(function () {
    Route::get('/', [AcademicRecordController::class, 'index']);
    Route::post('/', [AcademicRecordController::class, 'store']);
    Route::get('/{id}', [AcademicRecordController::class, 'show']);
    Route::put('/{id}', [AcademicRecordController::class, 'update']);
    Route::delete('/{id}', [AcademicRecordController::class, 'destroy']);
});
```

Create `microservices/scholarship_service/app/Http/Controllers/AcademicRecordController.php`:

```php
<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use Illuminate\Http\Request;

class AcademicRecordController extends Controller
{
    public function index(Request $request)
    {
        try {
            $query = AcademicRecord::with(['student', 'school']);

            // Apply filters
            if ($request->has('student_id')) {
                $query->where('student_id', $request->student_id);
            }

            if ($request->has('school_id')) {
                $query->where('school_id', $request->school_id);
            }

            if ($request->has('is_current')) {
                $query->where('is_current', $request->boolean('is_current'));
            }

            $perPage = $request->input('per_page', 15);
            $records = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $records
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch academic records',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function show($id)
    {
        try {
            $record = AcademicRecord::with(['student', 'school'])->findOrFail($id);

            return response()->json([
                'success' => true,
                'data' => $record
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Academic record not found'
            ], 404);
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'school_id' => 'required|exists:schools,id',
                'educational_level' => 'required|string',
                'year_level' => 'required|string',
                'school_year' => 'required|string',
                'school_term' => 'required|string',
                // Add other validation rules
            ]);

            $record = AcademicRecord::create($validated);

            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Academic record created successfully'
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create academic record',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function update(Request $request, $id)
    {
        try {
            $record = AcademicRecord::findOrFail($id);
            $record->update($request->all());

            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Academic record updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update academic record'
            ], 500);
        }
    }

    public function destroy($id)
    {
        try {
            $record = AcademicRecord::findOrFail($id);
            $record->delete();

            return response()->json([
                'success' => true,
                'message' => 'Academic record deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete academic record'
            ], 500);
        }
    }
}
```

#### Option 2: Update Frontend (Alternative)

If academic records should only be accessed through students, update the frontend service to fetch them through the student endpoint.

---

## ✅ Issue 4: API Configuration

### Status: ✅ ALREADY CORRECT

The API configuration in `GSM/src/config/api.js` is correctly configured:

- Auth Service: `https://auth-gsph.up.railway.app`
- Scholarship Service: `https://scholarship-gsph.up.railway.app`
- Monitoring Service: `https://monitoring-gsph.up.railway.app`

No changes needed for this.

---

## 🔧 Deployment Steps

### 1. Apply Database Migration

```bash
# On scholarship service server
cd microservices/scholarship_service
php artisan migrate
```

### 2. Deploy Auth Service Changes

```bash
# Add dashboard controller and routes
# Restart auth service
php artisan config:clear
php artisan route:clear
```

### 3. Deploy Scholarship Service Changes

```bash
# Add academic records controller and routes
# Restart scholarship service
php artisan config:clear
php artisan route:clear
```

### 4. Test Endpoints

```bash
# Test auth service
curl -H "Authorization: Bearer YOUR_TOKEN" https://auth-gsph.up.railway.app/api/dashboard/overview

# Test scholarship service
curl -H "Authorization: Bearer YOUR_TOKEN" https://scholarship-gsph.up.railway.app/api/scholarship-programs

# Test academic records
curl -H "Authorization: Bearer YOUR_TOKEN" https://scholarship-gsph.up.railway.app/api/academic-records
```

---

## 🔍 Debugging Token Issues

If 401 errors persist, add this debug endpoint to auth service:

```php
Route::get('/debug/token', function (Request $request) {
    $token = $request->bearerToken();

    if (!$token) {
        return response()->json(['error' => 'No token provided']);
    }

    try {
        $publicKey = file_get_contents(storage_path('keys/jwt_public.key'));
        $decoded = JWT::decode($token, new Key($publicKey, 'RS256'));

        return response()->json([
            'valid' => true,
            'user_id' => $decoded->sub,
            'email' => $decoded->email ?? null,
            'role' => $decoded->role ?? null,
            'exp' => date('Y-m-d H:i:s', $decoded->exp),
            'expired' => $decoded->exp < time()
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'valid' => false,
            'error' => $e->getMessage()
        ]);
    }
});
```

Access it: `https://auth-gsph.up.railway.app/api/debug/token` with your Bearer token.

---

## 📋 Summary

| Issue                       | Severity    | Status          | Action Required            |
| --------------------------- | ----------- | --------------- | -------------------------- |
| Dashboard 401 Errors        | 🔴 Critical | Needs Fix       | Add auth service endpoints |
| `deleted_at` Column Missing | 🔴 Critical | Migration Ready | Run migration              |
| Academic Records 404        | 🟡 Medium   | Needs Fix       | Add controller/routes      |
| API Configuration           | ✅ OK       | Complete        | No action needed           |

---

## Next Steps

1. ✅ Review this document
2. 🔧 Run the database migration for `deleted_at` column
3. 🔧 Add dashboard endpoints to auth service
4. 🔧 Add academic records endpoints to scholarship service
5. 🧪 Test all endpoints with valid authentication tokens
6. 📊 Monitor logs for any remaining issues
