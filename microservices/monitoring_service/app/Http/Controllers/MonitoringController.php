<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class MonitoringController extends Controller
{
    private $scholarshipServiceUrl;
    private $authServiceUrl;

    public function __construct()
    {
        $this->scholarshipServiceUrl = config('services.scholarship_service.url', 'http://localhost:8001');
        $this->authServiceUrl = config('services.auth_service.url', 'http://localhost:8002');
    }

    /**
     * Get comprehensive education monitoring data
     */
    public function getEducationMetrics(Request $request)
    {
        try {
            // Fetch data from scholarship service
            $studentsData = $this->fetchStudentsData();
            $applicationsData = $this->fetchApplicationsData();
            $schoolsData = $this->fetchSchoolsData();
            $academicRecordsData = $this->fetchAcademicRecordsData();

            // Calculate metrics
            $metrics = $this->calculateEducationMetrics($studentsData, $applicationsData, $schoolsData, $academicRecordsData);

            return response()->json([
                'success' => true,
                'data' => $metrics,
                'timestamp' => now(),
                'source' => 'monitoring_service'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching education metrics: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch education metrics',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get student performance trends
     */
    public function getStudentTrends(Request $request)
    {
        try {
            $studentsData = $this->fetchStudentsData();
            $academicRecordsData = $this->fetchAcademicRecordsData();

            $trends = $this->calculateStudentTrends($studentsData, $academicRecordsData);

            return response()->json([
                'success' => true,
                'data' => $trends,
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching student trends: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch student trends',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get program effectiveness data
     */
    public function getProgramEffectiveness(Request $request)
    {
        try {
            $studentsData = $this->fetchStudentsData();
            $academicRecordsData = $this->fetchAcademicRecordsData();
            $applicationsData = $this->fetchApplicationsData();

            $effectiveness = $this->calculateProgramEffectiveness($studentsData, $academicRecordsData, $applicationsData);

            return response()->json([
                'success' => true,
                'data' => $effectiveness,
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching program effectiveness: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch program effectiveness',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get school performance data
     */
    public function getSchoolPerformance(Request $request)
    {
        try {
            $studentsData = $this->fetchStudentsData();
            $schoolsData = $this->fetchSchoolsData();
            $academicRecordsData = $this->fetchAcademicRecordsData();

            $performance = $this->calculateSchoolPerformance($studentsData, $schoolsData, $academicRecordsData);

            return response()->json([
                'success' => true,
                'data' => $performance,
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching school performance: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch school performance',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Generate monitoring report
     */
    public function generateReport(Request $request)
    {
        try {
            $reportType = $request->input('type', 'comprehensive');
            $dateRange = $request->input('date_range', '30_days');

            $reportData = $this->generateMonitoringReport($reportType, $dateRange);

            // Store report in database
            $report = \App\Models\MonitoringReport::create([
                'report_type' => $reportType,
                'generated_by' => $request->user() ? $request->user()->id : null,
                'parameters' => json_encode([
                    'date_range' => $dateRange,
                    'generated_at' => now()
                ]),
                'file_url' => null // Could store file path if generating PDF/Excel
            ]);

            return response()->json([
                'success' => true,
                'data' => $reportData,
                'report_id' => $report->id,
                'timestamp' => now()
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating monitoring report: ' . $e->getMessage());
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to generate monitoring report',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Fetch students data from scholarship service
     */
    private function fetchStudentsData()
    {
        try {
            $response = Http::timeout(30)->get($this->scholarshipServiceUrl . '/api/students');
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['success'] ? $data['data']['data'] : [];
            }
            
            return [];
        } catch (\Exception $e) {
            Log::warning('Failed to fetch students data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch applications data from scholarship service
     */
    private function fetchApplicationsData()
    {
        try {
            $response = Http::timeout(30)->get($this->scholarshipServiceUrl . '/api/applications');
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['success'] ? $data['data']['data'] : [];
            }
            
            return [];
        } catch (\Exception $e) {
            Log::warning('Failed to fetch applications data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch schools data from scholarship service
     */
    private function fetchSchoolsData()
    {
        try {
            $response = Http::timeout(30)->get($this->scholarshipServiceUrl . '/api/public/schools');
            
            if ($response->successful()) {
                $data = $response->json();
                return $data['success'] ? $data['data'] : [];
            }
            
            return [];
        } catch (\Exception $e) {
            Log::warning('Failed to fetch schools data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Fetch academic records data from scholarship service
     */
    private function fetchAcademicRecordsData()
    {
        try {
            // This would need to be implemented in scholarship service
            // For now, return empty array
            return [];
        } catch (\Exception $e) {
            Log::warning('Failed to fetch academic records data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Calculate comprehensive education metrics
     */
    private function calculateEducationMetrics($students, $applications, $schools, $academicRecords)
    {
        $totalStudents = count($students);
        $activeStudents = count(array_filter($students, function($student) {
            return $student['status'] === 'active' || $student['status'] === 'enrolled';
        }));

        $totalApplications = count($applications);
        $pendingApplications = count(array_filter($applications, function($app) {
            return $app['status'] === 'submitted' || $app['status'] === 'pending';
        }));

        $approvedApplications = count(array_filter($applications, function($app) {
            return $app['status'] === 'approved';
        }));

        // Calculate GPA statistics if academic records available
        $gpaStats = $this->calculateGPAStats($academicRecords);

        // Calculate program distribution
        $programStats = $this->calculateProgramStats($students);

        // Calculate school distribution
        $schoolStats = $this->calculateSchoolStats($students, $schools);

        return [
            'overview' => [
                'total_students' => $totalStudents,
                'active_students' => $activeStudents,
                'total_applications' => $totalApplications,
                'pending_applications' => $pendingApplications,
                'approved_applications' => $approvedApplications,
                'approval_rate' => $totalApplications > 0 ? round(($approvedApplications / $totalApplications) * 100, 2) : 0
            ],
            'gpa_statistics' => $gpaStats,
            'program_distribution' => $programStats,
            'school_distribution' => $schoolStats,
            'trends' => $this->calculateTrends($students, $applications)
        ];
    }

    /**
     * Calculate GPA statistics
     */
    private function calculateGPAStats($academicRecords)
    {
        if (empty($academicRecords)) {
            return [
                'average_gpa' => 0,
                'gpa_distribution' => [],
                'total_records' => 0
            ];
        }

        $gpas = array_column($academicRecords, 'gpa');
        $validGpas = array_filter($gpas, function($gpa) {
            return is_numeric($gpa) && $gpa > 0;
        });

        $averageGpa = count($validGpas) > 0 ? round(array_sum($validGpas) / count($validGpas), 2) : 0;

        // Calculate GPA distribution
        $distribution = [
            'A (90-100)' => 0,
            'B (80-89)' => 0,
            'C (70-79)' => 0,
            'D (60-69)' => 0,
            'F (Below 60)' => 0
        ];

        foreach ($validGpas as $gpa) {
            if ($gpa >= 90) $distribution['A (90-100)']++;
            elseif ($gpa >= 80) $distribution['B (80-89)']++;
            elseif ($gpa >= 70) $distribution['C (70-79)']++;
            elseif ($gpa >= 60) $distribution['D (60-69)']++;
            else $distribution['F (Below 60)']++;
        }

        return [
            'average_gpa' => $averageGpa,
            'gpa_distribution' => $distribution,
            'total_records' => count($validGpas)
        ];
    }

    /**
     * Calculate program statistics
     */
    private function calculateProgramStats($students)
    {
        $programs = [];
        
        foreach ($students as $student) {
            $program = $student['program'] ?? $student['course'] ?? 'Unknown';
            
            if (!isset($programs[$program])) {
                $programs[$program] = [
                    'name' => $program,
                    'total_students' => 0,
                    'active_students' => 0
                ];
            }
            
            $programs[$program]['total_students']++;
            
            if ($student['status'] === 'active' || $student['status'] === 'enrolled') {
                $programs[$program]['active_students']++;
            }
        }

        return array_values($programs);
    }

    /**
     * Calculate school statistics
     */
    private function calculateSchoolStats($students, $schools)
    {
        $schoolStats = [];
        $schoolMap = [];
        
        // Create school ID to name mapping
        foreach ($schools as $school) {
            $schoolMap[$school['id']] = $school['name'];
        }
        
        foreach ($students as $student) {
            $schoolId = $student['school_id'] ?? $student['current_school_id'] ?? null;
            $schoolName = $schoolId ? ($schoolMap[$schoolId] ?? 'Unknown School') : 'Unknown School';
            
            if (!isset($schoolStats[$schoolName])) {
                $schoolStats[$schoolName] = [
                    'name' => $schoolName,
                    'total_students' => 0,
                    'active_students' => 0
                ];
            }
            
            $schoolStats[$schoolName]['total_students']++;
            
            if ($student['status'] === 'active' || $student['status'] === 'enrolled') {
                $schoolStats[$schoolName]['active_students']++;
            }
        }

        return array_values($schoolStats);
    }

    /**
     * Calculate trends over time
     */
    private function calculateTrends($students, $applications)
    {
        $monthlyData = [];
        
        // Group by month
        foreach ($students as $student) {
            $month = Carbon::parse($student['created_at'])->format('Y-m');
            
            if (!isset($monthlyData[$month])) {
                $monthlyData[$month] = [
                    'month' => $month,
                    'new_students' => 0,
                    'new_applications' => 0
                ];
            }
            
            $monthlyData[$month]['new_students']++;
        }
        
        foreach ($applications as $application) {
            $month = Carbon::parse($application['created_at'])->format('Y-m');
            
            if (!isset($monthlyData[$month])) {
                $monthlyData[$month] = [
                    'month' => $month,
                    'new_students' => 0,
                    'new_applications' => 0
                ];
            }
            
            $monthlyData[$month]['new_applications']++;
        }

        return array_values($monthlyData);
    }

    /**
     * Calculate student trends
     */
    private function calculateStudentTrends($students, $academicRecords)
    {
        // Implementation for student trends
        return [
            'enrollment_trends' => $this->calculateTrends($students, []),
            'performance_trends' => $this->calculatePerformanceTrends($academicRecords)
        ];
    }

    /**
     * Calculate program effectiveness
     */
    private function calculateProgramEffectiveness($students, $academicRecords, $applications)
    {
        $programs = $this->calculateProgramStats($students);
        
        // Add effectiveness metrics
        foreach ($programs as &$program) {
            $program['completion_rate'] = $this->calculateCompletionRate($program['name'], $students);
            $program['effectiveness_score'] = $this->calculateEffectivenessScore($program);
        }

        return $programs;
    }

    /**
     * Calculate school performance
     */
    private function calculateSchoolPerformance($students, $schools, $academicRecords)
    {
        $schoolStats = $this->calculateSchoolStats($students, $schools);
        
        // Add performance metrics
        foreach ($schoolStats as &$school) {
            $school['performance_score'] = $this->calculateSchoolPerformanceScore($school);
        }

        return $schoolStats;
    }

    /**
     * Generate comprehensive monitoring report
     */
    private function generateMonitoringReport($type, $dateRange)
    {
        $students = $this->fetchStudentsData();
        $applications = $this->fetchApplicationsData();
        $schools = $this->fetchSchoolsData();
        $academicRecords = $this->fetchAcademicRecordsData();

        $metrics = $this->calculateEducationMetrics($students, $applications, $schools, $academicRecords);

        return [
            'report_type' => $type,
            'date_range' => $dateRange,
            'generated_at' => now(),
            'metrics' => $metrics,
            'summary' => $this->generateReportSummary($metrics)
        ];
    }

    /**
     * Helper methods for calculations
     */
    private function calculateCompletionRate($program, $students)
    {
        $programStudents = array_filter($students, function($student) use ($program) {
            return ($student['program'] ?? $student['course'] ?? '') === $program;
        });
        
        $completed = count(array_filter($programStudents, function($student) {
            return $student['status'] === 'graduated' || $student['status'] === 'completed';
        }));
        
        return count($programStudents) > 0 ? round(($completed / count($programStudents)) * 100, 2) : 0;
    }

    private function calculateEffectivenessScore($program)
    {
        $completionRate = $program['completion_rate'] ?? 0;
        $studentCount = $program['total_students'] ?? 0;
        
        // Weighted score: 70% completion rate + 30% student count (normalized)
        $completionWeight = 0.7;
        $studentWeight = 0.3;
        
        $normalizedStudentCount = min(($studentCount / 100) * 100, 100);
        
        return round(($completionRate * $completionWeight) + ($normalizedStudentCount * $studentWeight), 2);
    }

    private function calculateSchoolPerformanceScore($school)
    {
        $totalStudents = $school['total_students'] ?? 0;
        $activeStudents = $school['active_students'] ?? 0;
        
        $retentionRate = $totalStudents > 0 ? ($activeStudents / $totalStudents) * 100 : 0;
        
        return round($retentionRate, 2);
    }

    private function calculatePerformanceTrends($academicRecords)
    {
        // Implementation for performance trends
        return [];
    }

    private function generateReportSummary($metrics)
    {
        return [
            'total_students' => $metrics['overview']['total_students'],
            'approval_rate' => $metrics['overview']['approval_rate'],
            'average_gpa' => $metrics['gpa_statistics']['average_gpa'],
            'top_program' => $this->getTopProgram($metrics['program_distribution']),
            'top_school' => $this->getTopSchool($metrics['school_distribution'])
        ];
    }

    private function getTopProgram($programs)
    {
        if (empty($programs)) return null;
        
        $topProgram = $programs[0];
        foreach ($programs as $program) {
            if ($program['total_students'] > $topProgram['total_students']) {
                $topProgram = $program;
            }
        }
        
        return $topProgram['name'];
    }

    private function getTopSchool($schools)
    {
        if (empty($schools)) return null;
        
        $topSchool = $schools[0];
        foreach ($schools as $school) {
            if ($school['total_students'] > $topSchool['total_students']) {
                $topSchool = $school;
            }
        }
        
        return $topSchool['name'];
    }
}
