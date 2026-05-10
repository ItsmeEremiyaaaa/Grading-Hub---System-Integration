<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Course extends Model {

    protected $fillable = [
        'code',
        'name',
        'description',
        'units',
        'department',
        'status',
    ];

    /** A course can have many sections (different semesters, different faculty). */
    public function sections(): HasMany {
        return $this->hasMany(Section::class);
    }

    /** All enrollments for this course across all sections. */
    public function enrollments() {
        return $this->hasManyThrough(Enrollment::class, Section::class);
    }

    public function isActive(): bool {
        return $this->status === 'active';
    }
}