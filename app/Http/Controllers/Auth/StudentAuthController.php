<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class StudentAuthController extends Controller
{
    public function showLoginForm(): Response
    {
        return Inertia::render('student/StudentLogin');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Clear any other guard sessions first
        Auth::guard('faculty')->logout();
        Auth::guard('registrar')->logout();

        if (Auth::guard('student')->attempt($credentials, $request->boolean('remember'))) {
            $student = Auth::guard('student')->user();

            if ($student->status !== 'active') {
                Auth::guard('student')->logout();
                return back()->withErrors([
                    'email' => 'Your account is pending approval. Please wait for the registrar to activate it.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();
            return redirect()->intended(route('student.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function showRegisterForm(): Response
    {
        return Inertia::render('student/StudentRegister');
    }

    public function register(Request $request)
    {
        $validated = $request->validate([
            'student_id' => ['required', 'string', 'max:20', 'unique:students,student_id'],
            'first_name' => ['required', 'string', 'max:100'],
            'last_name'  => ['required', 'string', 'max:100'],
            'email'      => ['required', 'email', 'max:255', 'unique:students,email'],
            'course'     => ['required', 'string', 'max:150'],
            'year_level' => ['required', 'string', 'max:20'],
            'password'   => ['required', 'confirmed', Password::min(8)],
        ]);

        $yearLevelMap = [
            '1st Year' => 1,
            '2nd Year' => 2,
            '3rd Year' => 3,
            '4th Year' => 4,
        ];

        Student::create([
            'student_id' => $validated['student_id'],
            'first_name' => $validated['first_name'],
            'last_name'  => $validated['last_name'],
            'email'      => $validated['email'],
            'course'     => $validated['course'],
            'year_level' => $yearLevelMap[$validated['year_level']] ?? null,
            'password'   => Hash::make($validated['password']),
            'status'     => 'inactive',
        ]);

        return redirect()->route('student.register')
            ->with('success', 'Registration submitted! Please wait for the registrar to approve your account.');
    }

    public function logout(Request $request)
    {
        Auth::guard('student')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('student.login');
    }
}