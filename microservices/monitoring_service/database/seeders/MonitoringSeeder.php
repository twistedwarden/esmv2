<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MonitoringMetric;
use Carbon\Carbon;

class MonitoringSeeder extends Seeder
{
    /**
     * Seed initial monitoring metrics for testing
     */
    public function run(): void
    {
        // Only seed if no metrics exist
        if (MonitoringMetric::count() > 0) {
            $this->command->info('Monitoring metrics already exist. Skipping seeding.');
            return;
        }

        $this->command->info('Seeding initial monitoring metrics...');

        // Seed some initial metrics for the past 30 days
        $metrics = [
            'total_students' => 150,
            'active_students' => 120,
            'graduated_students' => 30,
            'average_gpa' => 3.2,
            'approval_rate' => 85.5,
            'enrollment_trend' => 12.5,
            'retention_rate' => 92.3,
            'completion_rate' => 78.9
        ];

        $startDate = Carbon::now()->subDays(30);
        
        foreach ($metrics as $metricName => $baseValue) {
            for ($i = 0; $i < 30; $i++) {
                $date = $startDate->copy()->addDays($i);
                
                // Add some variation to make it realistic
                $variation = rand(-5, 5) / 100; // ±5% variation
                $value = $baseValue * (1 + $variation);
                
                MonitoringMetric::create([
                    'metric_name' => $metricName,
                    'metric_value' => round($value, 2),
                    'metric_date' => $date->format('Y-m-d'),
                    'notes' => 'Seeded initial data for testing'
                ]);
            }
        }

        $this->command->info('Initial monitoring metrics seeded successfully!');
    }
}
