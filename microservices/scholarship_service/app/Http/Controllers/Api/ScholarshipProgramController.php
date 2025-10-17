<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ScholarshipProgram;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class ScholarshipProgramController extends Controller
{
    /**
     * Display a listing of scholarship programs.
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $query = ScholarshipProgram::query();

            // Apply filters
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->has('is_active')) {
                $query->where('is_active', $request->boolean('is_active'));
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('description', 'like', "%{$search}%");
                });
            }

            // Apply sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $programs = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $programs->items(),
                'meta' => [
                    'current_page' => $programs->currentPage(),
                    'last_page' => $programs->lastPage(),
                    'per_page' => $programs->perPage(),
                    'total' => $programs->total(),
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch scholarship programs',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Store a newly created scholarship program.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'required|in:merit,need_based,special,renewal,field_specific,service_based',
                'award_amount' => 'required|numeric|min:0',
                'max_recipients' => 'required|integer|min:1',
                'total_budget' => 'required|numeric|min:0',
                'application_deadline' => 'required|date|after:today',
                'start_date' => 'required|date|after_or_equal:today',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'in:active,paused,closed,draft',
                'requirements' => 'nullable|array',
                'benefits' => 'nullable|array',
                'eligibility_criteria' => 'nullable|array',
                'application_instructions' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $programData = $request->all();
            $programData['created_by'] = auth()->id();
            $programData['current_recipients'] = 0;
            $programData['budget_used'] = 0;

            $program = ScholarshipProgram::create($programData);

            return response()->json([
                'success' => true,
                'message' => 'Scholarship program created successfully',
                'data' => $program
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to create scholarship program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified scholarship program.
     */
    public function show(ScholarshipProgram $scholarshipProgram): JsonResponse
    {
        try {
            $scholarshipProgram->load(['creator', 'updater', 'applications' => function ($query) {
                $query->with(['student', 'category', 'subcategory', 'school']);
            }]);

            return response()->json([
                'success' => true,
                'data' => $scholarshipProgram
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch scholarship program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update the specified scholarship program.
     */
    public function update(Request $request, ScholarshipProgram $scholarshipProgram): JsonResponse
    {
        try {
            $validator = Validator::make($request->all(), [
                'name' => 'sometimes|required|string|max:255',
                'description' => 'nullable|string',
                'type' => 'sometimes|required|in:merit,need_based,special,renewal,field_specific,service_based',
                'award_amount' => 'sometimes|required|numeric|min:0',
                'max_recipients' => 'sometimes|required|integer|min:1',
                'total_budget' => 'sometimes|required|numeric|min:0',
                'application_deadline' => 'sometimes|required|date',
                'start_date' => 'sometimes|required|date',
                'end_date' => 'nullable|date|after:start_date',
                'status' => 'sometimes|in:active,paused,closed,draft',
                'requirements' => 'nullable|array',
                'benefits' => 'nullable|array',
                'eligibility_criteria' => 'nullable|array',
                'application_instructions' => 'nullable|string',
                'is_active' => 'sometimes|boolean',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Validation failed',
                    'errors' => $validator->errors()
                ], 422);
            }

            $programData = $request->all();
            $programData['updated_by'] = auth()->id();

            $scholarshipProgram->update($programData);

            return response()->json([
                'success' => true,
                'message' => 'Scholarship program updated successfully',
                'data' => $scholarshipProgram->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update scholarship program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified scholarship program.
     */
    public function destroy(ScholarshipProgram $scholarshipProgram): JsonResponse
    {
        try {
            // Check if program has applications
            if ($scholarshipProgram->applications()->count() > 0) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot delete program with existing applications'
                ], 400);
            }

            $scholarshipProgram->delete();

            return response()->json([
                'success' => true,
                'message' => 'Scholarship program deleted successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete scholarship program',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get program statistics.
     */
    public function getStatistics(): JsonResponse
    {
        try {
            $stats = [
                'total_programs' => ScholarshipProgram::count(),
                'active_programs' => ScholarshipProgram::where('status', 'active')->where('is_active', true)->count(),
                'paused_programs' => ScholarshipProgram::where('status', 'paused')->count(),
                'closed_programs' => ScholarshipProgram::where('status', 'closed')->count(),
                'total_recipients' => ScholarshipProgram::sum('current_recipients'),
                'total_budget' => ScholarshipProgram::sum('total_budget'),
                'budget_used' => ScholarshipProgram::sum('budget_used'),
                'programs_by_type' => ScholarshipProgram::select('type', DB::raw('count(*) as count'))
                    ->groupBy('type')
                    ->get()
                    ->pluck('count', 'type'),
                'programs_by_status' => ScholarshipProgram::select('status', DB::raw('count(*) as count'))
                    ->groupBy('status')
                    ->get()
                    ->pluck('count', 'status'),
            ];

            $stats['budget_utilization_percentage'] = $stats['total_budget'] > 0 
                ? round(($stats['budget_used'] / $stats['total_budget']) * 100, 2) 
                : 0;

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch program statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update program recipients count.
     */
    public function updateRecipientsCount(ScholarshipProgram $scholarshipProgram): JsonResponse
    {
        try {
            $scholarshipProgram->updateRecipientsCount();
            $scholarshipProgram->updateBudgetUsed();

            return response()->json([
                'success' => true,
                'message' => 'Program statistics updated successfully',
                'data' => $scholarshipProgram->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update program statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Toggle program status.
     */
    public function toggleStatus(ScholarshipProgram $scholarshipProgram): JsonResponse
    {
        try {
            $newStatus = $scholarshipProgram->status === 'active' ? 'paused' : 'active';
            $scholarshipProgram->update([
                'status' => $newStatus,
                'updated_by' => auth()->id()
            ]);

            return response()->json([
                'success' => true,
                'message' => "Program status updated to {$newStatus}",
                'data' => $scholarshipProgram->fresh()
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to toggle program status',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
