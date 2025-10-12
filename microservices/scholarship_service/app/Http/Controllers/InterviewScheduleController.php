<?php

namespace App\Http\Controllers;

use App\Models\InterviewSchedule;
use App\Models\ScholarshipApplication;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class InterviewScheduleController extends Controller
{
    /**
     * Display a listing of interview schedules
     */
    public function index(Request $request): JsonResponse
    {
        $query = InterviewSchedule::with([
            'application.student',
            'application.category',
            'application.subcategory',
            'student'
        ]);

        $authUser = $request->get('auth_user');

        // Filter for partner school representatives
        if ($authUser && isset($authUser['role']) && $authUser['role'] === 'ps_rep') {
            if (isset($authUser['citizen_id'])) {
                $partnerRep = \App\Models\PartnerSchoolRepresentative::findByCitizenId($authUser['citizen_id']);
                
                if ($partnerRep) {
                    $query->whereHas('application', function($q) use ($partnerRep) {
                        $q->where('school_id', $partnerRep->school_id);
                    });
                } else {
                    $query->whereRaw('1 = 0');
                }
            } else {
                $query->whereRaw('1 = 0');
            }
        }

        // Apply filters
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('interviewer_id')) {
            $query->where('interviewer_id', $request->interviewer_id);
        }

        if ($request->has('date_from')) {
            $query->where('interview_date', '>=', $request->date_from);
        }

        if ($request->has('date_to')) {
            $query->where('interview_date', '<=', $request->date_to);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->whereHas('student', function($q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                  ->orWhere('last_name', 'like', "%{$search}%")
                  ->orWhere('student_id_number', 'like', "%{$search}%");
            });
        }

        $schedules = $query->orderBy('interview_date', 'asc')
                          ->orderBy('interview_time', 'asc')
                          ->paginate($request->get('per_page', 15));

        return response()->json([
            'success' => true,
            'data' => $schedules
        ]);
    }

    /**
     * Display the specified interview schedule
     */
    public function show(InterviewSchedule $schedule): JsonResponse
    {
        $schedule->load([
            'application.student.addresses',
            'application.student.familyMembers',
            'application.student.academicRecords',
            'application.student.currentAcademicRecord',
            'application.student.financialInformation',
            'application.category',
            'application.subcategory',
            'student'
        ]);

        return response()->json([
            'success' => true,
            'data' => $schedule
        ]);
    }

    /**
     * Store a newly created interview schedule
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_id' => 'required|exists:scholarship_applications,id',
            'interview_date' => 'required|date|after_or_equal:today',
            'interview_time' => 'required|date_format:H:i',
            'interview_location' => 'nullable|string|max:255',
            'interview_type' => 'required|in:in_person,online,phone',
            'meeting_link' => 'nullable|string|max:500',
            'interviewer_id' => 'nullable|integer',
            'interviewer_name' => 'required|string|max:255',
            'scheduling_type' => 'required|in:automatic,manual',
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

            $application = ScholarshipApplication::findOrFail($request->application_id);

            if (!$application->canProceedToInterview()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Application must have documents reviewed to schedule interview'
                ], 400);
            }

            $authUser = $request->get('auth_user');
            $scheduledBy = $authUser['id'] ?? null;

            $interviewData = $request->only([
                'interview_date', 'interview_time', 'interview_location',
                'interview_type', 'meeting_link', 'interviewer_id',
                'interviewer_name', 'scheduling_type'
            ]);
            $interviewData['scheduled_by'] = $scheduledBy;

            $schedule = InterviewSchedule::createForApplication($application, $interviewData);

            // Update application status
            $application->scheduleInterviewManually($interviewData, $scheduledBy);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Interview scheduled successfully',
                'data' => $schedule
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to create interview schedule', [
                'exception' => $e->getMessage(),
                'payload' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to schedule interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reschedule an interview
     */
    public function reschedule(Request $request, InterviewSchedule $schedule): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'interview_date' => 'required|date|after_or_equal:today',
            'interview_time' => 'required|date_format:H:i',
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$schedule->canBeRescheduled()) {
            return response()->json([
                'success' => false,
                'message' => 'Interview cannot be rescheduled in current status'
            ], 400);
        }

        try {
            $authUser = $request->get('auth_user');
            $rescheduledBy = $authUser['id'] ?? null;

            $schedule->reschedule(
                $request->interview_date,
                $request->interview_time,
                $request->reason,
                $rescheduledBy
            );

            return response()->json([
                'success' => true,
                'message' => 'Interview rescheduled successfully',
                'data' => $schedule->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to reschedule interview', [
                'exception' => $e->getMessage(),
                'schedule_id' => $schedule->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to reschedule interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Complete an interview
     */
    public function complete(Request $request, InterviewSchedule $schedule): JsonResponse
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

        if (!$schedule->canBeCompleted()) {
            return response()->json([
                'success' => false,
                'message' => 'Interview cannot be completed in current status'
            ], 400);
        }

        try {
            DB::beginTransaction();

            $authUser = $request->get('auth_user');
            $completedBy = $authUser['id'] ?? null;

            $schedule->markAsCompleted(
                $request->interview_result,
                $request->interview_notes,
                $completedBy
            );

            // Update application status
            $schedule->application->completeInterview(
                $request->interview_result,
                $request->interview_notes,
                $completedBy
            );

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Interview completed successfully',
                'data' => $schedule->fresh()
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Failed to complete interview', [
                'exception' => $e->getMessage(),
                'schedule_id' => $schedule->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to complete interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel an interview
     */
    public function cancel(Request $request, InterviewSchedule $schedule): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'reason' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$schedule->canBeCancelled()) {
            return response()->json([
                'success' => false,
                'message' => 'Interview cannot be cancelled in current status'
            ], 400);
        }

        try {
            $authUser = $request->get('auth_user');
            $cancelledBy = $authUser['id'] ?? null;

            $schedule->cancel($request->reason, $cancelledBy);

            return response()->json([
                'success' => true,
                'message' => 'Interview cancelled successfully',
                'data' => $schedule->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to cancel interview', [
                'exception' => $e->getMessage(),
                'schedule_id' => $schedule->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel interview',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Mark interview as no show
     */
    public function markNoShow(Request $request, InterviewSchedule $schedule): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'notes' => 'required|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        if (!$schedule->canBeMarkedAsNoShow()) {
            return response()->json([
                'success' => false,
                'message' => 'Interview cannot be marked as no show in current status'
            ], 400);
        }

        try {
            $authUser = $request->get('auth_user');
            $markedBy = $authUser['id'] ?? null;

            $schedule->markAsNoShow($request->notes, $markedBy);

            return response()->json([
                'success' => true,
                'message' => 'Interview marked as no show',
                'data' => $schedule->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to mark interview as no show', [
                'exception' => $e->getMessage(),
                'schedule_id' => $schedule->id,
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to mark interview as no show',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get available interview slots
     */
    public function availableSlots(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'date' => 'required|date|after_or_equal:today',
            'interview_type' => 'required|in:in_person,online,phone',
            'interviewer_id' => 'nullable|integer',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $date = $request->date;
            $interviewType = $request->interview_type;
            $interviewerId = $request->interviewer_id;

            // Define available time slots (9 AM to 5 PM, 30-minute intervals)
            $timeSlots = [];
            $startTime = Carbon::parse($date . ' 09:00');
            $endTime = Carbon::parse($date . ' 17:00');

            while ($startTime->lt($endTime)) {
                $timeSlots[] = $startTime->format('H:i');
                $startTime->addMinutes(30);
            }

            // Get booked slots
            $bookedSlots = InterviewSchedule::where('interview_date', $date)
                ->where('interview_type', $interviewType)
                ->when($interviewerId, function($query) use ($interviewerId) {
                    return $query->where('interviewer_id', $interviewerId);
                })
                ->whereIn('status', ['scheduled', 'rescheduled'])
                ->pluck('interview_time')
                ->map(function($time) {
                    return Carbon::parse($time)->format('H:i');
                })
                ->toArray();

            // Filter available slots
            $availableSlots = array_diff($timeSlots, $bookedSlots);

            return response()->json([
                'success' => true,
                'data' => [
                    'date' => $date,
                    'interview_type' => $interviewType,
                    'available_slots' => array_values($availableSlots),
                    'booked_slots' => $bookedSlots,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get available slots', [
                'exception' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get available slots',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get calendar view of interviews
     */
    public function calendar(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'month' => 'required|date_format:Y-m',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $month = $request->month;
            $startDate = Carbon::parse($month . '-01')->startOfMonth();
            $endDate = $startDate->copy()->endOfMonth();

            $interviews = InterviewSchedule::whereBetween('interview_date', [$startDate, $endDate])
                ->with(['student', 'application'])
                ->orderBy('interview_date')
                ->orderBy('interview_time')
                ->get()
                ->groupBy(function($interview) {
                    return Carbon::parse($interview->interview_date)->format('Y-m-d');
                });

            return response()->json([
                'success' => true,
                'data' => [
                    'month' => $month,
                    'interviews' => $interviews,
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to get calendar data', [
                'exception' => $e->getMessage(),
                'request' => $request->all(),
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to get calendar data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}






