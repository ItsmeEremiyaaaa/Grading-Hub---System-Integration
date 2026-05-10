<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): mixed
    {
        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                return match($guard) {
                    'faculty'   => redirect()->route('faculty.dashboard'),
                    'registrar' => redirect()->route('registrar.dashboard'),
                    'student'   => redirect()->route('student.dashboard'),
                    default     => redirect('/'),
                };
            }
        }

        return $next($request);
    }
}