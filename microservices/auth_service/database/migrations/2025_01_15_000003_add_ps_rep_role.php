<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Update the role enum to include ps_rep
            $table->enum('role', ['admin', 'student', 'staff', 'ps_rep'])->default('student')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Revert back to original enum values
            $table->enum('role', ['admin', 'student', 'staff'])->default('student')->change();
        });
    }
};
