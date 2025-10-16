<?php

namespace App\Http\Controllers;

use App\Models\ScholarshipApplication;
use App\Models\Student;
use App\Models\School;
use App\Models\ScholarshipCategory;
use App\Models\ScholarshipSubcategory;
use App\Models\AcademicRecord;
use App\Models\PartnerSchoolRepresentative;
use App\Models\EnrollmentVerification;
use App\Models\InterviewSchedule;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ScholarshipApplicationController extends Controller
{
    /**
     * Display a listing of applications
     */
    public function index(Request $request): JsonResponse
    {
        $query = ScholarshipApplication::with([
            'student.addresses',
            'student.familyMembers',
            'student.academicRecords',
            'student.currentAcademicRecord',
            'student.financialInformation',
            'category',
            'subcategory',
            'school',
            'documents.documentType'
        ]);

        $authUser = $request->get('auth_user');

        // Filter for partner school representatives
        // Partner school reps can only see applications from their assigned school
        if ($authUser && isset($authUser['role']) && $authUser['role'] === 'ps_rep') {
            if (isset($authUser['citizen_id'])) {
                // Look up which school this partner rep represents
                $partnerRep = PartnerSchoolRepresentative::findByCitizenId($authUser['citizen_id']);
                
                if ($partnerRep) {
                    // Filter applications to only show students from their school
                    $query->where('school_id', $partnerRep->school_id);
                    
                    Log::info('Partner school rep filtering applications', [
                        'citizen_id' => $authUser['citizen_id'],
                        'school_id' => $partnerRep->school_id,
                        'school_name' => $partnerRep->school->name ?? 'Unknown'
                    ]);
                } else {
                    // Not registered as a partner rep - return empty result
                    Log::warning('Partner school rep not found in database', [
                        'citizen_id' => $authUser['citizen_id']
                    ]);
                    $query->whereRaw('1 = 0');
                }
            } else {
                // No citizen_id provided - return empty result
                Log::warning('Partner school rep missing citizen_id');
                $query->whereRaw('1 = 0');
            }
        }

        // Scope results: by default, allow admins/staff to view all.
        // Limit to current user's applications only when explicitly requested
        // via `mine=true` or `scope=student`.
        $scopeMine = $request->boolean('mine') || $request->get('scope') === 'student';
        if ($scopeMine && $authUser && isset($authUser['id'])) {
            $userId = $authUser['id'];
            $query->whereHas('student', function($q) use ($userId) {
                $q->where('user_id', $userId);
            });
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('student_id')) {
            $query->where('student_id', $request->student_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('student_id_number', 'like', "%{$search}%");
            });
        }

        $applications = $query->orderBy('created_at', 'desc')
                            ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $applications
        ]);
    }

    /**
     * Store a newly created application
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'student_id' => 'required|exists:students,id',
            'category_id' => 'required|exists:scholarship_categories,id',
            'subcategory_id' => 'required|exists:scholarship_subcategories,id',
            'school_id' => 'required|exists:schools,id',
            'type' => 'required|in:new,renewal',
            'parent_application_id' => 'nullable|string',
            'reason_for_renewal' => 'nullable|string',
            'financial_need_description' => 'required|string',
            'requested_amount' => 'nullable|numeric|min:0',
            'marginalized_groups' => 'nullable|array',
            'digital_wallets' => 'nullable|array',
            'wallet_account_number' => 'nullable|string|max:255',
            'how_did_you_know' => 'nullable|array',
            'is_school_at_caloocan' => 'boolean',
            
            // Academic record data
            'academic_record' => 'required|array',
            'academic_record.educational_level' => 'required|string',
            'academic_record.program' => 'nullable|string|max:255',
            'academic_record.major' => 'nullable|string|max:255',
            'academic_record.track_specialization' => 'nullable|string|max:255',
            'academic_record.area_of_specialization' => 'nullable|string|max:255',
            'academic_record.year_level' => 'required|string|max:255',
            'academic_record.school_year' => 'required|string|max:255',
            'academic_record.school_term' => 'required|string|max:255',
            'academic_record.units_enrolled' => 'nullable|integer|min:0',
            'academic_record.units_completed' => 'nullable|integer|min:0|max:999',
            'academic_record.gpa' => 'nullable|numeric|min:0|max:4',
            'academic_record.general_weighted_average' => 'nullable|numeric|min:0|max:4',
            'academic_record.previous_school' => 'nullable|string|max:255',
            'academic_record.is_graduating' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            // Generate application number
            $applicationNumber = 'APP-' . date('Y') . '-' . str_pad(
                ScholarshipApplication::count() + 1, 
                6, 
                '0', 
                STR_PAD_LEFT
            );

            // Create application
            $applicationData = $request->only([
                'student_id', 'category_id', 'subcategory_id', 'school_id',
                'type', 'parent_application_id', 'reason_for_renewal',
                'financial_need_description', 'requested_amount', 'marginalized_groups',
                'digital_wallets', 'wallet_account_number', 'how_did_you_know',
                'is_school_at_caloocan'
            ]);

            // Get subcategory to set the correct requested amount
            $subcategory = ScholarshipSubcategory::find($request->subcategory_id);
            if ($subcategory && $subcategory->amount) {
                // Always use the subcategory amount to ensure consistency
                $applicationData['requested_amount'] = $subcategory->amount;
                
                Log::info('Setting requested amount from subcategory', [
                    'subcategory_id' => $subcategory->id,
                    'subcategory_name' => $subcategory->name,
                    'amount' => $subcategory->amount,
                    'original_requested_amount' => $request->requested_amount
                ]);
            }

            $applicationData['application_number'] = $applicationNumber;
            $applicationData['status'] = 'draft';

            $application = ScholarshipApplication::create($applicationData);

            // Create or update academic record
            if ($request->has('academic_record')) {
                try {
                    $academicData = $request->academic_record;
                    $academicData['student_id'] = $request->student_id;
                    $academicData['school_id'] = $request->school_id;
                    $academicData['is_current'] = true;

                    Log::info('Creating academic record', [
                        'academic_data' => $academicData,
                        'student_id' => $request->student_id
                    ]);

                    // Mark previous records as not current
                    AcademicRecord::where('student_id', $request->student_id)
                                 ->where('is_current', true)
                                 ->update(['is_current' => false]);

                    $academicRecord = AcademicRecord::create($academicData);
                    Log::info('Academic record created successfully', [
                        'academic_record_id' => $academicRecord->id
                    ]);
                } catch (\Exception $academicError) {
                    Log::error('Failed to create academic record', [
                        'error' => $academicError->getMessage(),
                        'trace' => $academicError->getTraceAsString(),
                        'academic_data' => $request->academic_record ?? 'not provided'
                    ]);
                    throw $academicError;
                }
            }

            DB::commit();

            // Try to eager-load relations, but don't fail the request if it errors
            try {
                $application->load([
                    'student',
                    'category',
                    'subcategory',
                    'school'
                ]);
            } catch (\Throwable $loadError) {
                // Log the load error but continue returning success
                Log::warning('Application load failed after create', [
                    'application_id' => $application->id,
                    'error' => $loadError->getMessage(),
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Application created successfully',
                'data' => $application
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create application', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Display the specified application
     */
    public function show(ScholarshipApplication $application): JsonResponse
    {
        $application->load([
            'student.addresses',
            'student.familyMembers',
            'student.financialInformation',
            'student.emergencyContacts',
            'student.currentAcademicRecord.school',
            'category',
            'subcategory',
            'school',
            'documents.documentType',
            'statusHistory.changedBy'
        ]);

        return response()->json([
            'success' => true,
            'data' => $application
        ]);
    }

    /**
     * Update the specified application
     */
    public function update(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason_for_renewal' => 'nullable|string',
            'financial_need_description' => 'sometimes|required|string',
            'requested_amount' => 'nullable|numeric|min:0',
            'marginalized_groups' => 'nullable|array',
            'digital_wallets' => 'nullable|array',
            'wallet_account_number' => 'nullable|string|max:255',
            'how_did_you_know' => 'nullable|array',
            'is_school_at_caloocan' => 'boolean',
            'notes' => 'nullable|string',
            
            // Academic record validation
            'academic_record' => 'nullable|array',
            'academic_record.educational_level' => 'required_with:academic_record|string',
            'academic_record.program' => 'nullable|string|max:255',
            'academic_record.major' => 'nullable|string|max:255',
            'academic_record.track_specialization' => 'nullable|string|max:255',
            'academic_record.area_of_specialization' => 'nullable|string|max:255',
            'academic_record.year_level' => 'required_with:academic_record|string|max:255',
            'academic_record.school_year' => 'required_with:academic_record|string|max:255',
            'academic_record.school_term' => 'required_with:academic_record|string|max:255',
            'academic_record.units_enrolled' => 'nullable|integer|min:0',
            'academic_record.units_completed' => 'nullable|integer|min:0|max:999',
            'academic_record.gpa' => 'nullable|numeric|min:0|max:4',
            'academic_record.general_weighted_average' => 'nullable|numeric|min:0|max:4',
            'academic_record.previous_school' => 'nullable|string|max:255',
            'academic_record.previous_school_address' => 'nullable|string|max:255',
            'academic_record.is_graduating' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only([
                'reason_for_renewal', 'financial_need_description', 'requested_amount',
                'marginalized_groups', 'digital_wallets', 'wallet_account_number',
                'how_did_you_know', 'is_school_at_qc', 'notes'
            ]);

            // Ensure requested amount matches subcategory amount
            if ($application->subcategory && $application->subcategory->amount) {
                $updateData['requested_amount'] = $application->subcategory->amount;
                
                Log::info('Updating requested amount to match subcategory', [
                    'application_id' => $application->id,
                    'subcategory_id' => $application->subcategory->id,
                    'subcategory_name' => $application->subcategory->name,
                    'amount' => $application->subcategory->amount,
                    'original_requested_amount' => $request->requested_amount
                ]);
            }

            $application->update($updateData);

            // Update academic record if provided
            if ($request->has('academic_record')) {
                try {
                    $academicData = $request->academic_record;
                    $academicData['student_id'] = $application->student_id;
                    $academicData['school_id'] = $application->school_id;
                    $academicData['is_current'] = true;

                    Log::info('Updating academic record', [
                        'academic_data' => $academicData,
                        'student_id' => $application->student_id
                    ]);

                    // Find the current academic record for this student
                    $academicRecord = AcademicRecord::where('student_id', $application->student_id)
                                                   ->where('is_current', true)
                                                   ->first();

                    if ($academicRecord) {
                        $academicRecord->update($academicData);
                        Log::info('Academic record updated successfully', [
                            'academic_record_id' => $academicRecord->id
                        ]);
                    } else {
                        // Create new academic record if none exists
                        $academicRecord = AcademicRecord::create($academicData);
                        Log::info('Academic record created successfully', [
                            'academic_record_id' => $academicRecord->id
                        ]);
                    }
                } catch (\Exception $academicError) {
                    Log::error('Failed to update academic record', [
                        'error' => $academicError->getMessage(),
                        'student_id' => $application->student_id
                    ]);
                }
            }

            $application->load(['student', 'category', 'subcategory', 'school']);

            return response()->json([
                'success' => true,
                'message' => 'Application updated successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit application for review
     */
    public function submit(Request $request, ScholarshipApplication $application): JsonResponse
    {
        if ($application->status !== 'draft') {
            return response()->json([
                'success' => false,
                'message' => 'Application can only be submitted from draft status'
            ], 400);
        }

        try {
            $application->submit();

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve application
     */
    public function approve(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeApproved()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be endorsed to SSC to be approved'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $approvedBy = $authUser['id'] ?? null;
            $application->approve(
                $request->approved_amount,
                $request->notes,
                $approvedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application approved successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject application
     */
    public function reject(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeRejected()) {
            return response()->json([
                'success' => false,
                'message' => 'Application cannot be rejected in its current status: ' . $application->status
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;
            $application->reject(
                $request->rejection_reason,
                $reviewedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application rejected',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Review application
     */
    public function review(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeReviewed()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be submitted for documents to be reviewed'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;
            $application->review(
                $request->notes,
                $reviewedBy
            );

            // Automatic enrollment verification has been removed
            // Applications with status 'approved_pending_verification' will require manual verification

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application reviewed successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to review application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Process application for disbursement
     */
    public function process(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeProcessed()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be approved to be processed'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $processedBy = $authUser['id'] ?? null;
            $application->process(
                $request->notes,
                $processedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Grants processing started successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to process application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Release funds to student
     */
    public function release(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeReleased()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be in grants processing to disburse funds'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $releasedBy = $authUser['id'] ?? null;
            $application->release(
                $request->notes,
                $releasedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Grants disbursed successfully',
                'data' => $application
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to release funds',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove the specified application
     */
    public function destroy(ScholarshipApplication $application): JsonResponse
    {
        if (!$application->canBeDeleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Only draft applications can be deleted'
            ], 400);
        }

        try {
            $application->delete();

            return response()->json([
                'success' => true,
                'message' => 'Application deleted successfully'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function flagForCompliance(Request $request, $id)
    {
        try {
            $application = ScholarshipApplication::findOrFail($id);

            $request->validate([
                'reason' => 'required|string|max:1000'
            ]);

            if (!$application->canBeReviewed()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application must be submitted for documents to be flagged for compliance'
                ], 400);
            }

            try {
                DB::beginTransaction();

                $authUser = $request->get('auth_user');
                $flaggedBy = $authUser['id'] ?? null;
                
                $application->flagForCompliance(
                    $request->reason,
                    $flaggedBy
                );

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Application flagged for compliance successfully',
                    'data' => $application
                ]);

            } catch (\Exception $e) {
                DB::rollBack();
                throw $e;
            }

        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to flag application for compliance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve application for enrollment verification
     * Status: documents_reviewed → approved_pending_verification
     */
    public function approveForVerification(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canBeApprovedForVerification()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be in documents_reviewed status to approve for verification'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $approvedBy = $authUser['id'] ?? null;

            $application->approveForVerification($approvedBy, $request->notes);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application approved for enrollment verification',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve application for verification', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve application for verification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit enrollment verification
     * Status: approved_pending_verification → enrollment_verified
     */
    public function verifyEnrollment(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'enrollment_proof_document_id' => 'required|exists:documents,id',
            'enrollment_year' => 'required|string|max:255',
            'enrollment_term' => 'required|string|max:255',
            'is_currently_enrolled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'approved_pending_verification') {
            return response()->json([
                'success' => false,
                'message' => 'Application must be approved for verification first'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $verifiedBy = $authUser['id'] ?? null;

            // Create enrollment verification
            $verification = EnrollmentVerification::createForApplication($application);
            $verification->update([
                'enrollment_proof_document_id' => $request->enrollment_proof_document_id,
                'enrollment_year' => $request->enrollment_year,
                'enrollment_term' => $request->enrollment_term,
                'is_currently_enrolled' => $request->is_currently_enrolled,
                'verification_status' => 'verified',
                'verified_by' => $verifiedBy,
                'verified_at' => now(),
            ]);

            // Update application status
            $application->confirmEnrollment($verification->id, $verifiedBy);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Enrollment verification completed',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to verify enrollment', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify enrollment',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Schedule interview manually
     * Status: enrollment_verified → interview_scheduled
     */
    public function scheduleInterview(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'interview_date' => 'required|date|after_or_equal:today',
            'interview_time' => 'required|date_format:H:i',
            'interview_location' => 'nullable|string|max:255',
            'interview_type' => 'required|in:in_person,online,phone',
            'meeting_link' => 'nullable|string|max:500',
            'interviewer_id' => 'nullable|integer',
            'staff_id' => 'nullable|integer',
            'interviewer_name' => 'required|string|max:255',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canProceedToInterview()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be enrollment verified to schedule interview'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $scheduledBy = $authUser['id'] ?? null;

            // Check for interviewer conflicts
            if ($request->staff_id) {
                $conflicts = $this->checkInterviewerConflicts(
                    $request->staff_id,
                    $request->interview_date,
                    $request->interview_time,
                    $request->duration ?? 30 // Default 30 minutes if not specified
                );

                if (!empty($conflicts)) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Interviewer has conflicting schedule',
                        'conflicts' => $conflicts
                    ], 409); // 409 Conflict status code
                }
            }

            $interviewData = $request->only([
                'interview_date', 'interview_time', 'interview_location',
                'interview_type', 'meeting_link', 'interviewer_id',
                'staff_id', 'interviewer_name', 'notes'
            ]);
            $interviewData['scheduling_type'] = 'manual';
            $interviewData['scheduled_by'] = $scheduledBy;
            $interviewData['interview_notes'] = $interviewData['notes'] ?? null;
            $interviewData['duration'] = $request->duration ?? 30; // Add duration to interview data
            unset($interviewData['notes']);

            $application->scheduleInterviewManually($interviewData, $scheduledBy);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Interview scheduled successfully',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to schedule interview', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Schedule interview automatically
     * Status: enrollment_verified → interview_scheduled
     */
    public function scheduleInterviewAuto(Request $request, ScholarshipApplication $application): JsonResponse
    {
        if (!$application->canProceedToInterview()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must be enrollment verified to schedule interview'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $scheduledBy = $authUser['id'] ?? null;

            // Get available slots for next 7 days
            $availableSlots = $this->getAvailableSlots(7);
            
            if (empty($availableSlots)) {
                return response()->json([
                    'success' => false,
                    'message' => 'No available interview slots found'
                ], 400);
            }

            // Select first available slot
            $slot = $availableSlots[0];
            
            $interviewData = [
                'interview_date' => $slot['date'],
                'interview_time' => $slot['time'],
                'interview_location' => $slot['location'] ?? 'TBD',
                'interview_type' => $slot['type'] ?? 'in_person',
                'meeting_link' => $slot['meeting_link'] ?? null,
                'interviewer_id' => $slot['interviewer_id'] ?? null,
                'interviewer_name' => $slot['interviewer_name'] ?? 'TBD',
                'scheduling_type' => 'automatic',
                'scheduled_by' => $scheduledBy,
            ];

            $application->scheduleInterviewAutomatically($interviewData);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Interview scheduled automatically',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to auto-schedule interview', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to auto-schedule interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete interview
     * Status: interview_scheduled → interview_completed
     */
    public function completeInterview(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'interview_result' => 'required|in:passed,failed,needs_followup',
            'interview_notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$application->canCompleteInterview()) {
            return response()->json([
                'success' => false,
                'message' => 'Application must have a scheduled interview to complete'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $completedBy = $authUser['id'] ?? null;

            $application->completeInterview(
                $request->interview_result,
                $request->interview_notes,
                $completedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Interview completed successfully',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete interview', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Endorse application to SSC
     * Status: interview_completed → endorsed_to_ssc
     */
    public function endorseToSSC(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'interview_completed') {
            return response()->json([
                'success' => false,
                'message' => 'Application must have completed interview to be endorsed to SSC'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $endorsedBy = $authUser['id'] ?? null;

            $application->endorseToSSC($request->notes, $endorsedBy);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application successfully endorsed to SSC',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to endorse application to SSC', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to endorse application to SSC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk endorse applications to SSC
     * Status: interview_completed → endorsed_to_ssc
     */
    public function bulkEndorseToSSC(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_ids' => 'required|array|min:1',
            'application_ids.*' => 'integer|exists:scholarship_applications,id',
            'filter_type' => 'required|in:recommended,conditional,all',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $endorsedBy = $authUser['id'] ?? null;
            $applicationIds = $request->application_ids;
            $filterType = $request->filter_type;
            $notes = $request->notes ?? 'Bulk endorsed to SSC';

            // Get applications that are ready for endorsement
            $query = ScholarshipApplication::whereIn('id', $applicationIds)
                ->where('status', 'interview_completed')
                ->with(['interviewSchedule.evaluation']);

            // Apply filter based on interview evaluation results
            if ($filterType === 'recommended') {
                $query->whereHas('interviewSchedule.evaluation', function ($q) {
                    $q->where('overall_recommendation', 'recommended');
                });
            } elseif ($filterType === 'conditional') {
                $query->whereHas('interviewSchedule.evaluation', function ($q) {
                    $q->where('overall_recommendation', 'needs_followup');
                });
            }
            // 'all' doesn't add any additional filtering

            $applications = $query->get();

            if ($applications->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No applications found matching the criteria for bulk endorsement'
                ], 400);
            }

            $endorsedCount = 0;
            $failedApplications = [];

            foreach ($applications as $application) {
                try {
                    $application->endorseToSSC($notes, $endorsedBy);
                    $endorsedCount++;
                } catch (\Exception $e) {
                    $failedApplications[] = [
                        'id' => $application->id,
                        'application_number' => $application->application_number,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully endorsed {$endorsedCount} application(s) to SSC",
                'data' => [
                    'endorsed_count' => $endorsedCount,
                    'total_processed' => $applications->count(),
                    'failed_applications' => $failedApplications,
                    'filter_type' => $filterType
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk endorse applications to SSC', [
                'exception' => $e->getMessage(),
                'application_ids' => $request->application_ids,
                'filter_type' => $request->filter_type,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk endorse applications to SSC',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available interview slots for auto-scheduling
     */
    private function getAvailableSlots($days = 7): array
    {
        $slots = [];
        $startDate = now();
        $endDate = now()->addDays($days);

        // Define business hours (9 AM to 5 PM, 30-minute intervals)
        $timeSlots = [];
        for ($hour = 9; $hour < 17; $hour++) {
            for ($minute = 0; $minute < 60; $minute += 30) {
                $timeSlots[] = sprintf('%02d:%02d', $hour, $minute);
            }
        }

        // Get booked slots
        $bookedSlots = InterviewSchedule::whereBetween('interview_date', [$startDate, $endDate])
            ->whereIn('status', ['scheduled', 'rescheduled'])
            ->get()
            ->groupBy(function($schedule) {
                return $schedule->interview_date . ' ' . $schedule->interview_time;
            });

        // Generate available slots
        for ($date = $startDate->copy(); $date->lte($endDate); $date->addDay()) {
            if ($date->isWeekend()) continue; // Skip weekends

            foreach ($timeSlots as $time) {
                $slotKey = $date->format('Y-m-d') . ' ' . $time;
                
                if (!isset($bookedSlots[$slotKey])) {
                    $slots[] = [
                        'date' => $date->format('Y-m-d'),
                        'time' => $time,
                        'location' => 'Main Office',
                        'type' => 'in_person',
                        'interviewer_id' => null,
                        'interviewer_name' => 'Available',
                    ];
                }
            }
        }

        return $slots;
    }

    /**
     * Check for interviewer conflicts
     */
    private function checkInterviewerConflicts($staffId, $date, $time, $duration, $excludeScheduleId = null): array
    {
        if (!$staffId) {
            return []; // No conflicts if no staff assigned
        }

        $startTime = Carbon::parse($date . ' ' . $time);
        $endTime = $startTime->copy()->addMinutes($duration);

        $query = InterviewSchedule::where('staff_id', $staffId)
            ->where('interview_date', $date)
            ->whereIn('status', ['scheduled', 'rescheduled']);

        if ($excludeScheduleId) {
            $query->where('id', '!=', $excludeScheduleId);
        }

        $existingSchedules = $query->get();
        $conflicts = [];

        foreach ($existingSchedules as $schedule) {
            $existingStartTime = Carbon::createFromFormat('Y-m-d H:i:s', $schedule->interview_date->format('Y-m-d') . ' ' . $schedule->interview_time);
            $existingDuration = $schedule->duration ?? 30; // Default 30 minutes
            $existingEndTime = $existingStartTime->copy()->addMinutes($existingDuration);

            // Check if time ranges overlap
            if ($this->timeRangesOverlap($startTime, $endTime, $existingStartTime, $existingEndTime)) {
                $conflicts[] = [
                    'schedule_id' => $schedule->id,
                    'student_name' => $schedule->application->student->first_name . ' ' . $schedule->application->student->last_name,
                    'start_time' => $existingStartTime->format('H:i'),
                    'end_time' => $existingEndTime->format('H:i'),
                    'display_start_time' => $existingStartTime->format('g:i A'),
                    'display_end_time' => $existingEndTime->format('g:i A'),
                    'interview_type' => $schedule->interview_type,
                ];
            }
        }

        return $conflicts;
    }

    /**
     * Check if two time ranges overlap
     */
    private function timeRangesOverlap($start1, $end1, $start2, $end2): bool
    {
        return $start1->lt($end2) && $end1->gt($start2);
    }

    /**
     * Get applications ready for SSC endorsement (completed interviews)
     */
    public function getSscPendingApplications(Request $request): JsonResponse
    {
        try {
            $query = ScholarshipApplication::with([
                'student.addresses',
                'student.academicRecords',
                'student.currentAcademicRecord',
                'category',
                'subcategory',
                'school',
                'documents.documentType',
                'interviewSchedule.evaluation',
                'latestSscDecision'
            ])->where('status', 'interview_completed');

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('school_id')) {
                $query->where('school_id', $request->school_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('student', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('student_id_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('date_from')) {
                $query->where('updated_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('updated_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'updated_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 50);
            $applications = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $applications
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC pending applications', [
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC pending applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SSC approve application
     */
    public function sscApprove(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved_amount' => 'required|numeric|min:0|max:' . ($application->requested_amount ?? 999999),
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'endorsed_to_ssc') {
            return response()->json([
                'success' => false,
                'message' => 'Application must be in endorsed_to_ssc status to be approved by SSC'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $approvedBy = $authUser['id'] ?? null;

            // Update application status
            $application->update([
                'status' => 'approved',
                'approved_amount' => $request->approved_amount,
                'approved_at' => now(),
                'approved_by' => $approvedBy,
                'notes' => $request->notes,
            ]);

            // Create SSC decision record
            $application->sscDecisions()->create([
                'decision' => 'approved',
                'approved_amount' => $request->approved_amount,
                'notes' => $request->notes,
                'decided_by' => $approvedBy,
                'decided_at' => now()
            ]);

            // Add to status history
            $application->statusHistory()->create([
                'status' => 'approved',
                'notes' => 'Application approved by SSC. ' . ($request->notes ?? ''),
                'changed_by' => $approvedBy,
                'changed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application approved successfully',
                'data' => $application->fresh([
                    'student',
                    'category',
                    'subcategory',
                    'school',
                    'latestSscDecision'
                ])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to approve application by SSC', [
                'application_id' => $application->id,
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SSC reject application
     */
    public function sscReject(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'endorsed_to_ssc') {
            return response()->json([
                'success' => false,
                'message' => 'Application must be in endorsed_to_ssc status to be rejected by SSC'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;

            // Update application status
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewedBy,
            ]);

            // Create SSC decision record
            $application->sscDecisions()->create([
                'decision' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'decided_by' => $reviewedBy,
                'decided_at' => now()
            ]);

            // Add to status history
            $application->statusHistory()->create([
                'status' => 'rejected',
                'notes' => 'Application rejected by SSC. Reason: ' . $request->rejection_reason,
                'changed_by' => $reviewedBy,
                'changed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application rejected successfully',
                'data' => $application->fresh([
                    'student',
                    'category',
                    'subcategory',
                    'school',
                    'latestSscDecision'
                ])
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to reject application by SSC', [
                'application_id' => $application->id,
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject application',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SSC bulk approve applications
     */
    public function sscBulkApprove(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_ids' => 'required|array|min:1',
            'application_ids.*' => 'integer|exists:scholarship_applications,id',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $approvedBy = $authUser['id'] ?? null;
            $applicationIds = $request->application_ids;
            $notes = $request->notes ?? 'Bulk approved by SSC';

            // Get applications that are endorsed to SSC
            $applications = ScholarshipApplication::whereIn('id', $applicationIds)
                ->where('status', 'endorsed_to_ssc')
                ->get();

            if ($applications->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No applications found in endorsed_to_ssc status'
                ], 400);
            }

            $approvedCount = 0;
            $failedApplications = [];

            foreach ($applications as $application) {
                try {
                    // Update application status
                    $application->update([
                        'status' => 'approved',
                        'approved_amount' => $application->requested_amount,
                        'approved_at' => now(),
                        'approved_by' => $approvedBy,
                        'notes' => $notes,
                    ]);

                    // Create SSC decision record
                    $application->sscDecisions()->create([
                        'decision' => 'approved',
                        'approved_amount' => $application->requested_amount,
                        'notes' => $notes,
                        'decided_by' => $approvedBy,
                        'decided_at' => now()
                    ]);

                    // Add to status history
                    $application->statusHistory()->create([
                        'status' => 'approved',
                        'notes' => 'Application approved by SSC (bulk operation). ' . $notes,
                        'changed_by' => $approvedBy,
                        'changed_at' => now(),
                    ]);

                    $approvedCount++;
                } catch (\Exception $e) {
                    $failedApplications[] = [
                        'id' => $application->id,
                        'application_number' => $application->application_number,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully approved {$approvedCount} application(s)",
                'data' => [
                    'approved_count' => $approvedCount,
                    'total_processed' => $applications->count(),
                    'failed_applications' => $failedApplications
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk approve applications by SSC', [
                'exception' => $e->getMessage(),
                'application_ids' => $request->application_ids
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk approve applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * SSC bulk reject applications
     */
    public function sscBulkReject(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_ids' => 'required|array|min:1',
            'application_ids.*' => 'integer|exists:scholarship_applications,id',
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewedBy = $authUser['id'] ?? null;
            $applicationIds = $request->application_ids;
            $rejectionReason = $request->rejection_reason;

            // Get applications that are endorsed to SSC
            $applications = ScholarshipApplication::whereIn('id', $applicationIds)
                ->where('status', 'endorsed_to_ssc')
                ->get();

            if ($applications->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'No applications found in endorsed_to_ssc status'
                ], 400);
            }

            $rejectedCount = 0;
            $failedApplications = [];

            foreach ($applications as $application) {
                try {
                    // Update application status
                    $application->update([
                        'status' => 'rejected',
                        'rejection_reason' => $rejectionReason,
                        'reviewed_at' => now(),
                        'reviewed_by' => $reviewedBy,
                    ]);

                    // Create SSC decision record
                    $application->sscDecisions()->create([
                        'decision' => 'rejected',
                        'rejection_reason' => $rejectionReason,
                        'decided_by' => $reviewedBy,
                        'decided_at' => now()
                    ]);

                    // Add to status history
                    $application->statusHistory()->create([
                        'status' => 'rejected',
                        'notes' => 'Application rejected by SSC (bulk operation). Reason: ' . $rejectionReason,
                        'changed_by' => $reviewedBy,
                        'changed_at' => now(),
                    ]);

                    $rejectedCount++;
                } catch (\Exception $e) {
                    $failedApplications[] = [
                        'id' => $application->id,
                        'application_number' => $application->application_number,
                        'error' => $e->getMessage()
                    ];
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => "Successfully rejected {$rejectedCount} application(s)",
                'data' => [
                    'rejected_count' => $rejectedCount,
                    'total_processed' => $applications->count(),
                    'failed_applications' => $failedApplications
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to bulk reject applications by SSC', [
                'exception' => $e->getMessage(),
                'application_ids' => $request->application_ids
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to bulk reject applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SSC statistics
     */
    public function getSscStatistics(Request $request): JsonResponse
    {
        try {
            $totalApplications = ScholarshipApplication::count();
            $pendingReview = ScholarshipApplication::where('status', 'endorsed_to_ssc')->count();
            $approved = ScholarshipApplication::where('status', 'approved')->count();
            $rejected = ScholarshipApplication::where('status', 'rejected')->count();

            // Get decisions this month
            $thisMonth = now()->startOfMonth();
            $thisMonthDecisions = \App\Models\SscDecision::where('decided_at', '>=', $thisMonth)->count();

            // Get average processing time (days from endorsed_to_ssc to decision)
            $avgProcessingTime = \App\Models\SscDecision::selectRaw('AVG(DATEDIFF(decided_at, created_at)) as avg_days')
                ->whereNotNull('decided_at')
                ->value('avg_days');

            return response()->json([
                'success' => true,
                'data' => [
                    'totalApplications' => $totalApplications,
                    'pendingReview' => $pendingReview,
                    'approved' => $approved,
                    'rejected' => $rejected,
                    'thisMonthDecisions' => $thisMonthDecisions,
                    'averageProcessingTime' => round($avgProcessingTime ?? 0, 1)
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC statistics', [
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC statistics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SSC decision history
     */
    public function getSscDecisionHistory(Request $request): JsonResponse
    {
        try {
            $query = \App\Models\SscDecision::with([
                'application.student',
                'application.category',
                'application.subcategory',
                'application.school'
            ]);

            // Apply filters
            if ($request->has('decision')) {
                $query->where('decision', $request->decision);
            }

            if ($request->has('date_from')) {
                $query->where('decided_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('decided_at', '<=', $request->date_to);
            }

            if ($request->has('decided_by')) {
                $query->where('decided_by', $request->decided_by);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'decided_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 50);
            $decisions = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $decisions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC decision history', [
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC decision history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all SSC review decisions from all stages
     */
    public function getAllSscDecisions(Request $request): JsonResponse
    {
        try {
            $query = \App\Models\SscReview::with([
                'application.student',
                'application.category',
                'application.subcategory',
                'application.school'
            ]);

            // Apply filters
            if ($request->has('stage')) {
                $query->where('review_stage', $request->stage);
            }

            if ($request->has('status')) {
                $query->where('status', $request->status);
            }

            if ($request->has('date_from')) {
                $query->where(function($q) use ($request) {
                    $q->where('approved_at', '>=', $request->date_from)
                      ->orWhere('reviewed_at', '>=', $request->date_from)
                      ->orWhere('created_at', '>=', $request->date_from);
                });
            }

            if ($request->has('date_to')) {
                $query->where(function($q) use ($request) {
                    $q->where('approved_at', '<=', $request->date_to)
                      ->orWhere('reviewed_at', '<=', $request->date_to)
                      ->orWhere('created_at', '<=', $request->date_to);
                });
            }

            if ($request->has('reviewed_by')) {
                $query->where('reviewer_id', $request->reviewed_by);
            }

            // Only show approved/rejected reviews (not pending)
            $query->whereIn('status', ['approved', 'rejected']);

            // Sorting
            $sortBy = $request->get('sort_by', 'created_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 50);
            $decisions = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $decisions
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch all SSC decisions', [
                'exception' => $e->getMessage()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch all SSC decisions',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // ===== NEW SSC MULTI-STAGE METHODS =====

    /**
     * Get applications by current SSC stage
     */
    public function getSscApplicationsByStage(Request $request, $stage): JsonResponse
    {
        try {
            $authUser = $request->get('auth_user');
            $userId = $authUser['id'] ?? null;

            // Validate stage
            $validStages = ['document_verification', 'financial_review', 'academic_review', 'final_approval'];
            if (!in_array($stage, $validStages)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid stage provided'
                ], 400);
            }

            // Use parallel workflow - get applications for this stage
            $query = ScholarshipApplication::getApplicationsForStage($stage)
                ->with([
                    'student.addresses',
                    'student.academicRecords',
                    'student.currentAcademicRecord',
                    'student.financialInformation',
                    'category',
                    'subcategory',
                    'school',
                    'documents.documentType',
                    'interviewSchedule.evaluation',
                    'sscReviews' => function($q) {
                        $q->orderBy('created_at', 'desc');
                    },
                    'latestSscDecision'
                ]);

            // Role-based filtering - only show applications user can review
            if ($userId) {
                $userRoles = \App\Models\SscMemberAssignment::getUserRoles($userId)
                    ->pluck('ssc_role')->toArray();
                
                $allowedRoles = \App\Models\SscMemberAssignment::STAGE_ROLE_MAPPING[$stage] ?? [];
                
                // If user doesn't have appropriate role, return empty results
                if (!array_intersect($userRoles, $allowedRoles)) {
                    return response()->json([
                        'success' => true,
                        'data' => [
                            'current_page' => 1,
                            'data' => [],
                            'total' => 0,
                            'per_page' => 15,
                        ]
                    ]);
                }
            }

            // Apply filters
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('school_id')) {
                $query->where('school_id', $request->school_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('student', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('student_id_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('date_from')) {
                $query->where('updated_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('updated_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'updated_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $applications = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $applications
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC applications by stage', [
                'exception' => $e->getMessage(),
                'stage' => $stage,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get my assigned applications (role-based)
     */
    public function getMySscApplications(Request $request): JsonResponse
    {
        try {
            $authUser = $request->get('auth_user');
            $userId = $authUser['id'] ?? null;

            if (!$userId) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            // Get user's assigned roles and stages
            $userAssignments = \App\Models\SscMemberAssignment::getUserRoles($userId);
            
            if ($userAssignments->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'current_page' => 1,
                        'data' => [],
                        'total' => 0,
                        'per_page' => 15,
                    ]
                ]);
            }

            // Get stages user can review
            $userStages = $userAssignments->pluck('review_stage')->unique()->toArray();
            
            // Map stages to statuses
            $stageStatusMapping = [
                'document_verification' => 'ssc_document_verification',
                'financial_review' => 'ssc_financial_review',
                'academic_review' => 'ssc_academic_review',
                'final_approval' => 'ssc_final_approval',
            ];

            $statuses = array_intersect_key($stageStatusMapping, array_flip($userStages));

            $query = ScholarshipApplication::with([
                'student.addresses',
                'student.academicRecords',
                'student.currentAcademicRecord',
                'category',
                'subcategory',
                'school',
                'documents.documentType',
                'interviewSchedule.evaluation',
                'sscReviews' => function($q) {
                    $q->orderBy('created_at', 'desc');
                },
                'latestSscDecision'
            ])->whereIn('status', $statuses);

            // Apply filters (same as above)
            if ($request->has('category_id')) {
                $query->where('category_id', $request->category_id);
            }

            if ($request->has('school_id')) {
                $query->where('school_id', $request->school_id);
            }

            if ($request->has('search')) {
                $search = $request->search;
                $query->whereHas('student', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('student_id_number', 'like', "%{$search}%");
                });
            }

            if ($request->has('date_from')) {
                $query->where('updated_at', '>=', $request->date_from);
            }

            if ($request->has('date_to')) {
                $query->where('updated_at', '<=', $request->date_to);
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'updated_at');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = $request->get('per_page', 15);
            $applications = $query->paginate($perPage);

            return response()->json([
                'success' => true,
                'data' => $applications
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch my SSC applications', [
                'exception' => $e->getMessage(),
                'user_id' => $userId ?? 'unknown',
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch my SSC applications',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit document verification review
     */
    public function sscSubmitDocumentVerification(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'verified' => 'required|boolean',
            'notes' => 'nullable|string|max:1000',
            'document_issues' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For parallel workflow, allow applications in endorsed_to_ssc or ssc_final_approval status
        if (!in_array($application->status, ['endorsed_to_ssc', 'ssc_final_approval'])) {
            return response()->json([
                'success' => false,
                'message' => 'Application is not in SSC review stage'
            ], 400);
        }

        try {
            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;

            if ($request->verified) {
                // Use parallel workflow - approve the document verification stage
                $success = $application->approveStage(
                    'document_verification',
                    $reviewerId,
                    $request->notes,
                    [
                        'document_issues' => $request->document_issues ?? [],
                        'verified_at' => now(),
                    ]
                );

                if ($success) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Document verification stage approved successfully.',
                        'data' => $application->fresh()
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to approve document verification stage'
                    ], 500);
                }
            } else {
                // For parallel workflow, we still mark the stage as not approved but don't change overall status
                // The application remains in SSC review for other stages to continue
                $stageStatus = $application->ssc_stage_status ?? [];
                $stageStatus['document_verification'] = [
                    'status' => 'rejected',
                    'reviewed_by' => $reviewerId,
                    'reviewed_at' => now(),
                    'notes' => $request->notes,
                    'document_issues' => $request->document_issues ?? [],
                ];
                
                $application->update([
                    'ssc_stage_status' => $stageStatus,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Document verification stage marked as needing revision.',
                    'data' => $application->fresh()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to submit document verification', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit document verification',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit financial review
     */
    public function sscSubmitFinancialReview(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'feasible' => 'required|boolean',
            'recommended_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'budget_period' => 'nullable|string|max:255',
            'financial_assessment_score' => 'nullable|integer|min:1|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'ssc_financial_review') {
            return response()->json([
                'success' => false,
                'message' => 'Application is not in financial review stage'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;
            $reviewerRole = $authUser['role'] ?? 'unknown';

            // Create review record
            $review = \App\Models\SscReview::createForApplication(
                $application,
                'financial_review',
                $reviewerId,
                $reviewerRole
            );

            if ($request->feasible) {
                // Approve and advance to next stage
                $review->approve($request->notes, [
                    'recommended_amount' => $request->recommended_amount,
                    'budget_period' => $request->budget_period,
                    'financial_assessment_score' => $request->financial_assessment_score,
                    'reviewed_at' => now(),
                ]);

                $application->advanceToNextSscStage($reviewerId, $request->notes);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Financial review completed. Application advanced to academic review.',
                    'data' => $application->fresh()
                ]);
            } else {
                // Reject
                $review->reject($request->notes, [
                    'recommended_amount' => $request->recommended_amount,
                    'budget_period' => $request->budget_period,
                    'financial_assessment_score' => $request->financial_assessment_score,
                    'rejected_at' => now(),
                ]);

                // Create final decision record
                \App\Models\SscDecision::create([
                    'application_id' => $application->id,
                    'decision' => 'rejected',
                    'rejection_reason' => 'Financial review: ' . $request->notes,
                    'decided_by' => $reviewerId,
                    'decided_at' => now(),
                    'review_stage' => 'financial_review',
                ]);

                $application->update(['status' => 'rejected']);
                $application->statusHistory()->create([
                    'status' => 'rejected',
                    'notes' => 'Rejected at financial review: ' . $request->notes,
                    'changed_by' => $reviewerId,
                    'changed_at' => now(),
                ]);

                DB::commit();

                return response()->json([
                    'success' => true,
                    'message' => 'Application rejected at financial review stage.',
                    'data' => $application->fresh()
                ]);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to submit financial review', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit financial review',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit academic review
     */
    public function sscSubmitAcademicReview(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved' => 'required|boolean',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        // For parallel workflow, allow applications in endorsed_to_ssc or ssc_final_approval status
        if (!in_array($application->status, ['endorsed_to_ssc', 'ssc_final_approval'])) {
            return response()->json([
                'success' => false,
                'message' => 'Application is not in SSC review stage'
            ], 400);
        }

        try {
            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;
            
            Log::info('Academic review attempt', [
                'application_id' => $application->id,
                'auth_user' => $authUser,
                'reviewer_id' => $reviewerId,
                'request_data' => $request->all()
            ]);

            if ($request->approved) {
                // Use parallel workflow - approve the academic review stage
                $success = $application->approveStage(
                    'academic_review',
                    $reviewerId,
                    $request->notes,
                    [
                        'reviewed_at' => now(),
                    ]
                );

                if ($success) {
                    return response()->json([
                        'success' => true,
                        'message' => 'Academic review stage approved successfully.',
                        'data' => $application->fresh()
                    ]);
                } else {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to approve academic review stage'
                    ], 500);
                }
            } else {
                // For parallel workflow, we still mark the stage as not approved but don't change overall status
                // The application remains in SSC review for other stages to continue
                $stageStatus = $application->ssc_stage_status ?? [];
                $stageStatus['academic_review'] = [
                    'status' => 'rejected',
                    'reviewed_by' => $reviewerId,
                    'reviewed_at' => now(),
                    'notes' => $request->notes,
                ];
                
                $application->update([
                    'ssc_stage_status' => $stageStatus,
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Academic review stage marked as needing revision.',
                    'data' => $application->fresh()
                ]);
            }

        } catch (\Exception $e) {
            Log::error('Failed to submit academic review', [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'application_id' => $application->id,
                'request_data' => $request->all(),
                'auth_user' => $request->get('auth_user')
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit academic review',
                'error' => $e->getMessage(),
                'debug' => [
                    'application_id' => $application->id,
                    'error_details' => $e->getMessage()
                ]
            ], 500);
        }
    }

    /**
     * Chairperson final approval
     */
    public function sscFinalApproval(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'approved_amount' => 'required|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'ssc_final_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Application is not in final approval stage'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;
            $reviewerRole = $authUser['role'] ?? 'unknown';

            // Get all previous reviews for summary
            $allReviews = $application->sscReviews()->with('application')->get();
            $reviewsData = $allReviews->map(function($review) {
                return [
                    'stage' => $review->review_stage,
                    'reviewer_role' => $review->reviewer_role,
                    'status' => $review->status,
                    'notes' => $review->review_notes,
                    'data' => $review->review_data,
                    'reviewed_at' => $review->reviewed_at,
                ];
            })->toArray();

            // Create final review record
            $review = \App\Models\SscReview::createForApplication(
                $application,
                'final_approval',
                $reviewerId,
                $reviewerRole
            );

            $review->approve($request->notes, [
                'approved_amount' => $request->approved_amount,
                'reviewed_at' => now(),
            ]);

            // Create final decision record
            \App\Models\SscDecision::create([
                'application_id' => $application->id,
                'decision' => 'approved',
                'approved_amount' => $request->approved_amount,
                'notes' => $request->notes,
                'decided_by' => $reviewerId,
                'decided_at' => now(),
                'review_stage' => 'final_approval',
                'all_reviews_data' => $reviewsData,
            ]);

            // Update application
            $application->update([
                'status' => 'approved',
                'approved_amount' => $request->approved_amount,
                'approved_at' => now(),
                'approved_by' => $reviewerId,
                'notes' => $request->notes,
            ]);

            $application->statusHistory()->create([
                'status' => 'approved',
                'notes' => 'Approved by SSC Chairperson: ' . $request->notes,
                'changed_by' => $reviewerId,
                'changed_at' => now(),
            ]);

            // Auto-register student in Student Registry
            try {
                $studentController = new \App\Http\Controllers\StudentController();
                $studentData = $this->extractStudentDataForRegistration($application);
                $scholarshipData = [
                    'application_number' => $application->application_number,
                    'category_id' => $application->category_id,
                    'subcategory_id' => $application->subcategory_id,
                    'approved_amount' => $request->approved_amount,
                    'approved_at' => now()->toISOString(),
                    'approved_by' => $reviewerId
                ];

                // Create a mock request for the student controller
                $studentRequest = new \Illuminate\Http\Request();
                $studentRequest->merge([
                    'application_id' => $application->id,
                    'student_data' => $studentData,
                    'scholarship_data' => $scholarshipData,
                    'auth_user' => $request->get('auth_user')
                ]);

                $studentResponse = $studentController->registerFromScholarship($studentRequest);
                $studentResult = json_decode($studentResponse->getContent(), true);
                
                if ($studentResult['success']) {
                    Log::info('Student auto-registered successfully', [
                        'application_id' => $application->id,
                        'student_id' => $studentResult['data']['id'] ?? 'unknown'
                    ]);
                } else {
                    Log::warning('Student auto-registration failed', [
                        'application_id' => $application->id,
                        'error' => $studentResult['message'] ?? 'Unknown error'
                    ]);
                }
            } catch (\Exception $e) {
                Log::error('Student auto-registration failed with exception', [
                    'application_id' => $application->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString()
                ]);
                // Don't fail the approval if student registration fails
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application approved successfully.',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to submit final approval', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit final approval',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Chairperson final rejection
     */
    public function sscFinalRejection(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'rejection_reason' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if ($application->status !== 'ssc_final_approval') {
            return response()->json([
                'success' => false,
                'message' => 'Application is not in final approval stage'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;

            // Get all previous reviews for summary
            $allReviews = $application->sscReviews()->with('application')->get();
            $reviewsData = $allReviews->map(function($review) {
                return [
                    'stage' => $review->review_stage,
                    'reviewer_role' => $review->reviewer_role,
                    'status' => $review->status,
                    'notes' => $review->review_notes,
                    'data' => $review->review_data,
                    'reviewed_at' => $review->reviewed_at,
                ];
            })->toArray();

            // Create final review record
            $review = \App\Models\SscReview::createForApplication(
                $application,
                'final_approval',
                $reviewerId,
                'chairperson'
            );

            $review->reject($request->rejection_reason, [
                'rejected_at' => now(),
            ]);

            // Create final decision record
            \App\Models\SscDecision::create([
                'application_id' => $application->id,
                'decision' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'decided_by' => $reviewerId,
                'decided_at' => now(),
                'review_stage' => 'final_approval',
                'all_reviews_data' => $reviewsData,
            ]);

            // Update application
            $application->update([
                'status' => 'rejected',
                'rejection_reason' => $request->rejection_reason,
                'reviewed_at' => now(),
                'reviewed_by' => $reviewerId,
            ]);

            $application->statusHistory()->create([
                'status' => 'rejected',
                'notes' => 'Rejected by SSC Chairperson: ' . $request->rejection_reason,
                'changed_by' => $reviewerId,
                'changed_at' => now(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Application rejected.',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to submit final rejection', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit final rejection',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Request revision at any stage
     */
    public function sscRequestRevision(Request $request, ScholarshipApplication $application): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'stage' => 'required|string|in:document_verification,financial_review,academic_review',
            'notes' => 'required|string|max:1000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $reviewerId = $authUser['id'] ?? null;

            // Create revision request
            $review = \App\Models\SscReview::createForApplication(
                $application,
                $request->stage,
                $reviewerId,
                $authUser['role'] ?? 'unknown'
            );

            $review->requestRevision($request->notes);

            // Send application back to appropriate stage or for_compliance
            if ($request->stage === 'document_verification') {
                $application->update(['status' => 'for_compliance']);
                $application->statusHistory()->create([
                    'status' => 'for_compliance',
                    'notes' => 'Revision requested: ' . $request->notes,
                    'changed_by' => $reviewerId,
                    'changed_at' => now(),
                ]);
            } else {
                // Send back to previous stage
                $stageMapping = [
                    'financial_review' => 'ssc_document_verification',
                    'academic_review' => 'ssc_financial_review',
                ];
                
                $newStatus = $stageMapping[$request->stage] ?? 'for_compliance';
                $application->update(['status' => $newStatus]);
                $application->statusHistory()->create([
                    'status' => $newStatus,
                    'notes' => 'Revision requested: ' . $request->notes,
                    'changed_by' => $reviewerId,
                    'changed_at' => now(),
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Revision requested successfully.',
                'data' => $application->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to request revision', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to request revision',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get review history for application
     */
    public function getSscReviewHistory(Request $request, ScholarshipApplication $application): JsonResponse
    {
        try {
            $reviews = $application->sscReviews()
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $reviews
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC review history', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch review history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current user's SSC roles and permissions
     */
    public function getUserSscRoles(Request $request): JsonResponse
    {
        try {
            $authUser = $request->get('auth_user');
            
            if (!$authUser || !isset($authUser['id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $userId = $authUser['id'];

            // Get user's active SSC role assignments
            $assignments = \App\Models\SscMemberAssignment::where('user_id', $userId)
                ->where('is_active', true)
                ->get();

            if ($assignments->isEmpty()) {
                return response()->json([
                    'success' => true,
                    'data' => [
                        'has_ssc_role' => false,
                        'roles' => [],
                        'stages' => [],
                        'is_chairperson' => false,
                        'permissions' => []
                    ]
                ]);
            }

            // Extract roles and stages
            $roles = $assignments->pluck('ssc_role')->unique()->values()->toArray();
            $stages = $assignments->pluck('review_stage')->unique()->values()->toArray();
            $isChairperson = in_array('chairperson', $roles);

            // Determine permissions based on roles
            $permissions = [];
            foreach ($assignments as $assignment) {
                $permissions[] = [
                    'ssc_role' => $assignment->ssc_role,
                    'review_stage' => $assignment->review_stage,
                    'can_review' => true,
                    'can_approve' => true,
                    'can_reject' => true,
                ];
            }

            // Map role to display labels - Simplified roles
            $roleLabels = [
                'chairperson' => 'SSC Chairperson',
                'city_council' => 'Document Verification Officer',
                'budget_dept' => 'Financial Review Officer',
                'education_affairs' => 'Academic Review Officer',
            ];

            // Map stage to display labels
            $stageLabels = [
                'document_verification' => 'Document Verification',
                'financial_review' => 'Financial Review',
                'academic_review' => 'Academic Review',
                'final_approval' => 'Final Approval',
            ];

            return response()->json([
                'success' => true,
                'data' => [
                    'has_ssc_role' => true,
                    'user_id' => $userId,
                    'roles' => $roles,
                    'stages' => $stages,
                    'is_chairperson' => $isChairperson,
                    'permissions' => $permissions,
                    'role_labels' => array_map(fn($role) => $roleLabels[$role] ?? $role, $roles),
                    'stage_labels' => array_map(fn($stage) => $stageLabels[$stage] ?? $stage, $stages),
                    'assignments' => $assignments->map(function ($assignment) use ($roleLabels, $stageLabels) {
                        return [
                            'id' => $assignment->id,
                            'ssc_role' => $assignment->ssc_role,
                            'role_label' => $roleLabels[$assignment->ssc_role] ?? $assignment->ssc_role,
                            'review_stage' => $assignment->review_stage,
                            'stage_label' => $stageLabels[$assignment->review_stage] ?? $assignment->review_stage,
                            'is_active' => $assignment->is_active,
                            'assigned_at' => $assignment->assigned_at,
                        ];
                    })
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch user SSC roles', [
                'exception' => $e->getMessage(),
                'user_id' => $authUser['id'] ?? null,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC roles',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SSC member assignments
     */
    public function getSscMemberAssignments(Request $request): JsonResponse
    {
        try {
            $assignments = \App\Models\SscMemberAssignment::with([])
                ->orderBy('ssc_role')
                ->orderBy('is_active', 'desc')
                ->get();

            // Transform the data to include user information and review statistics
            $members = $assignments->map(function ($assignment) {
                // Get review count for this member
                $reviewCount = \App\Models\SscReview::where('reviewer_id', $assignment->user_id)
                    ->where('review_stage', $assignment->review_stage)
                    ->count();

                // Get last review date
                $lastReview = \App\Models\SscReview::where('reviewer_id', $assignment->user_id)
                    ->where('review_stage', $assignment->review_stage)
                    ->latest('reviewed_at')
                    ->first();

                // Map role to display label
                $roleLabels = [
                    'chairperson' => 'SSC Chairperson',
                    'budget_dept' => 'Budget Department',
                    'accounting' => 'Accounting Department',
                    'treasurer' => 'City Treasurer',
                    'education_affairs' => 'Education Affairs Unit',
                    'qcydo' => 'Quezon City Youth Development Office',
                    'planning_dept' => 'City Planning and Development Department',
                    'city_council' => 'City Council',
                    'hrd' => 'Human Resource Management Department',
                    'social_services' => 'Social Services Development Department',
                    'schools_division' => 'Schools Division Office',
                    'qcu' => 'Quezon City University',
                ];

                // Map stage to display label
                $stageLabels = [
                    'document_verification' => 'Document Verification',
                    'financial_review' => 'Financial Review',
                    'academic_review' => 'Academic Review',
                    'final_approval' => 'Final Approval',
                ];

                // Mock user data - in production, this would come from auth service
                $userData = $this->getMockUserData($assignment->user_id);

                return [
                    'id' => $assignment->id,
                    'user_id' => $assignment->user_id,
                    'user_name' => $userData['name'],
                    'user_email' => $userData['email'],
                    'ssc_role' => $assignment->ssc_role,
                    'role_label' => $roleLabels[$assignment->ssc_role] ?? $assignment->ssc_role,
                    'review_stage' => $assignment->review_stage,
                    'stage_label' => $stageLabels[$assignment->review_stage] ?? $assignment->review_stage,
                    'is_active' => $assignment->is_active,
                    'assigned_at' => $assignment->assigned_at,
                    'review_count' => $reviewCount,
                    'last_review' => $lastReview ? $lastReview->reviewed_at : null,
                ];
            });

            return response()->json([
                'success' => true,
                'data' => $members
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to fetch SSC member assignments', [
                'exception' => $e->getMessage(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SSC member assignments',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mock user data - in production, this would be fetched from auth service
     */
    private function getMockUserData($userId): array
    {
        $mockUsers = [
            1 => ['name' => 'Hon. Dale Gonzalo C. Malapitan', 'email' => 'mayor@caloocan.gov.ph'],
            2 => ['name' => 'Hon. Maria Luisa C. Santos', 'email' => 'council.education@caloocan.gov.ph'],
            3 => ['name' => 'Atty. Roberto M. Cruz', 'email' => 'hrd@caloocan.gov.ph'],
            4 => ['name' => 'Dr. Ana Maria L. Reyes', 'email' => 'social.services@caloocan.gov.ph'],
            5 => ['name' => 'Engr. Carlos P. Mendoza', 'email' => 'budget@caloocan.gov.ph'],
            6 => ['name' => 'CPA Maria Elena S. Torres', 'email' => 'accounting@caloocan.gov.ph'],
            7 => ['name' => 'CPA Juan Carlos D. Villanueva', 'email' => 'treasurer@caloocan.gov.ph'],
            8 => ['name' => 'Dr. Patricia A. Dela Cruz', 'email' => 'education.affairs@caloocan.gov.ph'],
            9 => ['name' => 'Ms. Jennifer L. Morales', 'email' => 'qcydo@caloocan.gov.ph'],
            10 => ['name' => 'Arch. Miguel R. Santiago', 'email' => 'planning@caloocan.gov.ph'],
            11 => ['name' => 'Dr. Rosario M. Bautista', 'email' => 'schools.division@caloocan.gov.ph'],
            12 => ['name' => 'Dr. Francisco J. Aguilar', 'email' => 'qcu@caloocan.gov.ph'],
            13 => ['name' => 'Hon. Ricardo T. Gutierrez', 'email' => 'council.education.alt@caloocan.gov.ph'],
            14 => ['name' => 'Ms. Lourdes C. Fernandez', 'email' => 'budget.alt@caloocan.gov.ph'],
            15 => ['name' => 'Dr. Antonio M. Rodriguez', 'email' => 'education.affairs.alt@caloocan.gov.ph'],
        ];

        return $mockUsers[$userId] ?? ['name' => 'Unknown User', 'email' => 'unknown@caloocan.gov.ph'];
    }

    /**
     * Approve a specific stage (parallel workflow)
     */
    public function approveStage(Request $request, ScholarshipApplication $application): JsonResponse
    {
        try {
            $authUser = $request->get('auth_user');
            
            if (!$authUser || !isset($authUser['id'])) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authenticated'
                ], 401);
            }

            $userId = $authUser['id'];
            $stage = $request->input('stage');
            $notes = $request->input('notes');
            $reviewData = $request->input('review_data', []);

            // Validate stage
            $validStages = ['document_verification', 'financial_review', 'academic_review'];
            if (!in_array($stage, $validStages)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid stage'
                ], 400);
            }

            // Check if user has permission for this stage
            $userAssignment = \App\Models\SscMemberAssignment::where('user_id', $userId)
                ->where('review_stage', $stage)
                ->where('is_active', true)
                ->first();

            if (!$userAssignment) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not authorized for this stage'
                ], 403);
            }

            // Approve the stage
            $success = $application->approveStage($stage, $userId, $notes, $reviewData);

            if ($success) {
                return response()->json([
                    'success' => true,
                    'message' => "Stage {$stage} approved successfully",
                    'data' => $application->fresh()
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to approve stage'
                ], 500);
            }

        } catch (\Exception $e) {
            Log::error('Failed to approve stage', [
                'exception' => $e->getMessage(),
                'application_id' => $application->id,
                'stage' => $request->input('stage'),
                'user_id' => $authUser['id'] ?? null,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve stage',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Extract student data for registration from application
     */
    private function extractStudentDataForRegistration($application)
    {
        $student = $application->student;
        $school = $application->school;
        
        return [
            'first_name' => $student->first_name,
            'middle_name' => $student->middle_name,
            'last_name' => $student->last_name,
            'email' => $student->email_address,
            'contact_number' => $student->contact_number,
            'citizen_id' => $student->citizen_id,
            'current_school_id' => $school->id ?? $application->school_id,
            'year_level' => $student->year_level ?? '',
            'program' => $student->program ?? '',
            'enrollment_date' => now()->toISOString(),
            'academic_status' => 'enrolled',
            'gpa' => $student->gpa ?? 0,
        ];
    }
}
