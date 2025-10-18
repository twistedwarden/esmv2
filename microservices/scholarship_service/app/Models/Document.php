<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Document extends Model
{
    use HasFactory;

    protected $fillable = [
        'student_id',
        'application_id',
        'document_type_id',
        'file_name',
        'file_path',
        'file_size',
        'mime_type',
        'status',
        'verification_notes',
        'verified_by',
        'verified_at',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'verified_at' => 'datetime',
    ];

    /**
     * Get the student that owns the document.
     */
    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    /**
     * Get the application that owns the document.
     */
    public function application()
    {
        return $this->belongsTo(ScholarshipApplication::class, 'application_id');
    }

    /**
     * Get the document type.
     */
    public function documentType()
    {
        return $this->belongsTo(DocumentType::class);
    }

    /**
     * Get the user who verified the document.
     */
    public function verifier()
    {
        return $this->belongsTo(\App\Models\User::class, 'verified_by');
    }

    /**
     * Verify the document.
     */
    public function verify($notes = null, $userId = null)
    {
        $this->status = 'verified';
        $this->verification_notes = $notes;
        $this->verified_by = $userId;
        $this->verified_at = now();
        $this->save();
    }

    /**
     * Reject the document.
     */
    public function reject($notes, $userId = null)
    {
        $this->status = 'rejected';
        $this->verification_notes = $notes;
        $this->verified_by = $userId;
        $this->verified_at = now();
        $this->save();
    }

    /**
     * Get the virus scan log for this document.
     */
    public function virusScanLog()
    {
        return $this->hasOne(FileSecurityLog::class, 'document_id');
    }
}