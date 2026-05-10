<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void {
        Schema::table('grades', function (Blueprint $table) {
            $table->decimal('prelim', 5, 2)->nullable()->after('registrar_id');
            $table->decimal('midterm', 5, 2)->nullable()->after('prelim');
            $table->decimal('finals', 5, 2)->nullable()->after('midterm');
        });
    }

    public function down(): void {
        Schema::table('grades', function (Blueprint $table) {
            $table->dropColumn(['prelim', 'midterm', 'finals']);
        });
    }
};