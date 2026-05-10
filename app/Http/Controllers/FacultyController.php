<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Grade;
use App\Models\GradeAuditLog;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class FacultyController extends Controller {

    private function faculty() {
        return Auth::guard('faculty')->user();
    }

    public function dashboard(): Response {
        $faculty = $this->faculty();
        $faculty->load(['sections.course', 'sections.enrollments.grade']);

        $sections = $faculty->sections->map(fn($section) => [
            'id'              => $section->id,
            'course_code'     => $section->course->code,
            'course_name'     => $section->course->name,
            'section_name'    => $section->section_name,
            'school_year'     => $section->school_year,
            'semester'        => $section->semester,
            'status'          => $section->status,
            'total_students'  => $section->enrollments->count(),
            'graded_students' => $section->enrollments->filter(fn($e) => $e->grade)->count(),
            'pending_grades'  => $section->enrollments->filter(fn($e) => !$e->grade && $e->status === 'enrolled')->count(),
        ]);

        return Inertia::render('faculty/Dashboard', [
            'faculty'  => [
                'full_name'  => $faculty->full_name,
                'faculty_id' => $faculty->faculty_id,
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'sections' => $sections,
            'stats'    => [
                'total_sections'  => $sections->count(),
                'total_students'  => $sections->sum('total_students'),
                'pending_grades'  => $sections->sum('pending_grades'),
                'grading_open'    => $sections->filter(fn($s) => $s['status'] === 'grading')->count(),
            ],
        ]);
    }

    public function sections(): Response {
        $faculty = $this->faculty();
        $faculty->load(['sections.course', 'sections.enrollments.grade']);

        $sections = $faculty->sections->map(fn($section) => [
            'id'              => $section->id,
            'course_code'     => $section->course->code,
            'course_name'     => $section->course->name,
            'section_name'    => $section->section_name,
            'school_year'     => $section->school_year,
            'semester'        => $section->semester,
            'status'          => $section->status,
            'total_students'  => $section->enrollments->count(),
            'graded_students' => $section->enrollments->filter(fn($e) => $e->grade)->count(),
            'pending_grades'  => $section->enrollments->filter(fn($e) => !$e->grade && $e->status === 'enrolled')->count(),
        ]);

        return Inertia::render('faculty/MySections', [
            'faculty'  => [
                'full_name'  => $faculty->full_name,
                'faculty_id' => $faculty->faculty_id,
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'sections' => $sections,
            'stats'    => [
                'total_sections'  => $sections->count(),
                'total_students'  => $sections->sum('total_students'),
                'pending_grades'  => $sections->sum('pending_grades'),
                'grading_open'    => $sections->filter(fn($s) => $s['status'] === 'grading')->count(),
            ],
        ]);
    }

    public function grades(): Response {
        $faculty = $this->faculty();

        $sections = Section::with(['course', 'enrollments.student', 'enrollments.grade'])
            ->where('faculty_id', $faculty->id)
            ->get();

        $sectionsData = $sections->map(fn($section) => [
            'id'           => $section->id,
            'course_code'  => $section->course->code,
            'course_name'  => $section->course->name,
            'section_name' => $section->section_name,
            'school_year'  => $section->school_year,
            'semester'     => $section->semester,
            'status'       => $section->status,
            'grades'       => $section->enrollments->map(fn($enrollment) => [
                'enrollment_id' => $enrollment->id,
                'student_id'    => $enrollment->student->student_id,
                'student_name'  => $enrollment->student->full_name,
                'prelim'        => $enrollment->grade?->prelim,
                'midterm'       => $enrollment->grade?->midterm,
                'finals'        => $enrollment->grade?->finals,
                'score'         => $enrollment->grade?->score,
                'letter_grade'  => $enrollment->grade?->letter_grade,
                'remarks'       => $enrollment->grade?->remarks ?? 'pending',
                'is_finalized'  => $enrollment->grade?->is_finalized ?? false,
            ]),
        ]);

        return Inertia::render('faculty/Grades', [
            'faculty'  => [
                'full_name'  => $faculty->full_name,
                'faculty_id' => $faculty->faculty_id,
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'sections' => $sectionsData,
        ]);
    }

    public function students(): Response {
        $faculty = $this->faculty();

        $sections = Section::with([
            'enrollments.student',
            'enrollments.grade',
            'course',
        ])
            ->where('faculty_id', $faculty->id)
            ->get();

        $studentMap = [];

        foreach ($sections as $section) {
            foreach ($section->enrollments as $enrollment) {
                $student = $enrollment->student;

                if (!$student) continue;

                $sid = $student->id;

                if (!isset($studentMap[$sid])) {
                    $studentMap[$sid] = [
                        'id'          => $student->id,
                        'student_id'  => $student->student_id,
                        'full_name'   => $student->full_name,
                        'email'       => $student->email,
                        'course'      => $student->course ?? 'N/A',
                        'year_level'  => $student->year_level ?? 'N/A',
                        'enrollments' => [],
                    ];
                }

                $studentMap[$sid]['enrollments'][] = [
                    'enrollment_id'  => $enrollment->id,
                    'course_code'    => $section->course->code,
                    'course_name'    => $section->course->name,
                    'section_name'   => $section->section_name,
                    'school_year'    => $section->school_year,
                    'semester'       => $section->semester,
                    'section_status' => $section->status,
                    'grade'          => $enrollment->grade ? [
                        'score'        => $enrollment->grade->score,
                        'letter_grade' => $enrollment->grade->letter_grade,
                        'remarks'      => $enrollment->grade->remarks ?? 'pending',
                        'is_finalized' => (bool) $enrollment->grade->is_finalized,
                    ] : null,
                ];
            }
        }

        return Inertia::render('faculty/Students', [
            'faculty'  => [
                'full_name'  => $faculty->full_name,
                'faculty_id' => $faculty->faculty_id,
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'students' => array_values($studentMap),
        ]);
    }

    public function section(Section $section): Response {
        abort_if($section->faculty_id !== $this->faculty()->id, 403, 'Unauthorized.');

        $faculty = $this->faculty();
        $section->load(['course', 'enrollments.student', 'enrollments.grade']);

        $students = $section->enrollments->map(fn($enrollment) => [
            'enrollment_id' => $enrollment->id,
            'student_id'    => $enrollment->student->student_id,
            'full_name'     => $enrollment->student->full_name,
            'email'         => $enrollment->student->email,
            'status'        => $enrollment->status,
            'grade'         => $enrollment->grade ? [
                'id'             => $enrollment->grade->id,
                'prelim'         => $enrollment->grade->prelim,
                'midterm'        => $enrollment->grade->midterm,
                'finals'         => $enrollment->grade->finals,
                'score'          => $enrollment->grade->score,
                'letter_grade'   => $enrollment->grade->letter_grade,
                'gpa_equivalent' => $enrollment->grade->gpa_equivalent,
                'remarks'        => $enrollment->grade->remarks,
                'is_finalized'   => $enrollment->grade->is_finalized,
                'submitted_at'   => $enrollment->grade->submitted_at,
            ] : null,
        ]);

        return Inertia::render('faculty/SectionDetail', [
            'faculty'   => [
                'full_name'  => $faculty->full_name,
                'faculty_id' => $faculty->faculty_id,
                'department' => $faculty->department,
                'position'   => $faculty->position,
            ],
            'section'   => [
                'id'           => $section->id,
                'course_code'  => $section->course->code,
                'course_name'  => $section->course->name,
                'section_name' => $section->section_name,
                'school_year'  => $section->school_year,
                'semester'     => $section->semester,
                'status'       => $section->status,
                'units'        => $section->course->units,
            ],
            'students'  => $students,
            'can_grade' => $section->status === 'grading',
        ]);
    }

    public function submitGrade(Request $request, Enrollment $enrollment) {
        $faculty = $this->faculty();

        abort_if($enrollment->section->faculty_id !== $faculty->id, 403, 'Unauthorized.');
        abort_if($enrollment->grade?->is_finalized, 403, 'This grade has been finalized and cannot be changed.');
        abort_if($enrollment->section->status !== 'grading', 403, 'Grading is not open for this section.');

        $validated = $request->validate([
            'prelim'  => ['required', 'numeric', 'min:0', 'max:100'],
            'midterm' => ['required', 'numeric', 'min:0', 'max:100'],
            'finals'  => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        $computed = Grade::computeFromComponents(
            $validated['prelim'],
            $validated['midterm'],
            $validated['finals'],
        );

        DB::transaction(function () use ($enrollment, $faculty, $validated, $computed) {
            $oldGrade = $enrollment->grade;

            $grade = Grade::updateOrCreate(
                ['enrollment_id' => $enrollment->id],
                [
                    'faculty_id'     => $faculty->id,
                    'prelim'         => $validated['prelim'],
                    'midterm'        => $validated['midterm'],
                    'finals'         => $validated['finals'],
                    'score'          => $computed['score'],
                    'letter_grade'   => $computed['letter'],
                    'gpa_equivalent' => $computed['gpa'],
                    'remarks'        => $computed['remarks'],
                    'submitted_at'   => now(),
                ]
            );

            GradeAuditLog::create([
                'grade_id'        => $grade->id,
                'enrollment_id'   => $enrollment->id,
                'changed_by_type' => 'faculty',
                'changed_by_id'   => $faculty->id,
                'old_score'       => $oldGrade?->score,
                'new_score'       => $computed['score'],
                'old_letter'      => $oldGrade?->letter_grade,
                'new_letter'      => $computed['letter'],
                'old_remarks'     => $oldGrade?->remarks,
                'new_remarks'     => $computed['remarks'],
                'changed_at'      => now(),
            ]);
        });

        return back()->with('success', 'Grade submitted successfully.');
    }

    public function submitBulkGrades(Request $request, Section $section) {
        $faculty = $this->faculty();

        abort_if($section->faculty_id !== $faculty->id, 403, 'Unauthorized.');
        abort_if($section->status !== 'grading', 403, 'Grading is not open for this section.');

        $validated = $request->validate([
            'grades'                 => ['required', 'array'],
            'grades.*.enrollment_id' => ['required', 'exists:enrollments,id'],
            'grades.*.prelim'        => ['required', 'numeric', 'min:0', 'max:100'],
            'grades.*.midterm'       => ['required', 'numeric', 'min:0', 'max:100'],
            'grades.*.finals'        => ['required', 'numeric', 'min:0', 'max:100'],
        ]);

        DB::transaction(function () use ($validated, $faculty) {
            foreach ($validated['grades'] as $item) {
                $enrollment = Enrollment::findOrFail($item['enrollment_id']);

                if ($enrollment->grade?->is_finalized) continue;

                $computed = Grade::computeFromComponents(
                    $item['prelim'],
                    $item['midterm'],
                    $item['finals'],
                );

                $oldGrade = $enrollment->grade;

                $grade = Grade::updateOrCreate(
                    ['enrollment_id' => $enrollment->id],
                    [
                        'faculty_id'     => $faculty->id,
                        'prelim'         => $item['prelim'],
                        'midterm'        => $item['midterm'],
                        'finals'         => $item['finals'],
                        'score'          => $computed['score'],
                        'letter_grade'   => $computed['letter'],
                        'gpa_equivalent' => $computed['gpa'],
                        'remarks'        => $computed['remarks'],
                        'submitted_at'   => now(),
                    ]
                );

                GradeAuditLog::create([
                    'grade_id'        => $grade->id,
                    'enrollment_id'   => $enrollment->id,
                    'changed_by_type' => 'faculty',
                    'changed_by_id'   => $faculty->id,
                    'old_score'       => $oldGrade?->score,
                    'new_score'       => $computed['score'],
                    'old_letter'      => $oldGrade?->letter_grade,
                    'new_letter'      => $computed['letter'],
                    'old_remarks'     => $oldGrade?->remarks,
                    'new_remarks'     => $computed['remarks'],
                    'changed_at'      => now(),
                ]);
            }
        });

        return back()->with('success', 'All grades submitted successfully.');
    }
}