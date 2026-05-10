<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * A "section" represents a specific class offering:
     * e.g. CS201 taught by Teacher A, 1st Sem 2025-2026, Section BSIT-3A
     * This is what the registrar creates and assigns a teacher to.
     */
    public function up(): void {
        Schema::create('sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained()->cascadeOnDelete();
            $table->foreignId('faculty_id')->nullable()->constrained('faculty')->nullOnDelete();
            $table->string('section_name', 50);           // e.g. BSIT-3A
            $table->string('school_year', 20);            // e.g. 2025-2026
            $table->enum('semester', ['1st', '2nd', 'Summer']);
            $table->enum('status', ['open', 'closed', 'grading', 'done'])->default('open');
            // open     = enrolling students
            // closed   = no new enrollees
            // grading  = teacher can now submit grades
            // done     = grades finalized, locked
            $table->timestamps();

            $table->unique(['course_id', 'section_name', 'school_year', 'semester']);
        });
    }

    public function down(): void {
        Schema::dropIfExists('sections');
    }
};