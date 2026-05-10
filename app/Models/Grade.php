<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Grade extends Model {

    protected $fillable = [
        'enrollment_id',
        'faculty_id',
        'registrar_id',
        'prelim',
        'midterm',
        'finals',
        'score',
        'letter_grade',
        'gpa_equivalent',
        'remarks',
        'is_finalized',
        'submitted_at',
        'finalized_at',
    ];

    protected function casts(): array {
        return [
            'prelim'         => 'decimal:2',
            'midterm'        => 'decimal:2',
            'finals'         => 'decimal:2',
            'score'          => 'decimal:2',
            'gpa_equivalent' => 'decimal:2',
            'is_finalized'   => 'boolean',
            'submitted_at'   => 'datetime',
            'finalized_at'   => 'datetime',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function enrollment(): BelongsTo {
        return $this->belongsTo(Enrollment::class);
    }

    public function faculty(): BelongsTo {
        return $this->belongsTo(Faculty::class);
    }

    public function registrar(): BelongsTo {
        return $this->belongsTo(Registrar::class);
    }

    public function auditLogs(): HasMany {
        return $this->hasMany(GradeAuditLog::class);
    }

    // ── Shortcuts ──────────────────────────────────────────────────────────────

    public function getStudentAttribute() {
        return $this->enrollment?->student;
    }

    public function getCourseAttribute() {
        return $this->enrollment?->section?->course;
    }

    // ── Grading Logic ──────────────────────────────────────────────────────────

    /**
     * Compute final score from Prelim, Midterm, Finals.
     * Formula: Prelim 30% + Midterm 30% + Finals 40%
     */
    public static function computeFinalScore(float $prelim, float $midterm, float $finals): float {
        return round(($prelim * 0.30) + ($midterm * 0.30) + ($finals * 0.40), 2);
    }

    /**
     * Convert a raw score (0–100) to a 2-digit Philippine letter grade and GPA equivalent.
     * Saint Mary's College of Bansalan scale.
     * Passing grade: 75. Below 75 = Failed (74).
     */
    public static function computeFromScore(float $score): array {
        return match(true) {
            $score >= 98 => ['letter' => '98', 'gpa' => 1.00, 'remarks' => 'passed'],
            $score >= 95 => ['letter' => '95', 'gpa' => 1.25, 'remarks' => 'passed'],
            $score >= 92 => ['letter' => '92', 'gpa' => 1.50, 'remarks' => 'passed'],
            $score >= 89 => ['letter' => '89', 'gpa' => 1.75, 'remarks' => 'passed'],
            $score >= 86 => ['letter' => '86', 'gpa' => 2.00, 'remarks' => 'passed'],
            $score >= 83 => ['letter' => '83', 'gpa' => 2.25, 'remarks' => 'passed'],
            $score >= 80 => ['letter' => '80', 'gpa' => 2.50, 'remarks' => 'passed'],
            $score >= 77 => ['letter' => '77', 'gpa' => 2.75, 'remarks' => 'passed'],
            $score >= 75 => ['letter' => '75', 'gpa' => 3.00, 'remarks' => 'passed'],
            default      => ['letter' => '74', 'gpa' => 5.00, 'remarks' => 'failed'],
        };
    }

    /**
     * Full pipeline: compute score from components, then derive letter/gpa/remarks.
     */
    public static function computeFromComponents(float $prelim, float $midterm, float $finals): array {
        $score = self::computeFinalScore($prelim, $midterm, $finals);
        $computed = self::computeFromScore($score);
        return [
            'score'   => $score,
            'letter'  => $computed['letter'],
            'gpa'     => $computed['gpa'],
            'remarks' => $computed['remarks'],
        ];
    }

    public function isFinalized(): bool {
        return $this->is_finalized;
    }

    public function isPassed(): bool {
        return $this->remarks === 'passed';
    }
}