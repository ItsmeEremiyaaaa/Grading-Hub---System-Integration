<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class FacultyAuthController extends Controller {

    public function showLoginForm(): Response {
        return Inertia::render('faculty/TeachersLogin');
    }

    public function login(Request $request) {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Clear any other guard sessions first
        Auth::guard('student')->logout();
        Auth::guard('registrar')->logout();

        if (Auth::guard('faculty')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('faculty.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function showRegisterForm(): Response {
        return Inertia::render('faculty/FacultyRegister');
    }

    public function register(Request $request) {
        $data = $request->validate([
            'employee_id'          => ['required', 'string', 'unique:faculty,employee_id'],
            'first_name'           => ['required', 'string', 'max:255'],
            'last_name'            => ['required', 'string', 'max:255'],
            'email'                => ['required', 'email', 'unique:faculty,email'],
            'department'           => ['required', 'string'],
            'position'             => ['required', 'string'],
            'password'             => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        Faculty::create([
            'employee_id' => $data['employee_id'],
            'first_name'  => $data['first_name'],
            'last_name'   => $data['last_name'],
            'email'       => $data['email'],
            'department'  => $data['department'],
            'position'    => $data['position'],
            'password'    => Hash::make($data['password']),
        ]);

        return redirect()->route('faculty.login')->with('success', 'Account created! You can now log in.');
    }

    public function logout(Request $request) {
        Auth::guard('faculty')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('faculty.login');
    }
}