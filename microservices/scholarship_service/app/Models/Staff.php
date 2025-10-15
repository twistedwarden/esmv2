<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Services\AuthServiceClient;

class Staff extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'citizen_id',
        'system_role',
        'department',
        'position',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get the interview schedules for this staff member.
     */
    public function interviewSchedules(): HasMany
    {
        return $this->hasMany(InterviewSchedule::class);
    }

    /**
     * Scope a query to only include active staff.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope a query to only include interviewers.
     */
    public function scopeInterviewers($query)
    {
        return $query->where('system_role', 'interviewer');
    }

    /**
     * Get the staff member's full name from the auth service.
     */
    public function getFullNameAttribute(): string
    {
        $user = $this->getUserFromAuthService();
        return $user['name'] ?? 'Unknown User';
    }

    /**
     * Get the staff member's email from the auth service.
     */
    public function getEmailAttribute(): string
    {
        $user = $this->getUserFromAuthService();
        return $user['email'] ?? 'unknown@example.com';
    }

    /**
     * Get user data from auth service.
     */
    public function getUserFromAuthService(): ?array
    {
        $authService = app(AuthServiceClient::class);
        return $authService->getUserById($this->user_id);
    }

    /**
     * Get staff member with user data from auth service.
     */
    public function withUserData(): array
    {
        $userData = $this->getUserFromAuthService();
        
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'citizen_id' => $this->citizen_id,
            'system_role' => $this->system_role,
            'department' => $this->department,
            'position' => $this->position,
            'is_active' => $this->is_active,
            'name' => $userData['name'] ?? 'Unknown User',
            'email' => $userData['email'] ?? 'unknown@example.com',
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }

    /**
     * Get all active interviewers with user data.
     */
    public static function getActiveInterviewersWithUserData(): array
    {
        $staff = self::active()->interviewers()->get();
        
        // Map user IDs to names (temporary solution until auth service integration is fixed)
        $userNames = [
            311 => 'Peter Santos',
            312 => 'Maria Reyes', 
            313 => 'John Cruz',
            314 => 'Ana Lopez',
            315 => 'Carlos Mendoza'
        ];
        
        $userEmails = [
            311 => 'grindshine478@gmail.com',
            312 => 'maria.reyes@scholarship.gov.ph',
            313 => 'john.cruz@scholarship.gov.ph', 
            314 => 'ana.lopez@scholarship.gov.ph',
            315 => 'carlos.mendoza@scholarship.gov.ph'
        ];
        
        return $staff->map(function ($staffMember) use ($userNames, $userEmails) {
            return [
                'id' => $staffMember->id,
                'user_id' => $staffMember->user_id,
                'name' => $userNames[$staffMember->user_id] ?? 'Unknown User',
                'email' => $userEmails[$staffMember->user_id] ?? 'unknown@example.com',
                'system_role' => $staffMember->system_role,
                'department' => $staffMember->department,
                'position' => $staffMember->position,
            ];
        })->toArray();
    }
}
