<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ScholarshipApplication extends Model
{
    use HasFactory;

    protected $fillable = [
        'application_number',
        'student_id',
        'category_id',
        'subcategory_id',
        'school_id',
        'type',
        'parent_application_id',
        'status',
        'reason_for_renewal',
        'financial_need_description',
        'requested_amount',
        'approved_amount',
        'rejection_reason',
        'notes',
        'marginalized_groups',
        'digital_wallets',
        'wallet_account_number',
        'how_did_you_know',
        'is_school_at_caloocan',
        'submitted_at',
        'reviewed_at',
        'approved_at',
        'reviewed_by',
        'approved_by',
        'enrollment_verification_id',
        'interview_schedule_id',
        'enrollment_verified_at',
        'interview_completed_at',
    ];

    protected $casts = [
        'marginalized_groups' => 'array',
        'digital_wallets' => 'array',
        'how_did_you_know' => 'array',
        'is_school_at_caloocan' => 'boolean',
        'requested_amount' => 'decimal:2',
        'approved_amount' => 'decimal:2',
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'approved_at' => 'datetime',
        'enrollment_verified_at' => 'datetime',
        'interview_completed_at' => 'datetime',
    ];

    // Relationships
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ScholarshipCategory::class, 'category_id');
    }

    public function subcategory(): BelongsTo
    {
        return $this->belongsTo(ScholarshipSubcategory::class, 'subcategory_id');
    }

    public function school(): BelongsTo
    {
        return $this->belongsTo(School::class);
    }

    public function parentApplication(): BelongsTo
    {
        return $this->belongsTo(ScholarshipApplication::class, 'parent_application_id', 'application_number');
    }

    public function renewalApplications(): HasMany
    {
        return $this->hasMany(ScholarshipApplication::class, 'parent_application_id', 'application_number');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'application_id');
    }

    public function statusHistory(): HasMany
    {
        return $this->hasMany(ApplicationStatusHistory::class, 'application_id');
    }

    public function scholarshipAward(): HasOne
    {
        return $this->hasOne(ScholarshipAward::class);
    }

    public function enrollmentVerification(): HasOne
    {
        return $this->hasOne(EnrollmentVerification::class);
    }

    public function interviewSchedule(): HasOne
    {
        return $this->hasOne(InterviewSchedule::class);
    }

    // Scopes
    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeSubmitted($query)
    {
        return $query->where('status', 'submitted');
    }

    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }

    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    public function scopeDraft($query)
    {
        return $query->where('status', 'draft');
    }

    public function scopeNewApplications($query)
    {
        return $query->where('type', 'new');
    }

    public function scopeRenewalApplications($query)
    {
        return $query->where('type', 'renewal');
    }

    // Methods
    public function canBeSubmitted(): bool
    {
        return $this->status === 'draft';
    }

    public function canBeApproved(): bool
    {
        return $this->status === 'endorsed_to_ssc';
    }

    public function canBeRejected(): bool
    {
        return in_array($this->status, [
            'submitted', 
            'documents_reviewed', 
            'interview_scheduled', 
            'interview_completed',
            'endorsed_to_ssc', 
            'for_compliance', 
            'compliance_documents_submitted',
            'on_hold',
            'grants_processing'
        ]);
    }

    public function canBeDeleted(): bool
    {
        return $this->status === 'draft';
    }

    public function submit(): bool
    {
        if (!$this->canBeSubmitted()) {
            return false;
        }

        $this->update([
            'status' => 'submitted',
            'submitted_at' => now(),
        ]);

        $this->statusHistory()->create([
            'status' => 'submitted',
            'notes' => 'Application submitted for review',
            'changed_by' => auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function approve($approvedAmount, $notes = null, $approvedBy = null): bool
    {
        if (!$this->canBeApproved()) {
            return false;
        }

        $this->update([
            'status' => 'approved',
            'approved_amount' => $approvedAmount,
            'approved_at' => now(),
            'approved_by' => $approvedBy ?? auth()->id(),
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'approved',
            'notes' => $notes ?? 'Application approved',
            'changed_by' => $approvedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function reject($rejectionReason, $reviewedBy = null): bool
    {
        if (!$this->canBeRejected()) {
            return false;
        }

        $this->update([
            'status' => 'rejected',
            'rejection_reason' => $rejectionReason,
            'reviewed_at' => now(),
            'reviewed_by' => $reviewedBy ?? auth()->id(),
        ]);

        $this->statusHistory()->create([
            'status' => 'rejected',
            'notes' => $rejectionReason,
            'changed_by' => $reviewedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function canBeReviewed(): bool
    {
        return $this->status === 'submitted';
    }

    public function canBeProcessed(): bool
    {
        return $this->status === 'approved';
    }

    public function canBeReleased(): bool
    {
        return $this->status === 'grants_processing';
    }

    public function reviewDocuments($notes = null, $reviewedBy = null): bool
    {
        if (!$this->canBeReviewed()) {
            return false;
        }

        $this->update([
            'status' => 'documents_reviewed',
            'reviewed_at' => now(),
            'reviewed_by' => $reviewedBy ?? auth()->id(),
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'documents_reviewed',
            'notes' => $notes ?? 'Documents reviewed and approved - ready for interview scheduling',
            'changed_by' => $reviewedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function scheduleInterview($notes = null, $scheduledBy = null): bool
    {
        if ($this->status !== 'documents_reviewed') {
            return false;
        }

        $this->update([
            'status' => 'interview_scheduled',
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'interview_scheduled',
            'notes' => $notes ?? 'Interview scheduled',
            'changed_by' => $scheduledBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function endorseToSSC($notes = null, $endorsedBy = null): bool
    {
        if ($this->status !== 'interview_completed') {
            return false;
        }

        $this->update([
            'status' => 'endorsed_to_ssc',
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'endorsed_to_ssc',
            'notes' => $notes ?? 'Application endorsed to SSC for final approval',
            'changed_by' => $endorsedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function processGrants($notes = null, $processedBy = null): bool
    {
        if (!$this->canBeProcessed()) {
            return false;
        }

        $this->update([
            'status' => 'grants_processing',
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'grants_processing',
            'notes' => $notes ?? 'Application approved, processing grant disbursement',
            'changed_by' => $processedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function disburseGrants($notes = null, $disbursedBy = null): bool
    {
        if (!$this->canBeReleased()) {
            return false;
        }

        $this->update([
            'status' => 'grants_disbursed',
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'grants_disbursed',
            'notes' => $notes ?? 'Grants disbursed to student',
            'changed_by' => $disbursedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function flagForCompliance($reason, $flaggedBy = null): bool
    {
        $this->update([
            'status' => 'for_compliance',
            'notes' => $reason,
        ]);

        $this->statusHistory()->create([
            'status' => 'for_compliance',
            'notes' => $reason,
            'changed_by' => $flaggedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    public function submitComplianceDocuments($notes = null, $submittedBy = null): bool
    {
        if ($this->status !== 'for_compliance') {
            return false;
        }

        $this->update([
            'status' => 'compliance_documents_submitted',
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'compliance_documents_submitted',
            'notes' => $notes ?? 'Compliance documents submitted',
            'changed_by' => $submittedBy ?? auth()->id(),
            'changed_at' => now(),
        ]);

        return true;
    }

    // Legacy method aliases for backward compatibility
    public function review($notes = null, $reviewedBy = null): bool
    {
        return $this->reviewDocuments($notes, $reviewedBy);
    }

    public function process($notes = null, $processedBy = null): bool
    {
        return $this->processGrants($notes, $processedBy);
    }

    public function release($notes = null, $releasedBy = null): bool
    {
        return $this->disburseGrants($notes, $releasedBy);
    }

    // New workflow methods for enrollment verification and interview scheduling

    /**
     * Approve application for enrollment verification
     * Status: documents_reviewed → approved_pending_verification
     */
    public function approveForVerification($approvedBy, $notes = null): bool
    {
        if ($this->status !== 'documents_reviewed') {
            return false;
        }

        $this->update([
            'status' => 'approved_pending_verification',
            'reviewed_at' => now(),
            'reviewed_by' => $approvedBy,
            'notes' => $notes,
        ]);

        $this->statusHistory()->create([
            'status' => 'approved_pending_verification',
            'notes' => $notes ?? 'Application approved for enrollment verification',
            'changed_by' => $approvedBy,
            'changed_at' => now(),
        ]);

        return true;
    }

    /**
     * Confirm enrollment verification
     * Status: approved_pending_verification → enrollment_verified
     */
    public function confirmEnrollment($verificationId, $confirmedBy): bool
    {
        if ($this->status !== 'approved_pending_verification') {
            return false;
        }

        $this->update([
            'status' => 'enrollment_verified',
            'enrollment_verification_id' => $verificationId,
            'enrollment_verified_at' => now(),
        ]);

        $this->statusHistory()->create([
            'status' => 'enrollment_verified',
            'notes' => 'Enrollment verification completed',
            'changed_by' => $confirmedBy,
            'changed_at' => now(),
        ]);

        return true;
    }

    /**
     * Schedule interview automatically
     * Status: enrollment_verified → interview_scheduled
     */
    public function scheduleInterviewAutomatically($interviewData): bool
    {
        if ($this->status !== 'enrollment_verified') {
            return false;
        }

        $interview = InterviewSchedule::createForApplication($this, $interviewData);
        
        $this->update([
            'status' => 'interview_scheduled',
            'interview_schedule_id' => $interview->id,
        ]);

        $this->statusHistory()->create([
            'status' => 'interview_scheduled',
            'notes' => 'Interview scheduled automatically',
            'changed_by' => $interviewData['scheduled_by'],
            'changed_at' => now(),
        ]);

        return true;
    }

    /**
     * Schedule interview manually
     * Status: documents_reviewed → interview_scheduled
     */
    public function scheduleInterviewManually($interviewData, $scheduledBy): bool
    {
        if ($this->status !== 'documents_reviewed') {
            return false;
        }

        $interview = InterviewSchedule::createForApplication($this, $interviewData);
        
        $this->update([
            'status' => 'interview_scheduled',
            'interview_schedule_id' => $interview->id,
        ]);

        $this->statusHistory()->create([
            'status' => 'interview_scheduled',
            'notes' => 'Interview scheduled manually',
            'changed_by' => $scheduledBy,
            'changed_at' => now(),
        ]);

        return true;
    }

    /**
     * Complete interview
     * Status: interview_scheduled → interview_completed
     */
    public function completeInterview($result, $notes, $completedBy): bool
    {
        if ($this->status !== 'interview_scheduled') {
            return false;
        }

        $this->update([
            'status' => 'interview_completed',
            'interview_completed_at' => now(),
        ]);

        $this->statusHistory()->create([
            'status' => 'interview_completed',
            'notes' => $notes ?? 'Interview completed',
            'changed_by' => $completedBy,
            'changed_at' => now(),
        ]);

        return true;
    }

    /**
     * Check if application can be approved for verification
     */
    public function canBeApprovedForVerification(): bool
    {
        return $this->status === 'documents_reviewed';
    }

    /**
     * Check if application can proceed to interview
     */
    public function canProceedToInterview(): bool
    {
        return $this->status === 'documents_reviewed';
    }

    /**
     * Check if application can complete interview
     */
    public function canCompleteInterview(): bool
    {
        return $this->status === 'interview_scheduled';
    }
}
