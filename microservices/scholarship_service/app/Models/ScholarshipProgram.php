<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class ScholarshipProgram extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'description',
        'type',
        'award_amount',
        'max_recipients',
        'current_recipients',
        'total_budget',
        'budget_used',
        'application_deadline',
        'start_date',
        'end_date',
        'status',
        'requirements',
        'benefits',
        'eligibility_criteria',
        'application_instructions',
        'is_active',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'award_amount' => 'decimal:2',
        'total_budget' => 'decimal:2',
        'budget_used' => 'decimal:2',
        'application_deadline' => 'date',
        'start_date' => 'date',
        'end_date' => 'date',
        'requirements' => 'array',
        'benefits' => 'array',
        'eligibility_criteria' => 'array',
        'is_active' => 'boolean',
    ];

    protected $appends = [
        'budget_utilization_percentage',
        'recipients_utilization_percentage',
        'is_accepting_applications',
    ];

    // Relationships
    public function applications()
    {
        return $this->hasMany(ScholarshipApplication::class, 'program_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    // Accessors
    public function getBudgetUtilizationPercentageAttribute()
    {
        if ($this->total_budget <= 0) {
            return 0;
        }
        return round(($this->budget_used / $this->total_budget) * 100, 2);
    }

    public function getRecipientsUtilizationPercentageAttribute()
    {
        if ($this->max_recipients <= 0) {
            return 0;
        }
        return round(($this->current_recipients / $this->max_recipients) * 100, 2);
    }

    public function getIsAcceptingApplicationsAttribute()
    {
        return $this->is_active && 
               $this->status === 'active' && 
               $this->application_deadline > now() &&
               $this->current_recipients < $this->max_recipients;
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('status', 'active');
    }

    public function scopeAcceptingApplications($query)
    {
        return $query->where('is_active', true)
                    ->where('status', 'active')
                    ->where('application_deadline', '>', now())
                    ->whereRaw('current_recipients < max_recipients');
    }

    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }

    public function scopeByStatus($query, $status)
    {
        return $query->where('status', $status);
    }

    // Methods
    public function canAcceptApplications()
    {
        return $this->is_accepting_applications;
    }

    public function updateRecipientsCount()
    {
        $this->current_recipients = $this->applications()
            ->where('status', 'approved')
            ->count();
        $this->save();
    }

    public function updateBudgetUsed()
    {
        $this->budget_used = $this->applications()
            ->where('status', 'approved')
            ->sum('approved_amount');
        $this->save();
    }

    public function getAvailableSlots()
    {
        return max(0, $this->max_recipients - $this->current_recipients);
    }

    public function getRemainingBudget()
    {
        return max(0, $this->total_budget - $this->budget_used);
    }
}
