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
}
