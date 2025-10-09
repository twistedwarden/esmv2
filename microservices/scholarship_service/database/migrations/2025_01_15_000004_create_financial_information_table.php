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
        Schema::create('financial_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->onDelete('cascade');
            $table->string('family_monthly_income_range')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->integer('number_of_children')->default(0);
            $table->integer('number_of_siblings')->default(0);
            $table->enum('home_ownership_status', ['owned', 'rented', 'living_with_relatives', 'boarding_house', 'informal_settlers', 'others'])->nullable();
            $table->boolean('is_4ps_beneficiary')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('financial_information');
    }
};
