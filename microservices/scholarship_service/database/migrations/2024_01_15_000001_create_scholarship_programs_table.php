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
        Schema::create('scholarship_programs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('type', ['merit', 'need_based', 'special', 'renewal', 'field_specific', 'service_based']);
            $table->decimal('award_amount', 10, 2);
            $table->integer('max_recipients')->default(0);
            $table->integer('current_recipients')->default(0);
            $table->decimal('total_budget', 15, 2)->default(0);
            $table->decimal('budget_used', 15, 2)->default(0);
            $table->date('application_deadline');
            $table->date('start_date');
            $table->date('end_date')->nullable();
            $table->enum('status', ['active', 'paused', 'closed', 'draft'])->default('draft');
            $table->json('requirements')->nullable();
            $table->json('benefits')->nullable();
            $table->json('eligibility_criteria')->nullable();
            $table->text('application_instructions')->nullable();
            $table->boolean('is_active')->default(true);
            $table->integer('created_by')->nullable();
            $table->integer('updated_by')->nullable();
            $table->timestamps();
            
            $table->index(['status', 'is_active']);
            $table->index(['type', 'is_active']);
            $table->index('application_deadline');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scholarship_programs');
    }
};
