<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Registrar;
use App\Models\Teacher;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder {
    public function run(): void {

        // ── Default Registrar account ─────────────────────────────────────────
        Registrar::create([
            'employee_id' => 'REG-2020-001',
            'first_name'  => 'Maria',
            'last_name'   => 'Reyes',
            'email'       => 'registrar@smcbi.com',
            'password'    => Hash::make('password'),
            'role'        => 'registrar',
            'status'      => 'active',
        ]);

        // ── Default Admin account ─────────────────────────────────────────────
        Registrar::create([
            'employee_id' => 'ADM-2020-001',
            'first_name'  => 'System',
            'last_name'   => 'Admin',
            'email'       => 'admin@smcbi.com',
            'password'    => Hash::make('password'),
            'role'        => 'admin',
            'status'      => 'active',
        ]);

        // ── Sample Teachers ───────────────────────────────────────────────────
        Teacher::create([
            'employee_id' => 'EMP-2021-001',
            'first_name'  => 'Jose',
            'last_name'   => 'Santos',
            'email'       => 'j.santos@smcbi.com',
            'password'    => Hash::make('password'),
            'department'  => 'College of Information Technology',
            'position'    => 'Instructor I',
            'status'      => 'active',
        ]);

        Teacher::create([
            'employee_id' => 'EMP-2021-002',
            'first_name'  => 'Ana',
            'last_name'   => 'Cruz',
            'email'       => 'a.cruz@smcbi.com',
            'password'    => Hash::make('password'),
            'department'  => 'College of Information Technology',
            'position'    => 'Instructor II',
            'status'      => 'active',
        ]);

        // ── Sample Courses ────────────────────────────────────────────────────
        $courses = [
            ['code' => 'CC101',   'name' => 'Introduction to Computing',           'units' => 3],
            ['code' => 'CC102',   'name' => 'Computer Programming 1',              'units' => 3],
            ['code' => 'CC103',   'name' => 'Computer Programming 2',              'units' => 3],
            ['code' => 'IT201',   'name' => 'Data Structures and Algorithms',      'units' => 3],
            ['code' => 'IT202',   'name' => 'Database Management Systems',         'units' => 3],
            ['code' => 'IT301',   'name' => 'Systems Analysis and Design',         'units' => 3],
            ['code' => 'IT302',   'name' => 'Web Development',                     'units' => 3],
            ['code' => 'IT401',   'name' => 'Capstone Project 1',                  'units' => 3],
            ['code' => 'MATH101', 'name' => 'Mathematics in the Modern World',     'units' => 3],
            ['code' => 'GE101',   'name' => 'Understanding the Self',              'units' => 3],
        ];

        foreach ($courses as $course) {
            Course::create([
                'code'       => $course['code'],
                'name'       => $course['name'],
                'units'      => $course['units'],
                'department' => 'College of Information Technology',
                'status'     => 'active',
            ]);
        }
    }
}