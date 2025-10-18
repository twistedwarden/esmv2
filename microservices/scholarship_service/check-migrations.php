<?php

// Migration Status Checker
// This script checks the status of migrations and identifies issues

require_once 'vendor/autoload.php';

use Illuminate\Database\Migrations\Migrator;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🔍 Migration Status Checker\n";
echo "==========================\n\n";

try {
    // Check database connection
    DB::connection()->getPdo();
    echo "✅ Database connection: OK\n";
} catch (Exception $e) {
    echo "❌ Database connection: FAILED\n";
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}

// Check if tables exist
$tables = [
    'scholarship_applications' => 'Applications table',
    'documents' => 'Documents table',
    'audit_logs' => 'Audit logs table',
    'students' => 'Students table',
    'schools' => 'Schools table'
];

echo "\n📋 Table Status:\n";
foreach ($tables as $table => $description) {
    if (Schema::hasTable($table)) {
        echo "✅ $description: EXISTS\n";
    } else {
        echo "❌ $description: MISSING\n";
    }
}

// Check migration status
echo "\n📊 Migration Status:\n";
$migrator = app('migrator');
$migrations = $migrator->getMigrationFiles($migrator->paths());
$ran = $migrator->getRepository()->getRan();

foreach ($migrations as $migration => $path) {
    $migrationName = basename($path, '.php');
    if (in_array($migrationName, $ran)) {
        echo "✅ $migrationName: RAN\n";
    } else {
        echo "⏳ $migrationName: PENDING\n";
    }
}

// Check for potential issues
echo "\n🔍 Potential Issues:\n";

// Check if soft deletes migration is trying to modify non-existent tables
$softDeletesMigrations = [
    '2025_01_15_100002_add_soft_deletes_to_applications_table.php',
    '2025_01_15_100003_add_soft_deletes_to_documents_table.php',
    '2025_01_15_100005_add_soft_deletes_to_audit_logs_table.php'
];

foreach ($softDeletesMigrations as $migration) {
    $migrationName = basename($migration, '.php');
    if (in_array($migrationName, $ran)) {
        echo "✅ $migrationName: Already applied\n";
    } else {
        // Check if the target table exists
        $tableName = str_replace('add_soft_deletes_to_', '', str_replace('_table.php', '', $migration));
        $tableName = str_replace('_', '_', $tableName);
        
        if ($tableName === 'applications') {
            $tableName = 'scholarship_applications';
        }
        
        if (Schema::hasTable($tableName)) {
            echo "✅ $migrationName: Ready to run (table exists)\n";
        } else {
            echo "❌ $migrationName: Cannot run (table missing: $tableName)\n";
        }
    }
}

echo "\n🎯 Recommendations:\n";
echo "1. If tables are missing, run: php artisan migrate\n";
echo "2. If migrations are stuck, run: php artisan migrate:reset && php artisan migrate\n";
echo "3. If you see errors, check the migration files for table name mismatches\n";

echo "\n✨ Check complete!\n";
