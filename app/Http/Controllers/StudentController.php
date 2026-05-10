<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class StudentController extends Controller
{
    private function student()
    {
        return Auth::guard('student')->user();
    }

    /**
     * Student dashboard — data shaped to match StudentDashboard.tsx exactly.
     */
    public function dashboard(): Response
    {
        $student = $this->student()->load([
            'enrollments.section.course',
            'enrollments.section.faculty',
            'enrollments.grade',
        ]);

        // ── Enrollments (matches Enrollment interface in TSX) ──────────────────
        $enrollments = $student->enrollments->map(fn($e) => [
            'id'           => $e->id,
            'subject_code' => $e->section->course->code        ?? '—',
            'subject_name' => $e->section->course->name        ?? '—',
            'section'      => $e->section->section_name        ?? '—',
            'faculty_name' => $e->section->faculty?->full_name ?? 'TBA',
            'schedule'     => $e->section->schedule            ?? '—',
            'room'         => $e->section->room                ?? '—',
            'units'        => $e->section->course->units       ?? 0,
            'status'       => $e->status,                       // 'enrolled' | 'pending' | 'dropped'
        ]);

        // ── Grades (matches Grade interface in TSX) ────────────────────────────
        $grades = $student->enrollments
            ->filter(fn($e) => $e->grade !== null)
            ->map(fn($e) => [
                'id'           => $e->grade->id,
                'subject_code' => $e->section->course->code        ?? '—',
                'subject_name' => $e->section->course->name        ?? '—',
                'section'      => $e->section->section_name        ?? '—',
                'faculty_name' => $e->section->faculty?->full_name ?? 'TBA',
                'letter_grade' => $e->grade->letter_grade,
                'units'        => $e->section->course->units       ?? 0,
                'status'       => $e->grade->is_finalized ? 'finalized' : 'pending',
                'semester'     => $e->section->semester            ?? '—',
                'school_year'  => $e->section->school_year         ?? '—',
            ])->values();

        // ── Stats ──────────────────────────────────────────────────────────────
        $finalizedGrades   = $grades->where('status', 'finalized');
        $activeEnrollments = $enrollments->where('status', 'enrolled');
        $pendingGrades     = $grades->where('status', 'pending')->count();

        // GWA via gpa_equivalent on the grade model
        $gwaSource = $student->enrollments
            ->filter(fn($e) => $e->grade && $e->grade->is_finalized && $e->grade->gpa_equivalent !== null);

        $gwa = $gwaSource->isNotEmpty()
            ? round(
                $gwaSource->sum(fn($e) => $e->grade->gpa_equivalent * $e->section->course->units) /
                max($gwaSource->sum(fn($e) => $e->section->course->units), 1),
                2
            )
            : null;

        return Inertia::render('dashboard', [
            // matches Student interface in TSX
            'student' => [
                'id'         => $student->id,
                'student_id' => $student->student_id,
                'first_name' => $student->first_name,
                'last_name'  => $student->last_name,
                'email'      => $student->email,
                'course'     => $student->course,
                'year_level' => $student->year_level_label,  // "1st Year" etc.
                'status'     => $student->status,            // 'active' | 'inactive'
            ],
            'enrollments' => $enrollments->values(),
            'grades'      => $grades,
            // matches stats interface in TSX
            'stats' => [
                'total_units_enrolled'  => $activeEnrollments->sum('units'),
                'total_units_completed' => $finalizedGrades->sum('units'),
                'gwa'                   => $gwa,
                'pending_grades'        => $pendingGrades,
            ],
        ]);
    }

    /**
     * Dedicated grades page (student/Grades.tsx).
     */
    public function grades(): Response
    {
        $student = $this->student()->load([
            'enrollments.section.course',
            'enrollments.section.faculty',
            'enrollments.grade',
        ]);

        $grouped = $student->enrollments
            ->filter(fn($e) => $e->grade !== null)
            ->groupBy(fn($e) => $e->section->school_year . ' - ' . $e->section->semester . ' Semester')
            ->map(fn($group) => $group->map(fn($e) => [
                'id'             => $e->grade->id,
                'course_code'    => $e->section->course->code        ?? '—',
                'course_name'    => $e->section->course->name        ?? '—',
                'units'          => $e->section->course->units       ?? 0,
                'faculty'        => $e->section->faculty?->full_name ?? 'TBA',
                'score'          => $e->grade->score,
                'letter_grade'   => $e->grade->letter_grade,
                'gpa_equivalent' => $e->grade->gpa_equivalent,
                'remarks'        => $e->grade->remarks,
                'is_finalized'   => $e->grade->is_finalized,
            ])->values());

        return Inertia::render('student/Grades', [
            'student' => [
                'full_name'  => $student->full_name,
                'student_id' => $student->student_id,
                'course'     => $student->course,
                'year_level' => $student->year_level_label,
            ],
            'grouped_grades' => $grouped,
        ]);
    }

    /**
     * Official transcript page (student/Transcript.tsx).
     */
    public function transcript(): Response
    {
        $student = $this->student()->load([
            'enrollments.section.course',
            'enrollments.section.faculty',
            'enrollments.grade',
        ]);

        $records = $student->enrollments
            ->filter(fn($e) => $e->grade && $e->grade->is_finalized)
            ->groupBy(fn($e) => $e->section->school_year . '||' . $e->section->semester)
            ->map(fn($group, $key) => [
                'period'  => str_replace('||', ' - ', $key) . ' Semester',
                'courses' => $group->map(fn($e) => [
                    'code'           => $e->section->course->code,
                    'name'           => $e->section->course->name,
                    'units'          => $e->section->course->units,
                    'letter_grade'   => $e->grade->letter_grade,
                    'gpa_equivalent' => $e->grade->gpa_equivalent,
                    'remarks'        => $e->grade->remarks,
                ])->values(),
                'semester_gpa' => round(
                    $group->avg(fn($e) => $e->grade->gpa_equivalent) ?? 0,
                    2
                ),
                'total_units' => $group->sum(fn($e) => $e->section->course->units),
            ])->values();

        $cumulativeGpa = $student->enrollments
            ->filter(fn($e) => $e->grade && $e->grade->is_finalized && $e->grade->gpa_equivalent !== null)
            ->avg(fn($e) => $e->grade->gpa_equivalent);

        return Inertia::render('student/Transcript', [
            'student' => [
                'full_name'  => $student->full_name,
                'student_id' => $student->student_id,
                'course'     => $student->course,
                'year_level' => $student->year_level_label,
                'email'      => $student->email,
            ],
            'records'        => $records,
            'cumulative_gpa' => $cumulativeGpa ? round($cumulativeGpa, 2) : null,
        ]);
    }
}