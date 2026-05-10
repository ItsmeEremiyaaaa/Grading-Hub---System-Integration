<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('courses', function (Blueprint $table) {
            $table->id();
            $table->string('code', 20)->unique();         // e.g. CS201
            $table->string('name', 150);                  // e.g. Data Structures
            $table->text('description')->nullable();
            $table->unsignedTinyInteger('units')->default(3);
            $table->string('department', 150)->nullable(); // offering department
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('courses');
    }
};