<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonitoringReport extends Model
{
    use HasFactory;

    protected $fillable = [
        'report_type',
        'generated_by',
        'parameters',
        'file_url'
    ];

    protected $casts = [
        'parameters' => 'array',
        'generated_at' => 'datetime'
    ];

    /**
     * Get the user who generated the report
     */
    public function generatedBy()
    {
        return $this->belongsTo(User::class, 'generated_by');
    }

    /**
     * Scope for specific report types
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('report_type', $type);
    }

    /**
     * Scope for recent reports
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('generated_at', '>=', now()->subDays($days));
    }
}
