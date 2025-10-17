<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\MonitoringController;

Route::get('/', function () {
    return view('welcome');
});

// API Routes
Route::prefix('api')->group(function () {
    // Health check
    Route::get('/health', function () {
        return response()->json([
            'status' => 'ok',
            'timestamp' => now(),
            'service' => 'Monitoring Service API'
        ]);
    });

    // Education monitoring endpoints
    Route::get('/education-metrics', [MonitoringController::class, 'getEducationMetrics']);
    Route::get('/student-trends', [MonitoringController::class, 'getStudentTrends']);
    Route::get('/program-effectiveness', [MonitoringController::class, 'getProgramEffectiveness']);
    Route::get('/school-performance', [MonitoringController::class, 'getSchoolPerformance']);
    Route::post('/generate-report', [MonitoringController::class, 'generateReport']);

    // Test endpoint to verify scholarship service connection
    Route::get('/test-scholarship-connection', function () {
        try {
            $scholarshipUrl = config('services.scholarship_service.url', 'http://localhost:8001');
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->get("{$scholarshipUrl}/api/health");
            
            return response()->json([
                'success' => true,
                'scholarship_service_url' => $scholarshipUrl,
                'scholarship_service_status' => $response->status(),
                'scholarship_service_response' => $response->json(),
                'message' => 'Scholarship service connection test successful'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
                'message' => 'Scholarship service connection test failed'
            ], 500);
        }
    });
});
