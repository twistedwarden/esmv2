<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create admin user
        User::create([
            'citizen_id' => 'ADMIN-001',
            'email' => 'admin@caloocan.gov.ph',
            'password' => Hash::make('admin123'),
            'first_name' => 'System',
            'last_name' => 'Administrator',
            'role' => 'admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create staff user
        User::create([
            'citizen_id' => 'STAFF-001',
            'email' => 'staff@caloocan.gov.ph',
            'password' => Hash::make('staff123'),
            'first_name' => 'John',
            'last_name' => 'Doe',
            'middle_name' => 'M',
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create test citizen users
        User::create([
            'citizen_id' => 'CITIZEN-001',
            'email' => 'citizen@example.com',
            'password' => Hash::make('citizen123'),
            'first_name' => 'Maria',
            'last_name' => 'Santos',
            'middle_name' => 'Cruz',
            'role' => 'citizen',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'citizen_id' => 'CITIZEN-002',
            'email' => 'juan.delacruz@example.com',
            'password' => Hash::make('citizen123'),
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'middle_name' => 'Santos',
            'role' => 'citizen',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'citizen_id' => 'CITIZEN-003',
            'email' => 'ana.garcia@example.com',
            'password' => Hash::make('citizen123'),
            'first_name' => 'Ana',
            'last_name' => 'Garcia',
            'middle_name' => 'Lopez',
            'role' => 'citizen',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create additional staff users
        User::create([
            'citizen_id' => 'STAFF-002',
            'email' => 'jane.smith@caloocan.gov.ph',
            'password' => Hash::make('staff123'),
            'first_name' => 'Jane',
            'last_name' => 'Smith',
            'middle_name' => 'A',
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::create([
            'citizen_id' => 'STAFF-003',
            'email' => 'mike.johnson@caloocan.gov.ph',
            'password' => Hash::make('staff123'),
            'first_name' => 'Mike',
            'last_name' => 'Johnson',
            'middle_name' => 'B',
            'role' => 'staff',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        // Create partner school representative
        User::create([
            'citizen_id' => 'PS-001',
            'email' => 'school.rep@university.edu.ph',
            'password' => Hash::make('psrep123'),
            'first_name' => 'Dr. Sarah',
            'last_name' => 'Wilson',
            'middle_name' => 'M',
            'role' => 'ps_rep',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}