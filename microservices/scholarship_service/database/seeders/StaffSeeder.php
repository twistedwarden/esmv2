<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Services\AuthServiceClient;

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
                'email' => 'peter.santos@scholarship.gov.ph',
                'name' => 'Peter Santos',
                'citizen_id' => 'STAFF-002',
            ],
            [
                'email' => 'maria.reyes@scholarship.gov.ph',
                'name' => 'Maria Reyes',
                'citizen_id' => 'STAFF-003',
            ],
            [
                'email' => 'john.cruz@scholarship.gov.ph',
                'name' => 'John Cruz',
                'citizen_id' => 'STAFF-004',
            ],
            [
                'email' => 'ana.lopez@scholarship.gov.ph',
                'name' => 'Ana Lopez',
                'citizen_id' => 'STAFF-005',
            ],
            [
                'email' => 'carlos.mendoza@scholarship.gov.ph',
                'name' => 'Carlos Mendoza',
                'citizen_id' => 'STAFF-006',
            ],
        ];

        // Try to fetch actual staff users from auth service
        try {
            $authService = app(AuthServiceClient::class);
            $authStaffUsers = $authService->getStaffUsers();
            
            foreach ($expectedStaffUsers as $expectedUser) {
                // Find the user in auth service by email
                $authUser = collect($authStaffUsers)->first(function ($user) use ($expectedUser) {
                    return $user['email'] === $expectedUser['email'];
                });
                
                if ($authUser) {
                    $existingStaff = DB::table('staff')->where('user_id', $authUser['id'])->first();
                    
                    if (!$existingStaff) {
                        DB::table('staff')->insert([
                            'user_id' => $authUser['id'],
                            'citizen_id' => $expectedUser['citizen_id'],
                            'system_role' => 'interviewer',
                            'department' => 'Scholarship Management',
                            'position' => 'Interview Coordinator',
                            'is_active' => true,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ]);
                        
                        $this->command->info("Created staff record for {$expectedUser['name']} (User ID: {$authUser['id']})");
                    } else {
                        $this->command->info("Staff record already exists for {$expectedUser['name']} (User ID: {$authUser['id']})");
                    }
                } else {
                    $this->command->warn("User not found in auth service: {$expectedUser['email']}");
                }
            }
        } catch (\Exception $e) {
            $this->command->error("Could not connect to auth service: " . $e->getMessage());
            $this->command->info("Please ensure the auth service is running and seeded before running this seeder.");
        }
    }
}
