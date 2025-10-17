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
        Schema::create('monitoring_reports', function (Blueprint $table) {
            $table->id();
            $table->enum('report_type', ['fund_usage', 'distribution_efficiency', 'school_performance', 'student_trends', 'comprehensive']);
            $table->timestamp('generated_at')->useCurrent();
            $table->unsignedBigInteger('generated_by')->nullable();
            $table->json('parameters')->nullable();
            $table->string('file_url', 512)->nullable();
            $table->timestamps();

            $table->index(['report_type', 'generated_at']);
            $table->index('generated_by');
        });

        Schema::create('monitoring_metrics', function (Blueprint $table) {
            $table->id();
            $table->string('metric_name', 255);
            $table->decimal('metric_value', 18, 2);
            $table->date('metric_date');
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['metric_name', 'metric_date']);
            $table->index('metric_date');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('monitoring_reports');
        Schema::dropIfExists('monitoring_metrics');
    }
};
