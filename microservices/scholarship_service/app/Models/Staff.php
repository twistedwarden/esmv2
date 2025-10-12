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
        $authService = app(AuthServiceClient::class);
        
        $userIds = $staff->pluck('user_id')->toArray();
        $users = $authService->getUsersByIds($userIds);
        
        return $staff->map(function ($staffMember) use ($users) {
            $userData = $users[$staffMember->user_id] ?? null;
            
            return [
                'id' => $staffMember->id,
                'user_id' => $staffMember->user_id,
                'name' => $userData['name'] ?? 'Unknown User',
                'email' => $userData['email'] ?? 'unknown@example.com',
                'system_role' => $staffMember->system_role,
                'department' => $staffMember->department,
                'position' => $staffMember->position,
            ];
        })->toArray();
    }
}
