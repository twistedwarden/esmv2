<?php

/**
 * Fix SSC Member Assignments
 * 
 * This script creates missing SSC member assignments for users who have SSC roles
 * but don't have the corresponding entries in ssc_member_assignments table.
 * 
 * Expected mappings:
 * - SSC (chairperson) -> final_approval
 * - SSC City Council -> document_verification
 * - SSC Budget Department -> financial_review
 * - SSC Education Affairs -> academic_review
 */

require __DIR__ . '/vendor/autoload.php';

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "=== SSC Assignment Fix Script ===\n";
echo "This script will create missing SSC member assignments\n\n";

// Role mapping configuration
$roleMapping = [
    'ssc' => ['ssc_role' => 'chairperson', 'review_stage' => 'final_approval'],
    'ssc_city_council' => ['ssc_role' => 'city_council', 'review_stage' => 'document_verification'],
    'ssc_budget_dept' => ['ssc_role' => 'budget_dept', 'review_stage' => 'financial_review'],
    'ssc_education_affairs' => ['ssc_role' => 'education_affairs', 'review_stage' => 'academic_review'],
];

try {
    // Get all users from auth service
    $authServiceUrl = env('AUTH_SERVICE_URL', 'http://localhost:8001');
    
    echo "Fetching users from auth service: {$authServiceUrl}\n";
    
    $response = Http::withHeaders([
        'Accept' => 'application/json',
        'X-Service-Request' => 'scholarship'
    ])->timeout(30)->get("{$authServiceUrl}/api/internal/users");
    
    if (!$response->successful()) {
        throw new Exception("Failed to fetch users from auth service: " . $response->body());
    }
    
    $users = $response->json()['data'] ?? [];
    
    echo "Found " . count($users) . " total users\n\n";
    
    $sscUsers = array_filter($users, function($user) use ($roleMapping) {
        return isset($user['role']) && array_key_exists($user['role'], $roleMapping);
    });
    
    echo "Found " . count($sscUsers) . " SSC users\n\n";
    
    $created = 0;
    $skipped = 0;
    $errors = 0;
    
    foreach ($sscUsers as $user) {
        $userId = $user['id'];
        $role = $user['role'];
        $userName = ($user['first_name'] ?? '') . ' ' . ($user['last_name'] ?? '');
        
        if (!isset($roleMapping[$role])) {
            echo "⚠️  Unknown role mapping for user {$userId} ({$userName}): {$role}\n";
            $errors++;
            continue;
        }
        
        $mapping = $roleMapping[$role];
        $sscRole = $mapping['ssc_role'];
        $reviewStage = $mapping['review_stage'];
        
        // Check if assignment already exists
        $existingAssignment = DB::table('ssc_member_assignments')
            ->where('user_id', $userId)
            ->where('ssc_role', $sscRole)
            ->where('is_active', true)
            ->first();
        
        if ($existingAssignment) {
            echo "⏭️  User {$userId} ({$userName}) already has assignment for {$sscRole}\n";
            $skipped++;
            continue;
        }
        
        // Create new SSC assignment
        try {
            DB::table('ssc_member_assignments')->insert([
                'user_id' => $userId,
                'ssc_role' => $sscRole,
                'review_stage' => $reviewStage,
                'is_active' => true,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            
            echo "✅ Created assignment for User {$userId} ({$userName}): {$role} -> {$sscRole} ({$reviewStage})\n";
            $created++;
            
        } catch (Exception $e) {
            echo "❌ Error creating assignment for User {$userId} ({$userName}): " . $e->getMessage() . "\n";
            $errors++;
        }
    }
    
    echo "\n=== Summary ===\n";
    echo "Created: {$created}\n";
    echo "Skipped: {$skipped}\n";
    echo "Errors: {$errors}\n";
    echo "\n";
    
    // Show current assignments
    echo "=== Current SSC Member Assignments ===\n";
    $assignments = DB::table('ssc_member_assignments')
        ->where('is_active', true)
        ->orderBy('review_stage')
        ->orderBy('ssc_role')
        ->get();
    
    foreach ($assignments as $assignment) {
        echo "User {$assignment->user_id}: {$assignment->ssc_role} -> {$assignment->review_stage}\n";
    }
    
    echo "\n✅ Script completed successfully!\n";
    
} catch (Exception $e) {
    echo "\n❌ Error: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
    exit(1);
}

