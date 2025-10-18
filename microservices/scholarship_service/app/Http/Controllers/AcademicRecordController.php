<?php

namespace App\Http\Controllers;

use App\Models\AcademicRecord;
use Illuminate\Http\Request;

class AcademicRecordController extends Controller
{
    /**
     * Display a listing of academic records.
     */
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
            
            if ($request->has('educational_level')) {
                $query->where('educational_level', $request->educational_level);
            }
            
            // Sorting
            $sortBy = $request->input('sort_by', 'created_at');
            $sortOrder = $request->input('order', 'desc');
            $query->orderBy($sortBy, $sortOrder);
            
            // Pagination
            $perPage = $request->input('per_page', 15);
            $records = $query->paginate($perPage);
            
            return response()->json([
                'success' => true,
                'data' => $records
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch academic records: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch academic records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Display the specified academic record.
     */
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
                'message' => 'Academic record not found',
                'error' => $e->getMessage()
            ], 404);
        }
    }
    
    /**
     * Store a newly created academic record.
     */
    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'student_id' => 'required|exists:students,id',
                'school_id' => 'required|exists:schools,id',
                'educational_level' => 'required|in:ELEMENTARY,HIGH SCHOOL,SENIOR HIGH SCHOOL,TERTIARY/COLLEGE,GRADUATE SCHOOL',
                'program' => 'nullable|string|max:255',
                'major' => 'nullable|string|max:255',
                'track_specialization' => 'nullable|string|max:255',
                'area_of_specialization' => 'nullable|string|max:255',
                'year_level' => 'required|string|max:50',
                'school_year' => 'required|string|max:50',
                'school_term' => 'required|string|max:50',
                'units_enrolled' => 'nullable|integer',
                'units_completed' => 'nullable|integer',
                'gpa' => 'nullable|numeric|between:0,5',
                'general_weighted_average' => 'nullable|numeric|between:0,100',
                'previous_school' => 'nullable|string|max:255',
                'is_current' => 'boolean',
                'is_graduating' => 'boolean',
                'enrollment_date' => 'nullable|date',
                'graduation_date' => 'nullable|date',
            ]);
            
            $record = AcademicRecord::create($validated);
            
            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Academic record created successfully'
            ], 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to create academic record: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create academic record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Update the specified academic record.
     */
    public function update(Request $request, $id)
    {
        try {
            $record = AcademicRecord::findOrFail($id);
            
            $validated = $request->validate([
                'student_id' => 'sometimes|exists:students,id',
                'school_id' => 'sometimes|exists:schools,id',
                'educational_level' => 'sometimes|in:ELEMENTARY,HIGH SCHOOL,SENIOR HIGH SCHOOL,TERTIARY/COLLEGE,GRADUATE SCHOOL',
                'program' => 'nullable|string|max:255',
                'major' => 'nullable|string|max:255',
                'track_specialization' => 'nullable|string|max:255',
                'area_of_specialization' => 'nullable|string|max:255',
                'year_level' => 'sometimes|string|max:50',
                'school_year' => 'sometimes|string|max:50',
                'school_term' => 'sometimes|string|max:50',
                'units_enrolled' => 'nullable|integer',
                'units_completed' => 'nullable|integer',
                'gpa' => 'nullable|numeric|between:0,5',
                'general_weighted_average' => 'nullable|numeric|between:0,100',
                'previous_school' => 'nullable|string|max:255',
                'is_current' => 'boolean',
                'is_graduating' => 'boolean',
                'enrollment_date' => 'nullable|date',
                'graduation_date' => 'nullable|date',
            ]);
            
            $record->update($validated);
            
            return response()->json([
                'success' => true,
                'data' => $record,
                'message' => 'Academic record updated successfully'
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            \Log::error('Failed to update academic record: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to update academic record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Remove the specified academic record.
     */
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
            \Log::error('Failed to delete academic record: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete academic record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get academic records for a specific student.
     */
    public function getByStudent($studentId)
    {
        try {
            $records = AcademicRecord::with('school')
                ->where('student_id', $studentId)
                ->orderBy('is_current', 'desc')
                ->orderBy('school_year', 'desc')
                ->get();
            
            return response()->json([
                'success' => true,
                'data' => $records
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student academic records',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    
    /**
     * Get current academic record for a student.
     */
    public function getCurrentRecord($studentId)
    {
        try {
            $record = AcademicRecord::with('school')
                ->where('student_id', $studentId)
                ->where('is_current', true)
                ->first();
            
            if (!$record) {
                return response()->json([
                    'success' => false,
                    'message' => 'No current academic record found for this student'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => $record
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch current academic record',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

