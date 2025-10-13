<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\StudentController;
use App\Http\Controllers\ScholarshipApplicationController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\SchoolController;
use App\Http\Controllers\ScholarshipCategoryController;
use App\Http\Controllers\PartnerSchoolController;
use App\Http\Controllers\EnrollmentVerificationController;
use App\Http\Controllers\InterviewScheduleController;
use App\Http\Controllers\Api\StaffController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Health check
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'timestamp' => now(),
        'service' => 'Scholarship Service API'
    ]);
});

// Public routes (no authentication required)
Route::prefix('public')->group(function () {
    // Get reference data
    Route::get('/schools', [SchoolController::class, 'index']);
    Route::get('/scholarship-categories', [ScholarshipCategoryController::class, 'index']);
    Route::get('/document-types', [DocumentController::class, 'getDocumentTypes']);
    Route::get('/required-documents', [DocumentController::class, 'getRequiredDocuments']);
});

// Student routes (protected by authentication)
Route::prefix('students')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [StudentController::class, 'index']);
    Route::post('/', [StudentController::class, 'store']);
    Route::get('/{student}', [StudentController::class, 'show']);
    Route::put('/{student}', [StudentController::class, 'update']);
    Route::delete('/{student}', [StudentController::class, 'destroy']);
});

// Scholarship Application routes (protected by authentication)
Route::prefix('applications')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [ScholarshipApplicationController::class, 'index']);
    Route::post('/', [ScholarshipApplicationController::class, 'store']);
    Route::get('/{application}', [ScholarshipApplicationController::class, 'show']);
    Route::put('/{application}', [ScholarshipApplicationController::class, 'update']);
    Route::delete('/{application}', [ScholarshipApplicationController::class, 'destroy']);
    
    // Application actions
    Route::post('/{application}/submit', [ScholarshipApplicationController::class, 'submit']);
    Route::post('/{application}/review', [ScholarshipApplicationController::class, 'review']);
    Route::post('/{application}/compliance', [ScholarshipApplicationController::class, 'flagForCompliance']);
    Route::post('/{application}/approve', [ScholarshipApplicationController::class, 'approve']);
    Route::post('/{application}/reject', [ScholarshipApplicationController::class, 'reject']);
    
    // New workflow actions
    Route::post('/{application}/approve-for-verification', [ScholarshipApplicationController::class, 'approveForVerification']);
    Route::post('/{application}/verify-enrollment', [ScholarshipApplicationController::class, 'verifyEnrollment']);
    Route::post('/{application}/schedule-interview', [ScholarshipApplicationController::class, 'scheduleInterview']);
    Route::post('/{application}/schedule-interview-auto', [ScholarshipApplicationController::class, 'scheduleInterviewAuto']);
    Route::post('/{application}/complete-interview', [ScholarshipApplicationController::class, 'completeInterview']);
});

// Document routes
Route::prefix('documents')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [DocumentController::class, 'index']);
    Route::post('/', [DocumentController::class, 'store']);
    Route::get('/{document}', [DocumentController::class, 'show']);
    Route::delete('/{document}', [DocumentController::class, 'destroy']);
    Route::get('/{document}/view', [DocumentController::class, 'view']);
    Route::get('/{document}/download', [DocumentController::class, 'download']);
    Route::post('/{document}/verify', [DocumentController::class, 'verify']);
    Route::post('/{document}/reject', [DocumentController::class, 'reject']);
    
    // Document utilities
    Route::get('/types/list', [DocumentController::class, 'getDocumentTypes']);
    Route::get('/required', [DocumentController::class, 'getRequiredDocuments']);
    Route::get('/checklist', [DocumentController::class, 'getDocumentsChecklist']);
});

// School routes
Route::prefix('schools')->group(function () {
    Route::get('/', [SchoolController::class, 'index']);
    Route::post('/', [SchoolController::class, 'store'])->middleware(['auth.auth_service']);
    Route::get('/{school}', [SchoolController::class, 'show']);
    Route::put('/{school}', [SchoolController::class, 'update'])->middleware(['auth.auth_service']);
    Route::delete('/{school}', [SchoolController::class, 'destroy'])->middleware(['auth.auth_service']);
});

// Scholarship Category routes
Route::prefix('scholarship-categories')->group(function () {
    Route::get('/', [ScholarshipCategoryController::class, 'index']);
    Route::post('/', [ScholarshipCategoryController::class, 'store'])->middleware(['auth.auth_service']);
    Route::get('/{category}', [ScholarshipCategoryController::class, 'show']);
    Route::put('/{category}', [ScholarshipCategoryController::class, 'update'])->middleware(['auth.auth_service']);
    Route::delete('/{category}', [ScholarshipCategoryController::class, 'destroy'])->middleware(['auth.auth_service']);
});

