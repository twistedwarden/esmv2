<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Services\AuthServiceClient;
use App\Services\AuditLogService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class UserManagementController extends Controller
{
    private AuthServiceClient $authService;
    private string $authServiceUrl;

    public function __construct(AuthServiceClient $authService)
    {
        $this->authService = $authService;
        $this->authServiceUrl = config('services.auth_service.url', 'http://localhost:8001');
    }

    /**
     * Get all users with role filtering and separation
     */
    public function getAllUsers(Request $request): JsonResponse
    {
        try {
            $role = $request->query('role');
            $status = $request->query('status', 'active');
            
            Log::info('Fetching users from auth service', [
                'auth_service_url' => $this->authServiceUrl,
                'role' => $role,
                'status' => $status
            ]);
            
            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/users", [
                    'role' => $role,
                    'status' => $status
                ]);

            Log::info('Auth service response', [
                'status' => $response->status(),
                'successful' => $response->successful(),
                'body' => $response->body()
            ]);

            if ($response->successful()) {
                $users = $response->json('data', []);
                
                Log::info('Raw users data from auth service', [
                    'users_count' => count($users),
                    'first_user' => $users[0] ?? null
                ]);
                
                // Separate citizens from other roles
                $categorizedUsers = [
                    'citizens' => [],
                    'staff' => [],
                    'admins' => [],
                    'ps_reps' => [],
                ];
                
                foreach ($users as $user) {
                    Log::info('Processing user', ['user_id' => $user['id'], 'role' => $user['role']]);
                    switch ($user['role']) {
                        case 'citizen':
                            $categorizedUsers['citizens'][] = $user;
                            break;
                        case 'staff':
                            $categorizedUsers['staff'][] = $user;
                            break;
                        case 'admin':
                            $categorizedUsers['admins'][] = $user;
                            break;
                        case 'ps_rep':
                            $categorizedUsers['ps_reps'][] = $user;
                            break;
                        default:
                            Log::warning('Unknown user role', ['role' => $user['role'], 'user_id' => $user['id']]);
                            break;
                    }
                }
                
                Log::info('Categorized users', [
                    'citizens_count' => count($categorizedUsers['citizens']),
                    'staff_count' => count($categorizedUsers['staff']),
                    'admins_count' => count($categorizedUsers['admins']),
                    'ps_reps_count' => count($categorizedUsers['ps_reps'])
                ]);
                
                return response()->json([
                    'success' => true,
                    'data' => $categorizedUsers,
                    'message' => 'Users retrieved successfully'
                ]);
            }

            Log::error('Auth service request failed', [
                'status' => $response->status(),
                'body' => $response->body()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users from auth service',
                'error' => $response->body()
            ], $response->status());
            
        } catch (\Exception $e) {
            Log::error('Error fetching users', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by specific role
     */
    public function getUsersByRole(string $role): JsonResponse
    {
        try {
            // Validate role
            $validRoles = ['admin', 'citizen', 'staff', 'ps_rep'];
            if (!in_array($role, $validRoles)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Invalid role specified'
                ], 400);
            }

            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/users/role/{$role}");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json('data', []),
                    'message' => ucfirst($role) . ' users retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users from auth service'
            ], $response->status());
            
        } catch (\Exception $e) {
            Log::error('Error fetching users by role', ['role' => $role, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user by ID
     */
    public function getUserById(int $id): JsonResponse
    {
        try {
            $user = $this->authService->getUserById($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            // If user is staff, get their staff record
            if ($user['role'] === 'staff') {
                $staffRecord = Staff::where('user_id', $id)->first();
                if ($staffRecord) {
                    $user['staff_details'] = [
                        'system_role' => $staffRecord->system_role,
                        'department' => $staffRecord->department,
                        'position' => $staffRecord->position,
                        'is_active' => $staffRecord->is_active,
                    ];
                }
            }

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User retrieved successfully'
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching user by ID', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a new user
     */
    public function createUser(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'citizen_id' => 'required|string|unique:users,citizen_id',
                'email' => 'required|email|unique:users,email',
                'password' => 'required|string|min:8',
                'first_name' => 'required|string|max:255',
                'last_name' => 'required|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'extension_name' => 'nullable|string|max:10',
                'mobile' => 'nullable|string|max:20',
                'birthdate' => 'nullable|date',
                'address' => 'nullable|string',
                'house_number' => 'nullable|string|max:50',
                'street' => 'nullable|string|max:255',
                'barangay' => 'nullable|string|max:255',
                'role' => 'required|in:admin,citizen,staff,ps_rep',
                // Staff-specific fields
                'system_role' => 'required_if:role,staff|in:interviewer,reviewer,administrator,coordinator',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
            ]);

            // Create user in auth service
            $response = Http::timeout(10)
                ->post("{$this->authServiceUrl}/api/users", $validated);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to create user in auth service',
                    'errors' => $response->json('errors', [])
                ], $response->status());
            }

            $user = $response->json('data');

            // Log user creation
            AuditLogService::logUserCreation($user);

            // If role is staff, create staff record
            if ($validated['role'] === 'staff' && isset($user['id'])) {
                Staff::create([
                    'user_id' => $user['id'],
                    'citizen_id' => $validated['citizen_id'],
                    'system_role' => $validated['system_role'] ?? 'coordinator',
                    'department' => $validated['department'] ?? null,
                    'position' => $validated['position'] ?? null,
                    'is_active' => true,
                ]);
            }

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User created successfully'
            ], 201);
            
        } catch (\Exception $e) {
            Log::error('Error creating user', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to create user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update user
     */
    public function updateUser(Request $request, int $id): JsonResponse
    {
        try {
            $validated = $request->validate([
                'email' => 'sometimes|email',
                'first_name' => 'sometimes|string|max:255',
                'last_name' => 'sometimes|string|max:255',
                'middle_name' => 'nullable|string|max:255',
                'extension_name' => 'nullable|string|max:10',
                'mobile' => 'nullable|string|max:20',
                'birthdate' => 'nullable|date',
                'address' => 'nullable|string',
                'house_number' => 'nullable|string|max:50',
                'street' => 'nullable|string|max:255',
                'barangay' => 'nullable|string|max:255',
                'role' => 'sometimes|in:admin,citizen,staff,ps_rep',
                'is_active' => 'sometimes|boolean',
                'status' => 'sometimes|string',
                // Staff-specific fields
                'system_role' => 'sometimes|in:interviewer,reviewer,administrator,coordinator',
                'department' => 'nullable|string|max:255',
                'position' => 'nullable|string|max:255',
            ]);

            // Update user in auth service
            $response = Http::timeout(10)
                ->put("{$this->authServiceUrl}/api/users/{$id}", $validated);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update user in auth service',
                    'errors' => $response->json('errors', [])
                ], $response->status());
            }

            $user = $response->json('data');

            // Log user update
            AuditLogService::logUserUpdate([], $user);

            // Update staff record if exists and staff fields are provided
            if (isset($validated['system_role']) || isset($validated['department']) || isset($validated['position'])) {
                $staffRecord = Staff::where('user_id', $id)->first();
                if ($staffRecord) {
                    $staffRecord->update([
                        'system_role' => $validated['system_role'] ?? $staffRecord->system_role,
                        'department' => $validated['department'] ?? $staffRecord->department,
                        'position' => $validated['position'] ?? $staffRecord->position,
                    ]);
                }
            }

            // Clear cache
            $this->authService->clearUserCache($id);

            return response()->json([
                'success' => true,
                'data' => $user,
                'message' => 'User updated successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error updating user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete/Deactivate user
     */
    public function deleteUser(int $id): JsonResponse
    {
        try {
            // Soft delete by deactivating
            $response = Http::timeout(10)
                ->put("{$this->authServiceUrl}/api/users/{$id}", [
                    'is_active' => false,
                    'status' => 'inactive'
                ]);

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to deactivate user'
                ], $response->status());
            }

            // Deactivate staff record if exists
            $staffRecord = Staff::where('user_id', $id)->first();
            if ($staffRecord) {
                $staffRecord->update(['is_active' => false]);
            }

            // Log user deletion
            $user = $response->json('data');
            AuditLogService::logUserDeletion($user);

            // Clear cache
            $this->authService->clearUserCache($id);

            return response()->json([
                'success' => true,
                'message' => 'User deactivated successfully'
            ]);
            
        } catch (\Exception $e) {
            Log::error('Error deleting user', ['id' => $id, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getUserStats(): JsonResponse
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/users/stats");

            if ($response->successful()) {
                return response()->json([
                    'success' => true,
                    'data' => $response->json('data', []),
                    'message' => 'User statistics retrieved successfully'
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics'
            ], $response->status());
            
        } catch (\Exception $e) {
            Log::error('Error fetching user stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}

