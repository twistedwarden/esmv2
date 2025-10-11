<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            ScholarshipCategorySeeder::class,
            SchoolSeeder::class,
            DocumentTypeSeeder::class,
            PartnerSchoolRepresentativeSeeder::class, // Must run after SchoolSeeder
            SampleApplicationSeeder::class,
        ]);
    }
}