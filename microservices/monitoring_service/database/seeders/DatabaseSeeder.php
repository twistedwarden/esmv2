<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Create a test user for admin access
        User::factory()->create([
            'name' => 'Monitoring Admin',
            'email' => 'admin@monitoring.local',
        ]);

        // Seed initial monitoring metrics (optional)
        $this->call([
            MonitoringSeeder::class,
        ]);
    }
}
