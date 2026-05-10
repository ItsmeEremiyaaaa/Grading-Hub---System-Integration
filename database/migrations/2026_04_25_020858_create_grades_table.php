<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Grades are submitted by the teacher per enrollment.
     * One grade record per enrollment (one student, one section).
     * Only the teacher assigned to that section can submit/update grades,
     * unless the registrar overrides.
     */
    public function up(): void {
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('enrollment_id')->unique()->constrained()->cascadeOnDelete();
            // unique: one grade row per enrollment
            $table->foreignId('faculty_id')->nullable()->constrained('faculty')->nullOnDelete();
            // who submitted the grade
            $table->foreignId('registrar_id')->nullable()->constrained()->nullOnDelete();
            // set if registrar overrode/manually entered the grade

            $table->decimal('score', 5, 2)->nullable();   // raw score e.g. 95.50
            $table->string('letter_grade', 5)->nullable(); // A, B+, C-, etc.
            $table->decimal('gpa_equivalent', 3, 2)->nullable(); // 1.00 – 5.00 (Philippine system)
            $table->enum('remarks', ['passed', 'failed', 'incomplete', 'dropped', 'withdrawn'])->nullable();

            $table->boolean('is_finalized')->default(false);
            // once finalized by registrar, teacher cannot change it

            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('finalized_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('grades');
    }
};