// Partner School routes (protected by authentication)
Route::prefix('partner-school')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/info', [PartnerSchoolController::class, 'getSchoolInfo']);
    Route::get('/stats', [PartnerSchoolController::class, 'getStats']);
    Route::get('/students', [PartnerSchoolController::class, 'getStudents']);
    
    // Enrollment data routes
    Route::post('/enrollment/upload', [PartnerSchoolController::class, 'uploadEnrollmentData']);
    Route::get('/enrollment/data', [PartnerSchoolController::class, 'getEnrollmentData']);
    
    // Flexible data routes (accepts any CSV structure)
    Route::post('/flexible/upload', [PartnerSchoolController::class, 'uploadFlexibleData']);
    Route::get('/flexible/students', [PartnerSchoolController::class, 'getFlexibleStudents']);
    
    // Verification routes
    Route::prefix('verification')->group(function () {
        Route::get('/applications', [PartnerSchoolController::class, 'getApplicationsForVerification']);
        Route::get('/stats', [PartnerSchoolController::class, 'getVerificationStats']);
        Route::post('/applications/{applicationId}', [PartnerSchoolController::class, 'verifyApplication']);
        Route::put('/students/{studentId}/enrollment', [PartnerSchoolController::class, 'updateEnrollmentStatus']);
    });
});

// Enrollment Verification routes have been removed - automatic verification is disabled

// Interview Schedule routes (protected by authentication)
Route::prefix('interview-schedules')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [InterviewScheduleController::class, 'index']);
    Route::get('/{schedule}', [InterviewScheduleController::class, 'show']);
    Route::post('/', [InterviewScheduleController::class, 'store']);
    Route::put('/{schedule}/reschedule', [InterviewScheduleController::class, 'reschedule']);
    Route::post('/{schedule}/complete', [InterviewScheduleController::class, 'complete']);
    Route::post('/{schedule}/cancel', [InterviewScheduleController::class, 'cancel']);
    Route::post('/{schedule}/no-show', [InterviewScheduleController::class, 'markNoShow']);
    Route::get('/available-slots', [InterviewScheduleController::class, 'availableSlots']);
    Route::get('/calendar', [InterviewScheduleController::class, 'calendar']);
});

// Staff routes (protected by authentication)
Route::prefix('staff')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/interviewers', [StaffController::class, 'getInterviewers']);
    Route::get('/', [StaffController::class, 'getAllStaff']);
    Route::get('/{id}', [StaffController::class, 'getStaffById']);
    Route::post('/', [StaffController::class, 'store']);
    Route::put('/{id}', [StaffController::class, 'update']);
});

// User Management routes (protected by authentication - admin only)
Route::prefix('users')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [App\Http\Controllers\Api\UserManagementController::class, 'getAllUsers']);
    Route::get('/role/{role}', [App\Http\Controllers\Api\UserManagementController::class, 'getUsersByRole']);
    Route::get('/stats', [App\Http\Controllers\Api\UserManagementController::class, 'getUserStats']);
    Route::get('/{id}', [App\Http\Controllers\Api\UserManagementController::class, 'getUserById']);
    Route::post('/', [App\Http\Controllers\Api\UserManagementController::class, 'createUser']);
    Route::put('/{id}', [App\Http\Controllers\Api\UserManagementController::class, 'updateUser']);
    Route::delete('/{id}', [App\Http\Controllers\Api\UserManagementController::class, 'deleteUser']);
});

// Audit Log routes (protected by authentication - admin only)
Route::prefix('audit-logs')->middleware(['auth.auth_service'])->group(function () {
    Route::get('/', [App\Http\Controllers\Api\AuditLogController::class, 'index']);
    Route::get('/statistics', [App\Http\Controllers\Api\AuditLogController::class, 'statistics']);
    Route::get('/recent', [App\Http\Controllers\Api\AuditLogController::class, 'recent']);
    Route::get('/filter-options', [App\Http\Controllers\Api\AuditLogController::class, 'filterOptions']);
    Route::get('/export', [App\Http\Controllers\Api\AuditLogController::class, 'export']);
    Route::get('/user/{userId}', [App\Http\Controllers\Api\AuditLogController::class, 'byUser']);
    Route::get('/resource/{resourceType}/{resourceId}', [App\Http\Controllers\Api\AuditLogController::class, 'byResource']);
    Route::get('/{id}', [App\Http\Controllers\Api\AuditLogController::class, 'show']);
});

