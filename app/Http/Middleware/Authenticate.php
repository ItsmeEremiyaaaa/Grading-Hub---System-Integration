<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;

class Authenticate extends Middleware
{
    protected function redirectTo(Request $request): ?string
    {
        if ($request->expectsJson()) return null;

        if ($request->is('faculty/*'))   return route('faculty.login');
        if ($request->is('registrar/*')) return route('registrar.login');

        return route('student.login');
    }
}