<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Faculty extends Authenticatable {
    use Notifiable;

    protected $table = 'faculty';

    protected $fillable = [
        'employee_id',
        'first_name',
        'last_name',
        'email',
        'department',
        'position',
        'password',  // ← required for Auth::attempt() and Hash::make()
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

    // ── Accessors ──────────────────────────────────────────────────────────────

    public function getFullNameAttribute(): string {
        return "{$this->first_name} {$this->last_name}";
    }

    public function getFacultyIdAttribute(): string {
        return $this->employee_id;
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function sections() {
        return $this->hasMany(Section::class, 'faculty_id');
    }
}