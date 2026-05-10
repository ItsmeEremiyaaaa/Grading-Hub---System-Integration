<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Enrollment extends Model {

    protected $fillable = [
        'student_id',
        'section_id',
        'registrar_id',
        'status',
        'enrolled_at',
    ];

    protected function casts(): array {
        return [
            'enrolled_at' => 'datetime',
        ];
    }

    /** The student in this enrollment. */
    public function student(): BelongsTo {
        return $this->belongsTo(Student::class);
    }

    /** The section this enrollment belongs to. */
    public function section(): BelongsTo {
        return $this->belongsTo(Section::class);
    }

    /** The registrar who enrolled the student. */
    public function registrar(): BelongsTo {
        return $this->belongsTo(Registrar::class);
    }

    /** The grade for this enrollment. */
    public function grade(): HasOne {
        return $this->hasOne(Grade::class);
    }

    // ── Shortcuts ──────────────────────────────────────────────────────────────

    public function getCourseAttribute() {
        return $this->section?->course;
    }

    public function getFacultyAttribute() {
        return $this->section?->faculty;
    }
}