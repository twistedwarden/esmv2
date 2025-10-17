<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\ScholarshipProgram;

class ScholarshipProgramSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $programs = [
            [
                'name' => 'Academic Merit Scholarship',
                'description' => 'For senior high students with excellent grades and outstanding academic performance.',
                'type' => 'merit',
                'award_amount' => 25000.00,
                'max_recipients' => 100,
                'current_recipients' => 0,
                'total_budget' => 2500000.00,
                'budget_used' => 0.00,
                'application_deadline' => '2024-12-31',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'active',
                'requirements' => [
                    'Minimum GPA of 1.5 or equivalent',
                    'No failing grades in any subject',
                    'Good moral character',
                    'Enrolled in a recognized educational institution'
                ],
                'benefits' => [
                    'Monthly stipend of ₱25,000',
                    'Book allowance',
                    'Transportation allowance',
                    'Mentorship program'
                ],
                'eligibility_criteria' => [
                    'Must be a Filipino citizen',
                    'Must be enrolled in Senior High School',
                    'Family income must not exceed ₱500,000 annually',
                    'Must maintain good academic standing'
                ],
                'application_instructions' => 'Submit all required documents through the online portal. Applications will be reviewed by the scholarship committee.',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Academic Renewal Scholarship',
                'description' => 'Renewal for students maintaining good academic standing and meeting program requirements.',
                'type' => 'renewal',
                'award_amount' => 45000.00,
                'max_recipients' => 50,
                'current_recipients' => 0,
                'total_budget' => 2250000.00,
                'budget_used' => 0.00,
                'application_deadline' => '2024-10-18',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'active',
                'requirements' => [
                    'Previous scholarship recipient',
                    'Maintained minimum GPA of 1.5',
                    'No disciplinary violations',
                    'Completed all previous requirements'
                ],
                'benefits' => [
                    'Monthly stipend of ₱45,000',
                    'Priority for additional programs',
                    'Alumni network access',
                    'Career guidance'
                ],
                'eligibility_criteria' => [
                    'Must be a current scholarship recipient',
                    'Must be in good standing',
                    'Must submit renewal application on time',
                    'Must meet academic requirements'
                ],
                'application_instructions' => 'Submit renewal application with updated academic records and recommendation letters.',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'STEM Excellence Scholarship',
                'description' => 'For students pursuing Science, Technology, Engineering, and Mathematics programs.',
                'type' => 'field_specific',
                'award_amount' => 35000.00,
                'max_recipients' => 75,
                'current_recipients' => 0,
                'total_budget' => 2625000.00,
                'budget_used' => 0.00,
                'application_deadline' => '2024-11-30',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'active',
                'requirements' => [
                    'Enrolled in STEM-related programs',
                    'Minimum GPA of 1.75',
                    'Passed entrance examination',
                    'Good moral character'
                ],
                'benefits' => [
                    'Monthly stipend of ₱35,000',
                    'Research opportunities',
                    'Industry mentorship',
                    'Conference attendance support'
                ],
                'eligibility_criteria' => [
                    'Must be pursuing STEM degree',
                    'Must be Filipino citizen',
                    'Family income not exceeding ₱750,000 annually',
                    'Must commit to 2-year service after graduation'
                ],
                'application_instructions' => 'Submit application with academic records, entrance exam results, and personal statement.',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Community Service Scholarship',
                'description' => 'For students committed to community service and social development.',
                'type' => 'service_based',
                'award_amount' => 20000.00,
                'max_recipients' => 30,
                'current_recipients' => 0,
                'total_budget' => 600000.00,
                'budget_used' => 0.00,
                'application_deadline' => '2024-09-30',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'paused',
                'requirements' => [
                    'Active in community service',
                    'Minimum 40 hours community service per semester',
                    'Good academic standing',
                    'Leadership potential'
                ],
                'benefits' => [
                    'Monthly stipend of ₱20,000',
                    'Community project funding',
                    'Leadership training',
                    'Networking opportunities'
                ],
                'eligibility_criteria' => [
                    'Must be involved in community service',
                    'Must be Filipino citizen',
                    'Must maintain service hours',
                    'Must submit service reports'
                ],
                'application_instructions' => 'Submit application with community service records and recommendation from community leaders.',
                'is_active' => true,
                'created_by' => 1,
            ],
            [
                'name' => 'Financial Need Scholarship',
                'description' => 'For students with demonstrated financial need and academic potential.',
                'type' => 'need_based',
                'award_amount' => 30000.00,
                'max_recipients' => 200,
                'current_recipients' => 0,
                'total_budget' => 6000000.00,
                'budget_used' => 0.00,
                'application_deadline' => '2024-08-31',
                'start_date' => '2024-01-01',
                'end_date' => '2024-12-31',
                'status' => 'active',
                'requirements' => [
                    'Demonstrated financial need',
                    'Minimum GPA of 2.0',
                    'No failing grades',
                    'Good moral character'
                ],
                'benefits' => [
                    'Monthly stipend of ₱30,000',
                    'Book and supply allowance',
                    'Transportation support',
                    'Financial literacy training'
                ],
                'eligibility_criteria' => [
                    'Family income below ₱300,000 annually',
                    'Must be Filipino citizen',
                    'Must be enrolled full-time',
                    'Must maintain academic progress'
                ],
                'application_instructions' => 'Submit application with financial documents, academic records, and personal statement.',
                'is_active' => true,
                'created_by' => 1,
            ]
        ];

        foreach ($programs as $program) {
            ScholarshipProgram::create($program);
        }
    }
}
