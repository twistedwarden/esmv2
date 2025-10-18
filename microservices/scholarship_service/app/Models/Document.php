<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Document extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'original_name',
        'path',
        'type',
        'size',
        'mime_type',
        'application_id',
        'user_id',
        'deleted_by',
        'deletion_reason',
    ];

    protected $casts = [
        'size' => 'integer',
    ];

    /**
     * Get the application that owns the document.
     */
    public function application()
    {
        return $this->belongsTo(ScholarshipApplication::class, 'application_id');
    }

    /**
     * Get the user that owns the document.
     */
    public function user()
    {
        return $this->belongsTo(\App\Models\User::class, 'user_id');
    }
}