<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::create('registrars', function (Blueprint $table) {
            $table->id();
            $table->string('employee_id', 20)->unique();  // e.g. REG-2020-001
            $table->string('first_name', 100);
            $table->string('last_name', 100);
            $table->string('email')->unique();
            $table->string('password');
            $table->enum('role', ['registrar', 'admin'])->default('registrar');
            // admin = full access, registrar = records only
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->rememberToken();
            $table->timestamps();
        });
    }

    public function down(): void {
        Schema::dropIfExists('registrars');
    }
};