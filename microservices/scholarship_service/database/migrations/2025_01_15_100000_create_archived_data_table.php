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
        Schema::create('archived_data', function (Blueprint $table) {
            $table->id();
            $table->string('resource_type'); // 'user', 'application', 'document', 'log'
            $table->unsignedBigInteger('resource_id');
            $table->json('original_data'); // Store the complete original data
            $table->string('deleted_by'); // User who deleted the item
            $table->text('deletion_reason')->nullable();
            $table->timestamp('deleted_at');
            $table->timestamps();
            
            // Indexes for better performance
            $table->index(['resource_type', 'resource_id']);
            $table->index('deleted_at');
            $table->index('deleted_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('archived_data');
    }
};
