<?php

namespace App\Http\Controllers;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Faculty;
use App\Models\Grade;
use App\Models\GradeAuditLog;
use App\Models\Registrar;
use App\Models\Section;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class RegistrarController extends Controller
{
    private function registrar()
    {
        return Auth::guard('registrar')->user();
    }

    public function dashboard(): Response
    {
        $pendingStudents = Student::where('status', 'inactive')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($s) => [
                'id'         => $s->id,
                'student_id' => $s->student_id,
                'full_name'  => $s->full_name,
                'email'      => $s->email,
                'course'     => $s->course,
                'year_level' => $s->year_level,
                'status'     => $s->status,
            ]);

        $pendingGrades = Grade::with([
            'enrollment.student',
            'enrollment.section.course',
            'enrollment.section.faculty',
            'faculty',
        ])
        ->where('is_finalized', false)
        ->whereNotNull('submitted_at')
        ->orderByDesc('submitted_at')
        ->get()
        ->map(fn($g) => [
            'id'            => $g->id,
            'enrollment_id' => $g->enrollment_id,
            'student_name'  => $g->enrollment->student->full_name,
            'student_id'    => $g->enrollment->student->student_id,
            'course_code'   => $g->enrollment->section->course->code,
            'course_name'   => $g->enrollment->section->course->name,
            'section_name'  => $g->enrollment->section->section_name,
            'faculty_name'  => $g->faculty?->full_name ?? 'N/A',
            'score'         => $g->score,
            'letter_grade'  => $g->letter_grade,
            'remarks'       => $g->remarks,
            'is_finalized'  => $g->is_finalized,
            'submitted_at'  => $g->submitted_at,
        ]);

        return Inertia::render('auth/registrar/AdminDashboard', [
            'registrar' => [
                'full_name' => $this->registrar()->full_name,
                'role'      => $this->registrar()->role,
            ],
            'stats' => [
                'total_students'   => Student::where('status', 'active')->count(),
                'total_faculty'    => Faculty::count(),
                'total_courses'    => Course::count(),
                'total_sections'   => Section::count(),
                'total_enrolled'   => Enrollment::count(),
                'pending_grades'   => Grade::where('is_finalized', false)->whereNotNull('submitted_at')->count(),
                'pending_students' => Student::where('status', 'inactive')->count(),
            ],
            'pending_students' => $pendingStudents,
            'pending_grades'   => $pendingGrades,
            'flash'            => ['success' => session('success')],
        ]);
    }

    public function students(): Response
    {
        $students = Student::withCount('enrollments')
            ->orderByRaw("FIELD(status, 'inactive', 'active', 'rejected')")
            ->orderBy('last_name')
            ->get()
            ->map(fn($s) => [
                'id'                => $s->id,
                'student_id'        => $s->student_id,
                'full_name'         => $s->full_name,
                'email'             => $s->email,
                'course'            => $s->course,
                'year_level'        => $s->year_level,
                'status'            => $s->status,
                'enrollments_count' => $s->enrollments_count,
            ]);

        return Inertia::render('auth/registrar/Students', [
            'students' => $students,
            'flash'    => ['success' => session('success')],
        ]);
    }

    public function approveStudent(Student $student)
    {
        if ($student->status !== 'inactive') {
            return back()->withErrors(['error' => 'Student account is not pending approval.']);
        }
        $student->update(['status' => 'active']);
        return back()->with('success', "{$student->full_name} has been approved and can now log in.");
    }

    public function storeStudent(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:20', 'unique:students,student_id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:students,email'],
            'course'     => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'integer', 'min:1', 'max:4'],
            'password'   => ['required', 'string', 'min:8'],
        ]);

        Student::create([...$validated, 'password' => Hash::make($validated['password']), 'status' => 'active']);
        return back()->with('success', 'Student created successfully.');
    }

    public function updateStudent(Request $request, Student $student)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:students,email,' . $student->id],
            'course'     => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'integer', 'min:1', 'max:4'],
            'status'     => ['required', 'in:active,inactive,rejected'],
        ]);

        $student->update($validated);
        return back()->with('success', 'Student updated successfully.');
    }

    public function destroyStudent(Student $student)
    {
        $student->delete();
        return back()->with('success', 'Student removed successfully.');
    }

    public function faculty(): Response
    {
        $faculty = Faculty::withCount('sections')
            ->orderBy('last_name')
            ->get()
            ->map(fn($f) => [
                'id'             => $f->id,
                'employee_id'    => $f->employee_id,
                'full_name'      => $f->full_name,
                'email'          => $f->email,
                'department'     => $f->department,
                'position'       => $f->position,
                'sections_count' => $f->sections_count,
            ]);

        return Inertia::render('auth/registrar/Faculty', [
            'faculty' => $faculty,
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function storeFaculty(Request $request)
    {
        $validated = $request->validate([
            'employee_id' => ['required', 'string', 'max:20', 'unique:faculty,employee_id'],
            'first_name'  => ['required', 'string', 'max:100'],
            'last_name'   => ['required', 'string', 'max:100'],
            'email'       => ['required', 'email', 'unique:faculty,email'],
            'department'  => ['nullable', 'string', 'max:150'],
            'position'    => ['nullable', 'string', 'max:100'],
            'password'    => ['required', 'string', 'min:8'],
        ]);

        Faculty::create([...$validated, 'password' => Hash::make($validated['password'])]);
        return back()->with('success', 'Faculty created successfully.');
    }

    public function updateFaculty(Request $request, Faculty $faculty)
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'unique:faculty,email,' . $faculty->id],
            'department' => ['nullable', 'string', 'max:150'],
            'position'   => ['nullable', 'string', 'max:100'],
        ]);

        $faculty->update($validated);
        return back()->with('success', 'Faculty updated successfully.');
    }

    public function destroyFaculty(Faculty $faculty)
    {
        $faculty->delete();
        return back()->with('success', 'Faculty removed successfully.');
    }

    public function courses(): Response
    {
        $courses = Course::withCount('sections')->orderBy('code')->get();

        return Inertia::render('auth/registrar/Courses', [
            'courses' => $courses,
            'flash'   => ['success' => session('success')],
        ]);
    }

    public function storeCourse(Request $request)
    {
        $validated = $request->validate([
            'code'        => ['required', 'string', 'max:20', 'unique:courses,code'],
            'name'        => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'units'       => ['required', 'integer', 'min:1', 'max:6'],
            'department'  => ['nullable', 'string', 'max:150'],
        ]);

        Course::create([...$validated, 'status' => 'active']);
        return back()->with('success', 'Course created successfully.');
    }

    public function updateCourse(Request $request, Course $course)
    {
        $validated = $request->validate([
            'name'        => ['required', 'string', 'max:150'],
            'description' => ['nullable', 'string'],
            'units'       => ['required', 'integer', 'min:1', 'max:6'],
            'department'  => ['nullable', 'string', 'max:150'],
            'status'      => ['required', 'in:active,inactive'],
        ]);

        $course->update($validated);
        return back()->with('success', 'Course updated successfully.');
    }

    public function destroyCourse(Course $course)
    {
        $course->delete();
        return back()->with('success', 'Course deleted successfully.');
    }

    public function sections(): Response
    {
        $sections = Section::with(['course', 'faculty'])
            ->withCount('enrollments')
            ->orderByDesc('school_year')
            ->get()
            ->map(fn($s) => [
                'id'                => $s->id,
                'course_code'       => $s->course->code,
                'course_name'       => $s->course->name,
                'section_name'      => $s->section_name,
                'faculty_name'      => $s->faculty?->full_name ?? 'Unassigned',
                'school_year'       => $s->school_year,
                'semester'          => $s->semester,
                'status'            => $s->status,
                'enrollments_count' => $s->enrollments_count,
            ]);

        $courses = Course::where('status', 'active')->get(['id', 'code', 'name']);
        $faculty = Faculty::get(['id', 'employee_id', 'first_name', 'last_name']);

        return Inertia::render('auth/registrar/Sections', [
            'sections' => $sections,
            'courses'  => $courses,
            'faculty'  => $faculty->map(fn($f) => ['id' => $f->id, 'full_name' => $f->full_name]),
            'flash'    => ['success' => session('success')],
        ]);
    }

    public function storeSection(Request $request)
    {
        $validated = $request->validate([
            'course_id'    => ['required', 'exists:courses,id'],
            'faculty_id'   => ['nullable', 'exists:faculty,id'],
            'section_name' => [
                'required',
                'string',
                'max:50',
                Rule::unique('sections')->where(fn($q) => $q
                    ->where('course_id',   $request->course_id)
                    ->where('school_year', $request->school_year)
                    ->where('semester',    $request->semester)
                ),
            ],
            'school_year'  => ['required', 'string', 'max:20'],
            'semester'     => ['required', 'in:1st,2nd,Summer'],
        ]);

        Section::create([...$validated, 'status' => 'open']);
        return back()->with('success', 'Section created successfully.');
    }

    public function updateSectionStatus(Request $request, Section $section)
    {
        $validated = $request->validate([
            'status' => ['required', 'in:open,closed,grading,done'],
        ]);

        if ($validated['status'] === 'done') {
            $section->finalize();
        } else {
            $section->update($validated);
        }

        return back()->with('success', 'Section status updated.');
    }

    public function destroySection(Section $section)
    {
        $section->delete();
        return back()->with('success', 'Section deleted successfully.');
    }

    public function enrollments(): Response
    {
        $enrollments = Enrollment::with(['student', 'section.course', 'section.faculty', 'grade'])
            ->orderByDesc('enrolled_at')
            ->get()
            ->map(fn($e) => [
                'id'           => $e->id,
                'student_name' => $e->student->full_name,
                'student_id'   => $e->student->student_id,
                'course_code'  => $e->section->course->code,
                'course_name'  => $e->section->course->name,
                'section_name' => $e->section->section_name,
                'faculty_name' => $e->section->faculty?->full_name ?? 'TBA',
                'school_year'  => $e->section->school_year,
                'semester'     => $e->section->semester,
                'status'       => $e->status,
                'enrolled_at'  => $e->enrolled_at,
                'has_grade'    => !!$e->grade,
            ]);

        $students = Student::where('status', 'active')->get(['id', 'student_id', 'first_name', 'last_name']);
        $sections = Section::with('course')->where('status', '!=', 'done')->get()->map(fn($s) => [
            'id'    => $s->id,
            'label' => "{$s->course->code} - {$s->section_name} ({$s->school_year} {$s->semester})",
        ]);

        return Inertia::render('auth/registrar/Enrollments', [
            'enrollments' => $enrollments,
            'students'    => $students->map(fn($s) => ['id' => $s->id, 'label' => "{$s->student_id} - {$s->first_name} {$s->last_name}"]),
            'sections'    => $sections,
            'flash'       => ['success' => session('success')],
        ]);
    }

    public function storeEnrollment(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'exists:students,id'],
            'section_id' => ['required', 'exists:sections,id'],
        ]);

        if (Enrollment::where('student_id', $validated['student_id'])
            ->where('section_id', $validated['section_id'])
            ->exists()) {
            return back()->withErrors(['student_id' => 'Student is already enrolled in this section.']);
        }

        Enrollment::create([
            'student_id'   => $validated['student_id'],
            'section_id'   => $validated['section_id'],
            'registrar_id' => $this->registrar()->id,
            'status'       => 'enrolled',
            'enrolled_at'  => now(),
        ]);

        return back()->with('success', 'Student enrolled successfully.');
    }

    public function destroyEnrollment(Enrollment $enrollment)
    {
        abort_if($enrollment->grade?->is_finalized, 403, 'Cannot remove a finalized enrollment.');
        $enrollment->delete();
        return back()->with('success', 'Enrollment removed.');
    }

    public function overrideGrade(Request $request, Enrollment $enrollment)
    {
        $registrar = $this->registrar();
        $validated = $request->validate([
            'score'   => ['required', 'numeric', 'min:0', 'max:100'],
            'remarks' => ['required', 'in:passed,failed,incomplete,dropped,withdrawn'],
            'reason'  => ['required', 'string', 'max:500'],
        ]);

        $computed = Grade::computeFromScore($validated['score']);

        DB::transaction(function () use ($enrollment, $registrar, $validated, $computed) {
            $oldGrade = $enrollment->grade;
            $grade = Grade::updateOrCreate(['enrollment_id' => $enrollment->id], [
                'registrar_id'   => $registrar->id,
                'score'          => $validated['score'],
                'letter_grade'   => $computed['letter'],
                'gpa_equivalent' => $computed['gpa'],
                'remarks'        => $validated['remarks'],
                'is_finalized'   => true,
                'submitted_at'   => now(),
            ]);

            GradeAuditLog::create([
                'grade_id'        => $grade->id,
                'enrollment_id'   => $enrollment->id,
                'changed_by_type' => 'registrar',
                'changed_by_id'   => $registrar->id,
                'old_score'       => $oldGrade?->score,
                'new_score'       => $validated['score'],
                'old_letter'      => $oldGrade?->letter_grade,
                'new_letter'      => $computed['letter'],
                'old_remarks'     => $oldGrade?->remarks,
                'new_remarks'     => $validated['remarks'],
                'reason'          => $validated['reason'],
                'changed_at'      => now(),
            ]);
        });

        return back()->with('success', 'Grade overridden and finalized.');
    }

    public function grades(): Response
    {
        $grades = Grade::with([
            'enrollment.student',
            'enrollment.section.course',
            'enrollment.section.faculty',
            'faculty',
        ])
        ->orderByDesc('submitted_at')
        ->get()
        ->map(fn($g) => [
            'id'             => $g->id,
            'enrollment_id'  => $g->enrollment_id,
            'student_name'   => $g->enrollment->student->full_name,
            'student_id'     => $g->enrollment->student->student_id,
            'course_code'    => $g->enrollment->section->course->code,
            'course_name'    => $g->enrollment->section->course->name,
            'section_name'   => $g->enrollment->section->section_name,
            'faculty_name'   => $g->faculty?->full_name ?? 'Registrar Override',
            'score'          => $g->score,
            'letter_grade'   => $g->letter_grade,
            'gpa_equivalent' => $g->gpa_equivalent,
            'remarks'        => $g->remarks,
            'is_finalized'   => $g->is_finalized,
            'submitted_at'   => $g->submitted_at,
        ]);

        return Inertia::render('auth/registrar/Grades', [
            'grades' => $grades,
            'flash'  => ['success' => session('success')],
        ]);
    }
}