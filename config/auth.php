<?php

return [
    'defaults' => [
        'guard'     => 'web',
        'passwords' => 'users',
    ],

    'guards' => [
        'web' => [
            'driver'   => 'session',
            'provider' => 'users',
        ],
        'student' => [
            'driver'   => 'session',
            'provider' => 'students',
        ],
        'faculty' => [
            'driver'   => 'session',
            'provider' => 'faculty',
        ],
        'registrar' => [
            'driver'   => 'session',
            'provider' => 'registrars',
        ],
    ],

    'providers' => [
        'users' => [
            'driver' => 'eloquent',
            'model'  => App\Models\User::class,
        ],
        'students' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Student::class,
        ],
        'faculty' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Faculty::class,
        ],
        'registrars' => [
            'driver' => 'eloquent',
            'model'  => App\Models\Registrar::class,
        ],
    ],

    'passwords' => [
        'users' => [
            'provider' => 'users',
            'table'    => env('AUTH_PASSWORD_RESET_TOKEN_TABLE', 'password_reset_tokens'),
            'expire'   => 60,
            'throttle' => 60,
        ],
        'students' => [
            'provider' => 'students',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
        'faculty' => [
            'provider' => 'faculty',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
        'registrars' => [
            'provider' => 'registrars',
            'table'    => 'password_reset_tokens',
            'expire'   => 60,
            'throttle' => 60,
        ],
    ],

    'password_timeout' => 10800,
];