<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Audit log for every grade change.
     * Important for a school system — registrar needs full accountability trail.
     * Tracks who changed what, when, and from which value to which value.
     */
    public function up(): void {
        Schema::create('grade_audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('grade_id')->constrained()->cascadeOnDelete();
            $table->foreignId('enrollment_id')->constrained()->cascadeOnDelete();

            $table->string('changed_by_type', 20); // 'faculty' | 'registrar'
            $table->unsignedBigInteger('changed_by_id');

            $table->decimal('old_score', 5, 2)->nullable();
            $table->decimal('new_score', 5, 2)->nullable();
            $table->string('old_letter', 5)->nullable();
            $table->string('new_letter', 5)->nullable();
            $table->string('old_remarks', 20)->nullable();
            $table->string('new_remarks', 20)->nullable();

            $table->text('reason')->nullable(); // optional reason for change
            $table->timestamp('changed_at')->useCurrent();
        });
    }

    public function down(): void {
        Schema::dropIfExists('grade_audit_logs');
    }
};