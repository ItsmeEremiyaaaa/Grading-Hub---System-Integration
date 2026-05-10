<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Enrollments link a student to a section.
     * Registrar is responsible for enrolling students into sections.
     * A student cannot enroll in the same section twice.
     */
    public function up(): void {
        Schema::create('enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('section_id')->constrained()->cascadeOnDelete();
            $table->foreignId('registrar_id')->nullable()->constrained()->nullOnDelete();
            // which registrar enrolled this student
            $table->enum('status', ['enrolled', 'dropped', 'incomplete'])->default('enrolled');
            $table->timestamp('enrolled_at')->useCurrent();
            $table->timestamps();

            $table->unique(['student_id', 'section_id']); // no duplicate enrollment
        });
    }

    public function down(): void {
        Schema::dropIfExists('enrollments');
    }
};