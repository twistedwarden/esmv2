<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SscMemberAssignment extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'ssc_role',
        'review_stage',
        'is_active',
        'assigned_at'
    ];

    protected $casts = [
        'assigned_at' => 'datetime',
        'is_active' => 'boolean',
    ];

    // Scopes
    public function scopeByRole($query, $role)
    {
        return $query->where('ssc_role', $role);
    }

    public function scopeByStage($query, $stage)
    {
        return $query->where('review_stage', $stage);
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeInactive($query)
    {
        return $query->where('is_active', false);
    }

    public function scopeByUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    // Methods
    public function activate(): bool
    {
        $this->update(['is_active' => true]);
        return true;
    }

    public function deactivate(): bool
    {
        $this->update(['is_active' => false]);
        return true;
    }

    public function isActive(): bool
    {
        return $this->is_active;
    }

    // Static methods
    public static function assignMember(int $userId, string $sscRole, string $reviewStage): self
    {
        return self::create([
            'user_id' => $userId,
            'ssc_role' => $sscRole,
            'review_stage' => $reviewStage,
            'is_active' => true,
            'assigned_at' => now(),
        ]);
    }

    public static function getMembersByStage(string $stage): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('review_stage', $stage)
            ->where('is_active', true)
            ->get();
    }

    public static function getUserRoles(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return self::where('user_id', $userId)
            ->where('is_active', true)
            ->get();
    }

    public static function canUserReviewStage(int $userId, string $stage): bool
    {
        return self::where('user_id', $userId)
            ->where('review_stage', $stage)
            ->where('is_active', true)
            ->exists();
    }

    // Constants for SSC roles
    public const SSC_ROLES = [
        'CHAIRPERSON' => 'chairperson',
        'BUDGET_DEPT' => 'budget_dept',
        'ACCOUNTING' => 'accounting',
        'TREASURER' => 'treasurer',
        'EDUCATION_AFFAIRS' => 'education_affairs',
        'QCYDO' => 'qcydo',
        'PLANNING_DEPT' => 'planning_dept',
        'CITY_COUNCIL' => 'city_council',
        'HRD' => 'hrd',
        'SOCIAL_SERVICES' => 'social_services',
        'SCHOOLS_DIVISION' => 'schools_division',
        'QCU' => 'qcu',
    ];

    public const REVIEW_STAGES = [
        'DOCUMENT_VERIFICATION' => 'document_verification',
        'FINANCIAL_REVIEW' => 'financial_review',
        'ACADEMIC_REVIEW' => 'academic_review',
        'FINAL_APPROVAL' => 'final_approval',
    ];

    public const STAGE_ROLE_MAPPING = [
        'document_verification' => ['city_council', 'hrd', 'social_services'],
        'financial_review' => ['budget_dept', 'accounting', 'treasurer'],
        'academic_review' => ['education_affairs', 'qcydo', 'planning_dept', 'schools_division', 'qcu'],
        'final_approval' => ['chairperson'],
    ];
}
