<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    /**
     * Get user by ID
     */
    public function getUserById(int $id): JsonResponse
    {
        try {
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get multiple users by IDs
     */
    public function getUsersByIds(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'user_ids' => 'required|array',
                'user_ids.*' => 'integer'
            ]);
            
            $userIds = $request->input('user_ids');
            $users = User::whereIn('id', $userIds)->get();
            
            $userData = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'name' => trim($user->first_name . ' ' . $user->middle_name . ' ' . $user->last_name),
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all staff users
     */
    public function getStaffUsers(): JsonResponse
    {
        try {
            $staffUsers = User::where('role', 'staff')
                ->where('is_active', true)
                ->get();
            
            $staffData = $staffUsers->map(function ($user) {
                return [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'name' => trim($user->first_name . ' ' . $user->middle_name . ' ' . $user->last_name),
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $staffData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve staff users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user by email
     */
    public function getUserByEmail(string $email): JsonResponse
    {
        try {
            $user = User::where('email', $email)->first();
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }
            
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'name' => trim($user->first_name . ' ' . $user->middle_name . ' ' . $user->last_name),
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all users with optional role filter
     */
    public function getAllUsers(Request $request): JsonResponse
    {
        try {
            $role = $request->query('role');
            $status = $request->query('status');
            
            $query = User::query();
            
            if ($role) {
                $query->where('role', $role);
            }
            
            if ($status === 'active') {
                $query->where('is_active', true);
            } elseif ($status === 'inactive') {
                $query->where('is_active', false);
            }
            
            $users = $query->get();
            
            $userData = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'name' => trim($user->first_name . ' ' . ($user->middle_name ? $user->middle_name . ' ' : '') . $user->last_name . ' ' . ($user->extension_name ?? '')),
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'birthdate' => $user->birthdate,
                    'address' => $user->address,
                    'house_number' => $user->house_number,
                    'street' => $user->street,
                    'barangay' => $user->barangay,
                    'role' => $user->role,
                    'status' => $user->status,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get users by role
     */
    public function getUsersByRole(string $role): JsonResponse
    {
        try {
            $users = User::where('role', $role)->get();
            
            $userData = $users->map(function ($user) {
                return [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'name' => trim($user->first_name . ' ' . ($user->middle_name ? $user->middle_name . ' ' : '') . $user->last_name . ' ' . ($user->extension_name ?? '')),
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'email_verified_at' => $user->email_verified_at,
                    'created_at' => $user->created_at,
                    'updated_at' => $user->updated_at,
                ];
            });
            
            return response()->json([
                'success' => true,
                'data' => $userData
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve users: ' . $e->getMessage()
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
            ]);

            $user = User::create([
                ...$validated,
                'password' => bcrypt($validated['password']),
                'is_active' => true,
                'status' => 'active',
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'created_at' => $user->created_at,
                ],
                'message' => 'User created successfully'
            ], 201);
        } catch (\Exception $e) {
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
            $user = User::find($id);
            
            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'User not found'
                ], 404);
            }

            $validated = $request->validate([
                'email' => 'sometimes|email|unique:users,email,' . $id,
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
            ]);

            $user->update($validated);

            return response()->json([
                'success' => true,
                'data' => [
                    'id' => $user->id,
                    'citizen_id' => $user->citizen_id,
                    'email' => $user->email,
                    'first_name' => $user->first_name,
                    'last_name' => $user->last_name,
                    'middle_name' => $user->middle_name,
                    'extension_name' => $user->extension_name,
                    'mobile' => $user->mobile,
                    'role' => $user->role,
                    'is_active' => $user->is_active,
                    'updated_at' => $user->updated_at,
                ],
                'message' => 'User updated successfully'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get user statistics
     */
    public function getUserStats(): JsonResponse
    {
        try {
            $stats = [
                'total' => User::count(),
                'active' => User::where('is_active', true)->count(),
                'inactive' => User::where('is_active', false)->count(),
                'by_role' => [
                    'citizens' => User::where('role', 'citizen')->count(),
                    'staff' => User::where('role', 'staff')->count(),
                    'admins' => User::where('role', 'admin')->count(),
                    'ps_reps' => User::where('role', 'ps_rep')->count(),
                ],
            ];

            return response()->json([
                'success' => true,
                'data' => $stats
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve statistics: ' . $e->getMessage()
            ], 500);
        }
    }
}
