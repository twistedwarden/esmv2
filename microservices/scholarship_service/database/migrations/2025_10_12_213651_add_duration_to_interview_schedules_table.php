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
        Schema::table('interview_schedules', function (Blueprint $table) {
            $table->integer('duration')->default(30)->after('interview_time')->comment('Duration in minutes');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('interview_schedules', function (Blueprint $table) {
            $table->dropColumn('duration');
        });
    }
};
