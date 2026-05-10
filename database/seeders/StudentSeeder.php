<?php

namespace Database\Seeders;

use App\Models\Student;
use Illuminate\Database\Seeder;

class StudentSeeder extends Seeder {
    public function run(): void {
        Student::create([
            'student_id' => '2024-00001',
            'first_name' => 'Juan',
            'last_name'  => 'Dela Cruz',
            'email'      => 'juan@student.com',
            'password'   => bcrypt('password'),
            'course'     => 'BSIT',
            'year_level' => 1,
            'status'     => 'active',
        ]);
    }
}