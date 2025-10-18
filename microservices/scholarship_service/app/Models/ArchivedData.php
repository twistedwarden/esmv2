<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ArchivedData extends Model
{
    use HasFactory;

    protected $fillable = [
        'resource_type',
        'resource_id',
        'original_data',
        'deleted_by',
        'deletion_reason',
        'deleted_at',
    ];

    protected $casts = [
        'original_data' => 'array',
        'deleted_at' => 'datetime',
    ];
}