// Test endpoint for debugging (remove in production)
Route::get('/test/users', function () {
    try {
        $authServiceUrl = config('services.auth_service.url', 'http://localhost:8001');
        $response = \Illuminate\Support\Facades\Http::timeout(10)
            ->get("{$authServiceUrl}/api/users");
        
        return response()->json([
            'success' => true,
            'auth_service_url' => $authServiceUrl,
            'auth_service_status' => $response->status(),
            'auth_service_response' => $response->json(),
            'message' => 'Test endpoint working'
        ]);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'error' => $e->getMessage(),
            'message' => 'Test endpoint failed'
        ], 500);
    }
});

// Partner School Enrollment Data Management routes have been removed - automatic verification is disabled

// Form-specific endpoints for easy integration (protected by authentication)
Route::prefix('forms')->middleware(['auth.auth_service'])->group(function () {
    // New Application Form
    Route::post('/new-application', function (Request $request) {
        $studentController = new StudentController();
        $applicationController = new ScholarshipApplicationController();
        
        // First create the student
        $studentResponse = $studentController->store($request);
        $studentData = json_decode($studentResponse->getContent(), true);
        
        if (!$studentData['success']) {
            return $studentResponse;
        }
        
        // Then create the application
        $request->merge(['student_id' => $studentData['data']['id']]);
        $applicationResponse = $applicationController->store($request);
        $applicationData = json_decode($applicationResponse->getContent(), true);
        
        if (!$applicationData['success']) {
            return $applicationResponse;
        }
        
        // Do not auto-submit; leave status as draft so user can finish later
        
        return $applicationResponse;
    });
    
    // Renewal Application Form
    Route::post('/renewal-application', function (Request $request) {
        $applicationController = new ScholarshipApplicationController();
        
        // Set type to renewal
        $request->merge(['type' => 'renewal']);
        
        $applicationResponse = $applicationController->store($request);
        $applicationData = json_decode($applicationResponse->getContent(), true);
        
        if (!$applicationData['success']) {
            return $applicationResponse;
        }
        
        // Automatically submit the application
        $application = \App\Models\ScholarshipApplication::find($applicationData['data']['id']);
        if ($application) {
            $application->submit();
        }
        
        return $applicationResponse;
    });
    
    // Document Upload
    Route::post('/upload-document', [DocumentController::class, 'store']);
    
    // Get form data for editing
    Route::get('/application/{application}/data', [ScholarshipApplicationController::class, 'show']);
    Route::get('/student/{student}/data', [StudentController::class, 'show']);
});

// Statistics and reporting endpoints
Route::prefix('stats')->group(function () {
    Route::get('/overview', function () {
        $stats = [
            'total_students' => \App\Models\Student::count(),
            'total_applications' => \App\Models\ScholarshipApplication::count(),
            'pending_applications' => \App\Models\ScholarshipApplication::where('status', 'submitted')->count(),
            'approved_applications' => \App\Models\ScholarshipApplication::where('status', 'approved')->count(),
            'total_documents' => \App\Models\Document::count(),
            'verified_documents' => \App\Models\Document::where('status', 'verified')->count(),
        ];
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    });
    
    Route::get('/applications/by-status', function () {
        $statusCounts = \App\Models\ScholarshipApplication::selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');
            
        return response()->json([
            'success' => true,
            'data' => $statusCounts
        ]);
    });
    
    Route::get('/applications/by-type', function () {
        $typeCounts = \App\Models\ScholarshipApplication::selectRaw('type, COUNT(*) as count')
            ->groupBy('type')
            ->pluck('count', 'type');
            
        return response()->json([
            'success' => true,
            'data' => $typeCounts
        ]);
    });
});

// CORS middleware for frontend integration
Route::middleware(['cors'])->group(function () {
    // All routes above will have CORS headers
});

// CORS preflight catch-all for API
Route::options('/{any}', function (Request $request) {
    return response('', 204);
})->where('any', '.*');

// Fallback route
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API endpoint not found',
        'available_endpoints' => [
            'GET /api/health',
            'GET /api/public/schools',
            'GET /api/public/scholarship-categories',
            'GET /api/public/document-types',
            'GET /api/students',
            'POST /api/students',
            'GET /api/applications',
            'POST /api/applications',
            'POST /api/forms/new-application',
            'POST /api/forms/renewal-application',
            'POST /api/forms/upload-document',
            'GET /api/stats/overview'
        ]
    ], 404);
});
