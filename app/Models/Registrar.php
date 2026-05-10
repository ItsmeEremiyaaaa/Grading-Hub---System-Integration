<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registrar extends Authenticatable {
    use Notifiable;

    protected $guard = 'registrar';

    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'password',
        'role',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array {
        return [
            'password' => 'hashed',
        ];
    }

    public function getFullNameAttribute(): string {
        return "{$this->first_name} {$this->last_name}";
    }

    public function enrollments(): HasMany {
        return $this->hasMany(Enrollment::class);
    }

    public function isAdmin(): bool {
        return $this->role === 'admin';
    }
}