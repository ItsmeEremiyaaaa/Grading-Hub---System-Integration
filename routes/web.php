<?php

use App\Http\Controllers\Auth\FacultyAuthController;
use App\Http\Controllers\Auth\RegistrarAuthController;
use App\Http\Controllers\Auth\StudentAuthController;
use App\Http\Controllers\FacultyController;
use App\Http\Controllers\RegistrarController;
use App\Http\Controllers\StudentController;
use Illuminate\Support\Facades\Route;

Route::get('/', fn() => redirect()->route('student.login'));

// ══════════════════════════════════════════════════════════════════════════════
// STUDENT ROUTES
// ══════════════════════════════════════════════════════════════════════════════

Route::prefix('student')->name('student.')->group(function () {

    Route::middleware('guest:student')->group(function () {
        Route::get('/login',     [StudentAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login',    [StudentAuthController::class, 'login'])->name('login.post');
        Route::get('/register',  [StudentAuthController::class, 'showRegisterForm'])->name('register');
        Route::post('/register', [StudentAuthController::class, 'register'])->name('register.post');
    });

    Route::post('/logout', [StudentAuthController::class, 'logout'])
        ->name('logout')->middleware('auth:student');

    Route::middleware('auth:student')->group(function () {
        Route::get('/dashboard',  [StudentController::class, 'dashboard'])->name('dashboard');
        Route::get('/grades',     [StudentController::class, 'grades'])->name('grades');
        Route::get('/transcript', [StudentController::class, 'transcript'])->name('transcript');
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// FACULTY ROUTES
// ══════════════════════════════════════════════════════════════════════════════

Route::prefix('faculty')->name('faculty.')->group(function () {

    Route::middleware('guest:faculty')->group(function () {
        Route::get('/login',     [FacultyAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login',    [FacultyAuthController::class, 'login'])->name('login.post');
        Route::get('/register',  [FacultyAuthController::class, 'showRegisterForm'])->name('register');
        Route::post('/register', [FacultyAuthController::class, 'register'])->name('register.post');
    });

    Route::post('/logout', [FacultyAuthController::class, 'logout'])
        ->name('logout')->middleware('auth:faculty');

    Route::middleware('auth:faculty')->group(function () {
        Route::get('/dashboard',              [FacultyController::class, 'dashboard'])->name('dashboard');
        Route::get('/sections',               [FacultyController::class, 'sections'])->name('sections');
        Route::get('/grades',                 [FacultyController::class, 'grades'])->name('grades');
        Route::get('/students',               [FacultyController::class, 'students'])->name('students');
        Route::get('/sections/{section}',     [FacultyController::class, 'section'])->name('section');
        Route::post('/grades/{enrollment}',   [FacultyController::class, 'submitGrade'])->name('grade.submit');
        Route::post('/grades/bulk/{section}', [FacultyController::class, 'submitBulkGrades'])->name('grade.bulk');
    });
});

// ══════════════════════════════════════════════════════════════════════════════
// REGISTRAR (ADMIN) ROUTES
// ══════════════════════════════════════════════════════════════════════════════

Route::prefix('registrar')->name('registrar.')->group(function () {

    Route::middleware('guest:registrar')->group(function () {
        Route::get('/login',  [RegistrarAuthController::class, 'showLoginForm'])->name('login');
        Route::post('/login', [RegistrarAuthController::class, 'login'])->name('login.post');
    });

    Route::post('/logout', [RegistrarAuthController::class, 'logout'])
        ->name('logout')->middleware('auth:registrar');

    Route::middleware('auth:registrar')->group(function () {
        Route::get('/dashboard', [RegistrarController::class, 'dashboard'])->name('dashboard');

        // ── Students ──────────────────────────────────────────────────────────
        Route::get('/students',                     [RegistrarController::class, 'students'])->name('students');
        Route::post('/students',                    [RegistrarController::class, 'storeStudent'])->name('students.store');
        Route::put('/students/{student}',           [RegistrarController::class, 'updateStudent'])->name('students.update');
        Route::delete('/students/{student}',        [RegistrarController::class, 'destroyStudent'])->name('students.destroy');
        Route::patch('/students/{student}/approve', [RegistrarController::class, 'approveStudent'])->name('students.approve');

        // ── Faculty ───────────────────────────────────────────────────────────
        Route::get('/faculty',              [RegistrarController::class, 'faculty'])->name('faculty');
        Route::post('/faculty',             [RegistrarController::class, 'storeFaculty'])->name('faculty.store');
        Route::put('/faculty/{faculty}',    [RegistrarController::class, 'updateFaculty'])->name('faculty.update');
        Route::delete('/faculty/{faculty}', [RegistrarController::class, 'destroyFaculty'])->name('faculty.destroy');

        // ── Courses ───────────────────────────────────────────────────────────
        Route::get('/courses',              [RegistrarController::class, 'courses'])->name('courses');
        Route::post('/courses',             [RegistrarController::class, 'storeCourse'])->name('courses.store');
        Route::put('/courses/{course}',     [RegistrarController::class, 'updateCourse'])->name('courses.update');
        Route::delete('/courses/{course}',  [RegistrarController::class, 'destroyCourse'])->name('courses.destroy');

        // ── Sections ──────────────────────────────────────────────────────────
        Route::get('/sections',                  [RegistrarController::class, 'sections'])->name('sections');
        Route::post('/sections',                 [RegistrarController::class, 'storeSection'])->name('sections.store');
        Route::patch('/sections/{section}/status', [RegistrarController::class, 'updateSectionStatus'])->name('sections.status');
        Route::delete('/sections/{section}',     [RegistrarController::class, 'destroySection'])->name('sections.destroy');

        // ── Enrollments ───────────────────────────────────────────────────────
        Route::get('/enrollments',                 [RegistrarController::class, 'enrollments'])->name('enrollments');
        Route::post('/enrollments',                [RegistrarController::class, 'storeEnrollment'])->name('enrollments.store');
        Route::delete('/enrollments/{enrollment}', [RegistrarController::class, 'destroyEnrollment'])->name('enrollments.destroy');

        // ── Grades ────────────────────────────────────────────────────────────
        Route::get('/grades',                        [RegistrarController::class, 'grades'])->name('grades');
        Route::post('/grades/override/{enrollment}', [RegistrarController::class, 'overrideGrade'])->name('grades.override');
    });
});