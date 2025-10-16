<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipApplication;
use App\Models\Student;
use App\Models\School;
use App\Models\ScholarshipCategory;
use App\Models\ScholarshipSubcategory;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class SchoolAidController extends Controller
{
    public function getApplications(Request $request): JsonResponse
    {
        try {
            // Get applications with related data
            $query = ScholarshipApplication::with(['student', 'school', 'category', 'subcategory']);

            // Apply filters - prioritize status parameter over submodule
            $status = $request->get('status');
            if ($status && $status !== 'all') {
                // Use the explicit status parameter
                $query->where('status', $status);
            } else {
                // Default to approved applications if no specific status is requested
                $query->where('status', 'approved');
            }

            $priority = $request->get('priority');
            if ($priority && $priority !== 'all') {
                // Note: Priority might be stored differently in the actual database
                // This is a placeholder - adjust based on actual schema
                $query->where('priority', $priority);
            }

            $search = $request->get('search');
            if ($search) {
                $query->whereHas('student', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhere('application_number', 'like', "%{$search}%");
            }

            $applications = $query->get();

            // Transform data to match frontend expectations
            $transformedApplications = $applications->map(function ($app) {
                return [
                    'id' => (string) $app->id,
                    'studentName' => $app->student ? $app->student->full_name : 'Unknown Student',
                    'studentId' => $app->application_number,
                    'school' => $app->school ? $app->school->name : 'Unknown School',
                    'schoolId' => (string) $app->school_id,
                    'amount' => $app->approved_amount ?? ($app->subcategory ? $app->subcategory->amount : ($app->category ? $app->category->amount : 0)),
                    'status' => $app->status,
                    'priority' => $this->determinePriority($app),
                    'submittedDate' => $app->created_at ? $app->created_at->format('Y-m-d') : '',
                    'approvalDate' => $app->updated_at ? $app->updated_at->format('Y-m-d') : '',
                    'digitalWallets' => $app->digital_wallets ?? [],
                    'walletAccountNumber' => $app->wallet_account_number ?? '',
                    'documents' => []
                ];
            });

            return response()->json($transformedApplications->toArray());

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch applications',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function updateApplicationStatus(Request $request, $id): JsonResponse
    {
        try {
            $application = ScholarshipApplication::findOrFail($id);
            $application->status = $request->input('status');
            $application->save();

            return response()->json([
                'success' => true,
                'message' => 'Application status updated successfully',
                'application_id' => $id,
                'new_status' => $request->input('status')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to update application status',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function processGrant(Request $request, $id): JsonResponse
    {
        try {
            $application = ScholarshipApplication::findOrFail($id);
            
            // Check if application is approved
            if ($application->status !== 'approved') {
                return response()->json([
                    'error' => 'Application must be approved before processing grant',
                    'current_status' => $application->status
                ], 400);
            }

            // Update status to grants_processing
            $application->status = 'grants_processing';
            $application->save();

            // Here you can add additional logic for grant processing:
            // - Create disbursement records
            // - Send notifications
            // - Log the action
            // - Update related tables

            return response()->json([
                'success' => true,
                'message' => 'Grant processing initiated successfully',
                'application_id' => $id,
                'new_status' => 'grants_processing',
                'amount' => $application->approved_amount ?? 0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to process grant',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function batchUpdateApplications(Request $request): JsonResponse
    {
        try {
            $applicationIds = $request->input('applicationIds', []);
            $status = $request->input('status');

            ScholarshipApplication::whereIn('id', $applicationIds)
                ->update(['status' => $status]);

            return response()->json([
                'success' => true,
                'message' => 'Applications updated successfully',
                'updated_count' => count($applicationIds)
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to batch update applications',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    public function getMetrics(): JsonResponse
    {
        try {
            $totalApplications = ScholarshipApplication::where('status', 'approved')->count();
            $approvedApplications = ScholarshipApplication::where('status', 'approved')->count();
            $processingApplications = ScholarshipApplication::where('status', 'grants_processing')->count();
            $disbursedApplications = ScholarshipApplication::where('status', 'grants_disbursed')->count();
            $failedApplications = ScholarshipApplication::where('status', 'payment_failed')->count();

            // Calculate total amount for approved applications
            $totalAmount = ScholarshipApplication::where('status', 'approved')
                ->get()
                ->sum(function ($app) {
                    return $app->approved_amount ?? ($app->subcategory ? $app->subcategory->amount : ($app->category ? $app->category->amount : 0));
                });

            $disbursedAmount = ScholarshipApplication::where('status', 'grants_disbursed')
                ->get()
                ->sum(function ($app) {
                    return $app->approved_amount ?? ($app->subcategory ? $app->subcategory->amount : ($app->category ? $app->category->amount : 0));
                });

            return response()->json([
                'totalApplications' => $totalApplications,
                'approvedApplications' => $approvedApplications,
                'processingApplications' => $processingApplications,
                'disbursedApplications' => $disbursedApplications,
                'failedApplications' => $failedApplications,
                'totalAmount' => $totalAmount,
                'disbursedAmount' => $disbursedAmount,
                'pendingAmount' => $totalAmount - $disbursedAmount,
                'averageProcessingTime' => 0.0, // Calculate based on actual data
                'successRate' => $totalApplications > 0 ? ($disbursedApplications / $totalApplications) * 100 : 0
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Failed to fetch metrics',
                'message' => $e->getMessage()
            ], 500);
        }
    }

    private function determinePriority($application): string
    {
        // Determine priority based on application data
        // This is a placeholder - adjust based on actual business logic
        $amount = $application->approved_amount ?? ($application->subcategory ? $application->subcategory->amount : ($application->category ? $application->category->amount : 0));
        
        if ($amount >= 20000) {
            return 'high';
        } elseif ($amount >= 15000) {
            return 'normal';
        } else {
            return 'low';
        }
    }
}
