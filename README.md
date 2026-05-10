# GradeHub - Grading System Integration

## Complete README Documentation

---

# 📚 GradeHub

### A Comprehensive School Registrar Management System

![Version](https://img.shields.io/badge/version-1.1-blue.svg)
![Laravel](https://img.shields.io/badge/Laravel-11.x-red.svg)
![React](https://img.shields.io/badge/React-18.x-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178c6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.x-38bdf8.svg)
![PHP](https://img.shields.io/badge/PHP-8.2-777bb4.svg)
![MySQL](https://img.shields.io/badge/MySQL-10.4-4479a1.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [Installation Guide](#installation-guide)
- [Project Structure](#project-structure)
- [Modules Documentation](#modules-documentation)
- [API Endpoints](#api-endpoints)
- [User Guide](#user-guide)
- [Security Features](#security-features)
- [Testing](#testing)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**GradeHub** is a comprehensive **School Registrar Management System** built with Laravel, React, and Inertia.js. It provides a complete solution for managing students, faculty, courses, sections, enrollments, and grades with an intuitive, modern dashboard interface.

### Key Statistics
- **7 Main Modules** fully functional
- **15 Database Tables** with relationships
- **React + TypeScript** frontend
- **Dark/Light Theme** support
- **Interactive Charts** (Donut, Bar, Radial Progress)

### Purpose
This system streamlines academic administration by centralizing all registrar operations into a single, user-friendly platform. It eliminates manual paper trails, reduces errors, and provides real-time analytics for better decision-making.

---

## ✨ Features

### 📊 Dashboard Analytics
| Feature | Description |
|---------|-------------|
| Stat Cards | 6 real-time metrics (Students, Faculty, Courses, Sections, Enrollments, Pending items) |
| Donut Chart | System composition breakdown |
| Bar Chart | Grade distribution from pending submissions |
| Radial Progress | Enrollment funnel tracking (Students → Enrolled → Graded) |
| Pending Approvals | List of students awaiting approval |
| Grade Submissions | List of grades pending review |
| Theme Toggle | Dark/Light mode with localStorage persistence |

### 👨‍🎓 Student Management
| Feature | Description |
|---------|-------------|
| Directory | Complete student list with search and filters |
| Filters | Search by name/ID/email, Year level (1st-4th), Status |
| Charts | Year level distribution (donut), Status distribution (bar) |
| CRUD | Add, Edit, Delete, Approve pending students |
| Enrollments | Track student enrollment count |
| Modals | Clean modal interface for forms |

### 👨‍🏫 Faculty Management
| Feature | Description |
|---------|-------------|
| Directory | Card-based grid view with faculty profiles |
| Filters | Search by name/ID/email, Department |
| Charts | Department distribution (donut), Section load (bar) |
| CRUD | Add, Edit, Delete faculty members |
| Assignments | Track sections assigned to each faculty |

### 📚 Course Management
| Feature | Description |
|---------|-------------|
| Catalog | Complete course listing with search |
| Charts | Department distribution (donut), Unit distribution (bar) |
| CRUD | Add, Edit, Delete, Toggle active/inactive status |
| Sections | Track number of sections per course |

### 🗂️ Section Management
| Feature | Description |
|---------|-------------|
| Listings | Sections with course, faculty, schedule info |
| Filters | Search, Status filter (open/closed/grading/done) |
| Charts | Status distribution (donut), Semester distribution (donut) |
| CRUD | Create section, Update status (inline dropdown), Delete |
| Assignment | Assign faculty to sections |

### 📝 Enrollment Management
| Feature | Description |
|---------|-------------|
| Records | Complete enrollment history |
| Filters | Search, Semester filter (1st/2nd/Summer), Status filter |
| Charts | Status distribution (donut), Semester distribution (donut) |
| Funnel | Progress tracking: Total → Active → Graded |
| Actions | Enroll student, Remove enrollment |
| Tracking | Grade status indicators (Graded/Pending) |

### 🎓 Grade Management
| Feature | Description |
|---------|-------------|
| Records | All grade submissions with details |
| Filters | Search, Status (finalized/pending), Grade letter |
| Charts | Grade distribution (1.00-5.00 donut), Remarks analysis (bar) |
| Funnel | Review progress: Submitted → Finalized → Pending |
| Review Modal | Finalize as-is OR Override with audit trail |
| Audit Trail | Required reason for any changes |

### 🎨 UI/UX Features
- ✅ Dark/Light theme with localStorage persistence
- ✅ Responsive design for all screen sizes
- ✅ Interactive charts with hover animations
- ✅ Real-time search with instant filtering
- ✅ Advanced filters per module
- ✅ Modal forms for all CRUD operations
- ✅ Confirmation dialogs for destructive actions
- ✅ Flash messages for user feedback
- ✅ Collapsible sidebar navigation
- ✅ Loading states and disabled buttons during submissions

---

## 🛠️ Technology Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Laravel | 11.x | PHP Framework |
| PHP | 8.2.12 | Programming Language |
| MySQL | 10.4.32 | Database |
| Laravel Sanctum | Latest | API Authentication |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.x | UI Library |
| TypeScript | 5.x | Type Safety |
| Inertia.js | Latest | Monolithic SPA |
| Tailwind CSS | 3.x | Styling |
| Heroicons | Latest | Icons |

### Development Tools
| Tool | Purpose |
|------|---------|
| Composer | PHP Dependency Manager |
| NPM | Node Package Manager |
| Vite | Build Tool |
| Laravel Mix | Asset Compilation |

---

## 🗄️ Database Schema

### Database Name: `gtms`

### Tables Overview

| Table | Description | Records (Sample) |
|-------|-------------|------------------|
| `users` | Laravel default users | 1 |
| `registrars` | Registrar/Admin accounts | 1 |
| `students` | Student accounts | 1 |
| `faculty` | Faculty member accounts | 1 |
| `courses` | Course offerings | 1 |
| `sections` | Course sections | 1 |
| `enrollments` | Student enrollments | 1 |
| `grades` | Grade records | 1 |
| `grade_audit_logs` | Grade change history | 2 |
| `cache` | Laravel cache | 0 |
| `cache_locks` | Cache locking | 0 |
| `failed_jobs` | Failed queue jobs | 0 |
| `jobs` | Queue jobs | 0 |
| `job_batches` | Batch jobs | 0 |
| `migrations` | Laravel migrations | 15 |
| `password_reset_tokens` | Password reset tracking | 0 |
| `sessions` | User sessions | 1 |

### Table Relationships

```sql
-- Student to Enrollment (One-to-Many)
students.id → enrollments.student_id

-- Section to Enrollment (One-to-Many)
sections.id → enrollments.section_id

-- Course to Section (One-to-Many)
courses.id → sections.course_id

-- Faculty to Section (One-to-Many)
faculty.id → sections.faculty_id

-- Enrollment to Grade (One-to-One)
enrollments.id → grades.enrollment_id

-- Grade to Audit Log (One-to-Many)
grades.id → grade_audit_logs.grade_id
```

### Key Columns

#### students
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| student_id | varchar(255) | Unique student ID |
| first_name | varchar(255) | First name |
| last_name | varchar(255) | Last name |
| email | varchar(255) | Unique email |
| password | varchar(255) | Hashed password |
| course | varchar(255) | Course enrolled |
| year_level | int(11) | Year level (1-4) |
| status | enum('active','inactive') | Account status |

#### faculty
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| employee_id | varchar(255) | Unique employee ID |
| first_name | varchar(255) | First name |
| last_name | varchar(255) | Last name |
| email | varchar(255) | Unique email |
| department | varchar(255) | Department |
| position | varchar(255) | Job title |
| password | varchar(255) | Hashed password |

#### courses
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| code | varchar(20) | Unique course code |
| name | varchar(150) | Course name |
| description | text | Course description |
| units | tinyint(3) UNSIGNED | Credit units (1-6) |
| department | varchar(150) | Department |
| status | enum('active','inactive') | Course status |

#### sections
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| course_id | bigint(20) UNSIGNED | Foreign key to courses |
| faculty_id | bigint(20) UNSIGNED | Foreign key to faculty |
| section_name | varchar(50) | Section identifier |
| school_year | varchar(20) | Academic year |
| semester | enum('1st','2nd','Summer') | Semester |
| status | enum('open','closed','grading','done') | Section status |

#### enrollments
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| student_id | bigint(20) UNSIGNED | Foreign key to students |
| section_id | bigint(20) UNSIGNED | Foreign key to sections |
| registrar_id | bigint(20) UNSIGNED | Foreign key to registrars |
| status | enum('enrolled','dropped','incomplete') | Enrollment status |
| enrolled_at | timestamp | Enrollment date |

#### grades
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| enrollment_id | bigint(20) UNSIGNED | Foreign key to enrollments |
| faculty_id | bigint(20) UNSIGNED | Foreign key to faculty |
| registrar_id | bigint(20) UNSIGNED | Foreign key to registrars |
| prelim | decimal(5,2) | Prelim grade |
| midterm | decimal(5,2) | Midterm grade |
| finals | decimal(5,2) | Finals grade |
| score | decimal(5,2) | Computed total score |
| letter_grade | varchar(5) | Letter grade (1.00-5.00) |
| gpa_equivalent | decimal(3,2) | GPA equivalent |
| remarks | enum(...) | Passed/Failed/etc |
| is_finalized | tinyint(1) | Finalized flag |

#### grade_audit_logs
| Column | Type | Description |
|--------|------|-------------|
| id | bigint(20) UNSIGNED | Primary key |
| grade_id | bigint(20) UNSIGNED | Foreign key to grades |
| enrollment_id | bigint(20) UNSIGNED | Foreign key to enrollments |
| changed_by_type | varchar(20) | 'faculty' or 'registrar' |
| changed_by_id | bigint(20) UNSIGNED | ID of who changed |
| old_score | decimal(5,2) | Previous score |
| new_score | decimal(5,2) | New score |
| old_letter | varchar(5) | Previous grade |
| new_letter | varchar(5) | New grade |
| old_remarks | varchar(20) | Previous remarks |
| new_remarks | varchar(20) | New remarks |
| reason | text | Reason for change |
| changed_at | timestamp | Change timestamp |

---

## 🚀 Installation Guide

### Prerequisites

| Requirement | Minimum Version |
|-------------|-----------------|
| PHP | 8.1+ |
| Composer | 2.x |
| Node.js | 18.x |
| MySQL | 5.7+ / MariaDB 10.4+ |
| NPM | 9.x |

### Step-by-Step Installation

#### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/gradehub.git
cd gradehub
```

#### 2. Install Backend Dependencies
```bash
composer install
```

#### 3. Environment Configuration
```bash
cp .env.example .env
php artisan key:generate
```

Edit `.env` file:
```env
APP_NAME=GradeHub
APP_URL=http://localhost:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=gtms
DB_USERNAME=root
DB_PASSWORD=yourpassword

SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:8000
```

#### 4. Database Setup
```bash
# Create database manually in phpMyAdmin or MySQL:
# CREATE DATABASE gtms;

# Run migrations
php artisan migrate

# Run seeders (optional - for sample data)
php artisan db:seed
```

#### 5. Install Frontend Dependencies
```bash
npm install
```

#### 6. Build Assets
```bash
# For development (with hot reload)
npm run dev

# For production
npm run build
```

#### 7. Start the Application
```bash
php artisan serve
```

Access the application at: **http://localhost:8000**

### Default Login Credentials

#### Registrar Account
```
Email: test1@smcbi.edu.ph
Password: password
Role: Admin
```

#### Faculty Account (if seeded)
```
Email: Rhyvencaballero@smcbi.edu.ph
Password: password
Role: Faculty
```

#### Student Account (if seeded)
```
Email: Jeremiahescubido@smcbi.edu.ph
Password: password
Role: Student
```

---

## 📁 Project Structure

```
GradeHub/
│
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   │   └── Registrar/
│   │   │       ├── DashboardController.php
│   │   │       ├── StudentController.php
│   │   │       ├── FacultyController.php
│   │   │       ├── CourseController.php
│   │   │       ├── SectionController.php
│   │   │       ├── EnrollmentController.php
│   │   │       └── GradeController.php
│   │   ├── Middleware/
│   │   │   ├── Authenticate.php
│   │   │   └── IsRegistrar.php
│   │   └── Kernel.php
│   ├── Models/
│   │   ├── User.php
│   │   ├── Registrar.php
│   │   ├── Student.php
│   │   ├── Faculty.php
│   │   ├── Course.php
│   │   ├── Section.php
│   │   ├── Enrollment.php
│   │   ├── Grade.php
│   │   └── GradeAuditLog.php
│   └── Providers/
│
├── database/
│   ├── migrations/
│   │   ├── 0001_01_01_000000_create_users_table.php
│   │   ├── 2026_03_29_134630_create_students_table.php
│   │   ├── 2026_04_25_020837_create_faculty_table.php
│   │   ├── 2026_04_25_020842_create_registrars_table.php
│   │   ├── 2026_04_25_020845_create_courses_table.php
│   │   ├── 2026_04_25_020850_create_sections_table.php
│   │   ├── 2026_04_25_020853_create_enrollments_table.php
│   │   ├── 2026_04_25_020858_create_grades_table.php
│   │   ├── 2026_04_25_020903_create_grade_audit_logs_table.php
│   │   └── 2026_05_10_150311_add_prelim_midterm_finals_to_grades_table.php
│   ├── seeders/
│   │   ├── DatabaseSeeder.php
│   │   ├── RegistrarSeeder.php
│   │   ├── StudentSeeder.php
│   │   └── FacultySeeder.php
│   └── factories/
│
├── resources/
│   └── js/
│       ├── pages/
│       │   └── auth/
│       │       └── registrar/
│       │           ├── Dashboard.tsx
│       │           ├── Students.tsx
│       │           ├── Faculty.tsx
│       │           ├── Courses.tsx
│       │           ├── Sections.tsx
│       │           ├── Enrollments.tsx
│       │           └── Grades.tsx
│       ├── components/
│       │   ├── Layouts/
│       │   │   └── RegistrarLayout.tsx
│       │   └── UI/
│       │       ├── DonutChart.tsx
│       │       ├── BarChart.tsx
│       │       └── RadialProgress.tsx
│       ├── types/
│       │   └── index.ts
│       ├── app.tsx
│       └── router.tsx
│
├── routes/
│   ├── web.php
│   ├── api.php
│   └── console.php
│
├── public/
│   ├── index.php
│   ├── css/
│   └── js/
│
├── tests/
│   ├── Feature/
│   └── Unit/
│
├── .env.example
├── .gitignore
├── composer.json
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.js
└── README.md
```

---

## 📦 Modules Documentation

### 1. Dashboard Module
**File:** `Dashboard.tsx`  
**Route:** `/registrar/dashboard`

| Component | Description |
|-----------|-------------|
| Welcome Banner | Personalized greeting with date |
| Stat Cards | 6 key metrics with gradients |
| Donut Chart | System composition |
| Bar Chart | Grade distribution |
| Radial Progress | Enrollment funnel |
| Pending Approvals | List of students |
| Grade Submissions | List of grades |

### 2. Students Module
**File:** `Students.tsx`  
**Route:** `/registrar/students`

| Action | Method | Endpoint |
|--------|--------|----------|
| List students | GET | `/registrar/students` |
| Add student | POST | `/registrar/students` |
| Edit student | PUT | `/registrar/students/{id}` |
| Delete student | DELETE | `/registrar/students/{id}` |
| Approve student | PATCH | `/registrar/students/{id}/approve` |

### 3. Faculty Module
**File:** `Faculty.tsx`  
**Route:** `/registrar/faculty`

| Action | Method | Endpoint |
|--------|--------|----------|
| List faculty | GET | `/registrar/faculty` |
| Add faculty | POST | `/registrar/faculty` |
| Edit faculty | PUT | `/registrar/faculty/{id}` |
| Delete faculty | DELETE | `/registrar/faculty/{id}` |

### 4. Courses Module
**File:** `Courses.tsx`  
**Route:** `/registrar/courses`

| Action | Method | Endpoint |
|--------|--------|----------|
| List courses | GET | `/registrar/courses` |
| Add course | POST | `/registrar/courses` |
| Edit course | PUT | `/registrar/courses/{id}` |
| Delete course | DELETE | `/registrar/courses/{id}` |

### 5. Sections Module
**File:** `Sections.tsx`  
**Route:** `/registrar/sections`

| Action | Method | Endpoint |
|--------|--------|----------|
| List sections | GET | `/registrar/sections` |
| Create section | POST | `/registrar/sections` |
| Update status | PATCH | `/registrar/sections/{id}/status` |
| Delete section | DELETE | `/registrar/sections/{id}` |

### 6. Enrollments Module
**File:** `Enrollments.tsx`  
**Route:** `/registrar/enrollments`

| Action | Method | Endpoint |
|--------|--------|----------|
| List enrollments | GET | `/registrar/enrollments` |
| Create enrollment | POST | `/registrar/enrollments` |
| Delete enrollment | DELETE | `/registrar/enrollments/{id}` |

### 7. Grades Module
**File:** `Grades.tsx`  
**Route:** `/registrar/grades`

| Action | Method | Endpoint |
|--------|--------|----------|
| List grades | GET | `/registrar/grades` |
| Finalize/Override | POST | `/registrar/grades/override/{enrollment_id}` |

---

## 🔌 API Endpoints

### Registrar Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/registrar/dashboard` | Dashboard view |
| GET | `/registrar/students` | Student listing |
| POST | `/registrar/students` | Create student |
| PUT | `/registrar/students/{id}` | Update student |
| DELETE | `/registrar/students/{id}` | Delete student |
| PATCH | `/registrar/students/{id}/approve` | Approve student |
| GET | `/registrar/faculty` | Faculty listing |
| POST | `/registrar/faculty` | Create faculty |
| PUT | `/registrar/faculty/{id}` | Update faculty |
| DELETE | `/registrar/faculty/{id}` | Delete faculty |
| GET | `/registrar/courses` | Course listing |
| POST | `/registrar/courses` | Create course |
| PUT | `/registrar/courses/{id}` | Update course |
| DELETE | `/registrar/courses/{id}` | Delete course |
| GET | `/registrar/sections` | Section listing |
| POST | `/registrar/sections` | Create section |
| PATCH | `/registrar/sections/{id}/status` | Update section status |
| DELETE | `/registrar/sections/{id}` | Delete section |
| GET | `/registrar/enrollments` | Enrollment listing |
| POST | `/registrar/enrollments` | Create enrollment |
| DELETE | `/registrar/enrollments/{id}` | Delete enrollment |
| GET | `/registrar/grades` | Grade listing |
| POST | `/registrar/grades/override/{enrollment_id}` | Finalize/Override grade |
| POST | `/registrar/logout` | Logout |

---

## 👤 User Guide

### Registrar User Guide

#### Dashboard
1. **View Statistics** - See key metrics at a glance
2. **Monitor Pending Items** - Check students and grades needing attention
3. **Access Charts** - Review system composition and grade distribution
4. **Quick Actions** - Use welcome banner buttons for pending approvals

#### Managing Students
1. **Add Student** - Click "+ Add Student", fill form, submit
2. **Edit Student** - Click "Edit" on any row, modify details
3. **Approve Student** - Click "Approve" for pending students
4. **Delete Student** - Click "Remove" and confirm
5. **Filter Students** - Use search bar and dropdown filters
6. **View Charts** - Check year level and status distributions

#### Managing Faculty
1. **Add Faculty** - Click "+ Add Faculty", complete the form
2. **Edit Faculty** - Click "Edit" on faculty card
3. **Delete Faculty** - Click "Remove" and confirm
4. **Filter Faculty** - Use search and department filters
5. **View Charts** - Review department and section load distributions

#### Managing Courses
1. **Add Course** - Click "+ Add Course", enter details
2. **Edit Course** - Click "Edit" on course row
3. **Delete Course** - Click "Delete" and confirm
4. **Search Courses** - Use search bar
5. **View Charts** - Check department and unit distributions

#### Managing Sections
1. **Create Section** - Click "+ Create Section", select course, faculty, name
2. **Update Status** - Use dropdown in Actions column
3. **Delete Section** - Click "Delete" and confirm
4. **Filter Sections** - Use search and status filters

#### Managing Enrollments
1. **Enroll Student** - Click "+ Enroll Student", select student and section
2. **Remove Enrollment** - Click "Remove" and confirm
3. **Filter Enrollments** - Use search, semester, and status filters
4. **Track Progress** - Check grade status indicators

#### Managing Grades
1. **Review Grade** - Click "Review" on any grade row
2. **Finalize As-Is** - Accept faculty-submitted grade, add reason
3. **Override Grade** - Enter new score and remarks, add reason
4. **Filter Grades** - Use search, status, and grade letter filters
5. **View Charts** - Check grade distribution and remarks analysis

---

## 🔒 Security Features

| Feature | Implementation |
|---------|----------------|
| Authentication | Laravel Breeze / Jetstream |
| Authorization | Role-based middleware |
| CSRF Protection | Automatic on all forms |
| XSS Prevention | React escapes by default |
| SQL Injection | Eloquent ORM with parameter binding |
| Password Hashing | bcrypt (10+ rounds) |
| Session Security | Laravel session management |
| Input Validation | Server-side validation rules |
| Audit Trail | Grade changes logged with reason |

### Role Hierarchy
```
Admin (Registrar)
    ├── Full access to all modules
    ├── Can approve students
    ├── Can finalize/override grades
    └── Can manage all records

Faculty (if implemented)
    ├── Can submit grades
    ├── Can view assigned sections
    └── Limited access

Student (if implemented)
    ├── Can view own grades
    ├── Can update profile
    └── View-only access
```

---

## 🧪 Testing

### Run PHP Tests
```bash
# Run all tests
php artisan test

# Run feature tests
php artisan test --testsuite=Feature

# Run unit tests
php artisan test --testsuite=Unit
```

### Example Test Cases
```php
// Student Creation Test
public function test_registrar_can_create_student()
{
    $response = $this->post('/registrar/students', [
        'student_id' => '2024-9999',
        'first_name' => 'John',
        'last_name' => 'Doe',
        'email' => 'john.doe@example.com',
        'password' => 'password',
        'course' => 'BSIT',
        'year_level' => '1',
    ]);
    
    $response->assertStatus(302);
    $this->assertDatabaseHas('students', ['email' => 'john.doe@example.com']);
}
```

### Frontend Testing
```bash
# Run component tests (if configured)
npm run test

# Lint TypeScript
npm run lint

# Type checking
npm run type-check
```

---

## 🚢 Deployment

### Production Deployment Steps

#### 1. Prepare Server
```bash
# Install PHP, MySQL, Nginx/Apache, Composer, Node.js
sudo apt update
sudo apt install php8.2 php8.2-cli php8.2-mysql php8.2-xml php8.2-mbstring
sudo apt install mysql-server nginx
sudo apt install composer
```

#### 2. Clone and Configure
```bash
git clone https://github.com/yourusername/gradehub.git
cd gradehub
composer install --no-dev --optimize-autoloader
npm install
npm run build
```

#### 3. Environment Setup
```bash
cp .env.example .env
php artisan key:generate
# Edit .env with production database credentials
```

#### 4. Database Migration
```bash
php artisan migrate --force
```

#### 5. Optimize Laravel
```bash
php artisan optimize
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

#### 6. Set Permissions
```bash
chmod -R 775 storage bootstrap/cache
chmod -R 775 public
```

#### 7. Configure Web Server (Nginx example)
```nginx
server {
    listen 80;
    server_name gradehub.com;
    root /var/www/gradehub/public;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
}
```

---

## 🤝 Contributing

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**
```bash
git checkout -b feature/amazing-feature
```

3. **Commit your changes**
```bash
git commit -m 'Add amazing feature'
```

4. **Push to branch**
```bash
git push origin feature/amazing-feature
```

5. **Open a Pull Request**

### Coding Standards

| Standard | Rule |
|----------|------|
| PHP | PSR-12 |
| TypeScript | ESLint + Prettier |
| React | Functional components with hooks |
| Tailwind | Utility classes, no custom CSS |
| Git | Conventional commits |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 GradeHub

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files...
```

---

## 👥 Authors

| Author | Role | Contact |
|--------|------|---------|
| Jeremiah F. Escubido | Lead Developer | jeremiahescubido05@gmail.com |

---

## 🙏 Acknowledgments

- **Laravel Community** - Amazing PHP framework
- **React Team** - Powerful frontend library
- **Inertia.js Team** - Seamless SPA integration
- **Tailwind CSS Team** - Utility-first CSS
- **Open Source Contributors** - Various packages used

---

## 📞 Support

| Type | Contact |
|------|---------|
| Email | jeremiahescubido05@gmail.com |



---

## 🗺️ Roadmap

### Version 1.2 (Planned - Q3 2026)
- [ ] Student self-service portal
- [ ] Email notifications system
- [ ] Bulk import/export (Excel/CSV)
- [ ] Advanced reporting engine
- [ ] PDF transcript generation

### Version 1.3 (Planned - Q4 2026)
- [ ] Mobile application (React Native)
- [ ] Real-time notifications (WebSocket)
- [ ] Document attachment support
- [ ] Multi-language support (i18n)

### Version 2.0 (Future)
- [ ] REST API for third-party integration
- [ ] Multi-tenancy support
- [ ] AI-powered analytics dashboard
- [ ] Graduation tracking system
- [ ] Payment integration

---

## 📊 System Requirements

### Minimum Requirements
| Component | Requirement |
|-----------|-------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Storage | 20 GB |
| PHP | 8.1+ |
| MySQL | 5.7+ |
| Node.js | 18+ |

### Recommended Requirements
| Component | Requirement |
|-----------|-------------|
| CPU | 4 cores |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| PHP | 8.2+ |
| MySQL | 8.0+ |
| Node.js | 20 LTS |
| Redis | For caching |

---

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 2 seconds |
| Query Execution | < 100ms |
| Concurrent Users | 500+ |
| Uptime | 99.9% |
| Error Rate | < 0.1% |

---

## 📈 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | April 2026 | Initial release |
| 1.1 | May 2026 | Added charts, dark mode, responsive design |
| 1.2 | Planned | Student portal, email notifications |

---

## 🏆 Built With

- **[Laravel](https://laravel.com)** - The PHP framework for web artisans
- **[React](https://reactjs.org)** - A JavaScript library for building user interfaces
- **[Inertia.js](https://inertiajs.com)** - Build monoliths without APIs
- **[Tailwind CSS](https://tailwindcss.com)** - Utility-first CSS framework
- **[TypeScript](https://typescriptlang.org)** - JavaScript with syntax for types
- **[MySQL](https://mysql.com)** - The world's most popular open source database
- **[Heroicons](https://heroicons.com)** - Beautiful hand-crafted SVG icons

---

**GradeHub - Simplifying Academic Administration** 🎓


*This README was generated on May 11, 2026.*  
*For the latest updates, please visit the GitHub repository.*
