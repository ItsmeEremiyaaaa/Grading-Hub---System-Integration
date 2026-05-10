<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Registrar;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class RegistrarAuthController extends Controller {

    public function showLoginForm(): Response {
        return Inertia::render('auth/registrar/RegistrarLogin');
    }

    public function login(Request $request) {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required'],
        ]);

        // Clear any other guard sessions first
        Auth::guard('student')->logout();
        Auth::guard('faculty')->logout();

        if (Auth::guard('registrar')->attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended(route('registrar.dashboard'));
        }

        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    public function logout(Request $request) {
        Auth::guard('registrar')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect()->route('registrar.login');
    }
}