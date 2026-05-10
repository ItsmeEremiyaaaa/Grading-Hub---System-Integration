<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Section extends Model {

    protected $fillable = [
        'course_id',
        'faculty_id',
        'section_name',
        'school_year',
        'semester',
        'status',
    ];

    /** The course this section is for. */
    public function course(): BelongsTo {
        return $this->belongsTo(Course::class);
    }

    /** The faculty member assigned to this section. */
    public function faculty(): BelongsTo {
        return $this->belongsTo(Faculty::class);
    }

    /** All enrollments under this section. */
    public function enrollments(): HasMany {
        return $this->hasMany(Enrollment::class);
    }

    /** All students enrolled in this section. */
    public function students() {
        return $this->belongsToMany(Student::class, 'enrollments')
                    ->withPivot('status', 'enrolled_at')
                    ->withTimestamps();
    }

    /** Grades for all enrollments in this section. */
    public function grades() {
        return $this->hasManyThrough(Grade::class, Enrollment::class);
    }

    // ── Status helpers ─────────────────────────────────────────────────────────

    public function isOpen(): bool     { return $this->status === 'open'; }
    public function isGrading(): bool  { return $this->status === 'grading'; }
    public function isDone(): bool     { return $this->status === 'done'; }

    /** Registrar opens grading — faculty can now submit grades. */
    public function openGrading(): void {
        $this->update(['status' => 'grading']);
    }

    /** Registrar finalizes — locks all grades in this section. */
    public function finalize(): void {
        $this->update(['status' => 'done']);
        $this->grades()->update(['is_finalized' => true, 'finalized_at' => now()]);
    }
}