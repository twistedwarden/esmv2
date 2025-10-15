<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class StaffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Expected staff users from auth service (after seeding)
        // These user IDs should match the staff users created in auth service
        $expectedStaffUsers = [
            [
                'user_id' => 311,
                'email' => 'grindshine478@gmail.com',
                'name' => 'Peter Santos',
                'citizen_id' => 'STAFF-002',
            ],
            [
                'user_id' => 312,
                'email' => 'maria.reyes@scholarship.gov.ph',
                'name' => 'Maria Reyes',
                'citizen_id' => 'STAFF-003',
            ],
            [
                'user_id' => 313,
                'email' => 'john.cruz@scholarship.gov.ph',
                'name' => 'John Cruz',
                'citizen_id' => 'STAFF-004',
            ],
            [
                'user_id' => 314,
                'email' => 'ana.lopez@scholarship.gov.ph',
                'name' => 'Ana Lopez',
                'citizen_id' => 'STAFF-005',
            ],
            [
                'user_id' => 315,
                'email' => 'carlos.mendoza@scholarship.gov.ph',
                'name' => 'Carlos Mendoza',
                'citizen_id' => 'STAFF-006',
            ],
        ];

        // Create staff records directly using the known user IDs from auth service
        foreach ($expectedStaffUsers as $expectedUser) {
            $existingStaff = DB::table('staff')->where('user_id', $expectedUser['user_id'])->first();
            
            if (!$existingStaff) {
                DB::table('staff')->insert([
                    'user_id' => $expectedUser['user_id'],
                    'citizen_id' => $expectedUser['citizen_id'],
                    'system_role' => 'interviewer',
                    'department' => 'Scholarship Management',
                    'position' => 'Interview Coordinator',
                    'is_active' => true,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                
                $this->command->info("Created staff record for {$expectedUser['name']} (User ID: {$expectedUser['user_id']})");
            } else {
                // Update existing record to ensure it matches
                DB::table('staff')
                    ->where('user_id', $expectedUser['user_id'])
                    ->update([
                        'citizen_id' => $expectedUser['citizen_id'],
                        'system_role' => 'interviewer',
                        'department' => 'Scholarship Management',
                        'position' => 'Interview Coordinator',
                        'is_active' => true,
                        'updated_at' => now(),
                    ]);
                
                $this->command->info("Updated staff record for {$expectedUser['name']} (User ID: {$expectedUser['user_id']})");
            }
        }
    }
}
