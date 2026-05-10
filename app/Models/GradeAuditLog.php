<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GradeAuditLog extends Model {

    public $timestamps = false;

    protected $fillable = [
        'grade_id',
        'enrollment_id',
        'changed_by_type',
        'changed_by_id',
        'old_score',
        'new_score',
        'old_letter',
        'new_letter',
        'old_remarks',
        'new_remarks',
        'reason',
        'changed_at',
    ];

    protected function casts(): array {
        return [
            'changed_at' => 'datetime',
            'old_score'  => 'decimal:2',
            'new_score'  => 'decimal:2',
        ];
    }

    public function grade(): BelongsTo {
        return $this->belongsTo(Grade::class);
    }

    public function enrollment(): BelongsTo {
        return $this->belongsTo(Enrollment::class);
    }

    /** Polymorphic-style: get the user who made the change. */
    public function changedBy() {
        return match($this->changed_by_type) {
            'faculty'   => Faculty::find($this->changed_by_id),
            'registrar' => Registrar::find($this->changed_by_id),
            default     => null,
        };
    }
}