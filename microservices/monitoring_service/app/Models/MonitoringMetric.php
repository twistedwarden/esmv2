<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MonitoringMetric extends Model
{
    use HasFactory;

    protected $fillable = [
        'metric_name',
        'metric_value',
        'metric_date',
        'notes'
    ];

    protected $casts = [
        'metric_value' => 'decimal:2',
        'metric_date' => 'date'
    ];

    /**
     * Scope for specific metric names
     */
    public function scopeOfName($query, $name)
    {
        return $query->where('metric_name', $name);
    }

    /**
     * Scope for date range
     */
    public function scopeDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('metric_date', [$startDate, $endDate]);
    }

    /**
     * Scope for recent metrics
     */
    public function scopeRecent($query, $days = 30)
    {
        return $query->where('metric_date', '>=', now()->subDays($days));
    }
}
