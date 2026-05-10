<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Student extends Authenticatable
{
    use Notifiable;

    protected $guard = 'student';

    protected $fillable = [
        'student_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'course',
        'year_level',   // stored as integer: 1 | 2 | 3 | 4
        'status',       // 'inactive' (pending approval) | 'active' (approved)
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'password'   => 'hashed',
            'year_level' => 'integer',
        ];
    }

    // ── Accessors ──────────────────────────────────────────────────────────────

    /** "Juan Dela Cruz" */
    public function getFullNameAttribute(): string
    {
        return "{$this->first_name} {$this->last_name}";
    }

    /**
     * Converts stored integer (1–4) → "1st Year", "2nd Year", etc.
     * Used by StudentController so the TSX always receives a readable string.
     */
    public function getYearLevelLabelAttribute(): string
    {
        return match ((int) $this->year_level) {
            1 => '1st Year',
            2 => '2nd Year',
            3 => '3rd Year',
            4 => '4th Year',
            default => (string) ($this->year_level ?? '—'),
        };
    }

    /** Whether the account is approved/active. */
    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function enrollments(): HasMany
    {
        return $this->hasMany(Enrollment::class);
    }

    public function grades(): HasManyThrough
    {
        return $this->hasManyThrough(Grade::class, Enrollment::class);
    }

    public function sections()
    {
        return $this->belongsToMany(Section::class, 'enrollments')
                    ->withPivot('status', 'enrolled_at')
                    ->withTimestamps();
    }

    // ── Computed helpers ───────────────────────────────────────────────────────

    /** Weighted GPA across all finalized grades. */
    public function getGpaAttribute(): ?float
    {
        $enrollments = $this->enrollments()
            ->with(['grade', 'section.course'])
            ->get()
            ->filter(fn($e) => $e->grade && $e->grade->is_finalized && $e->grade->gpa_equivalent !== null);

        if ($enrollments->isEmpty()) return null;

        $totalWeighted = $enrollments->sum(fn($e) => $e->grade->gpa_equivalent * $e->section->course->units);
        $totalUnits    = $enrollments->sum(fn($e) => $e->section->course->units);

        return $totalUnits > 0 ? round($totalWeighted / $totalUnits, 2) : null;
    }
}