<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;

class ArchivedDataController extends Controller
{
    /**
     * Get archived users
     */
    public function getArchivedUsers(): JsonResponse
    {
        try {
            $archivedUsers = User::onlyTrashed()
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($user) {
                    return [
                        'id' => $user->id,
                        'name' => trim($user->first_name . ' ' . 
                                 ($user->middle_name ? $user->middle_name . ' ' : '') . 
                                 $user->last_name . ' ' . 
                                 ($user->extension_name ?? '')),
                        'email' => $user->email,
                        'role' => $user->role,
                        'deleted_at' => $user->deleted_at->toISOString(),
                        'deleted_by' => $user->deleted_by,
                        'reason' => $user->deletion_reason
                    ];
                });

            return response()->json([
                'success' => true,
                'data' => $archivedUsers,
                'message' => 'Archived users retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching archived users', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived users: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived users count
     */
    public function getArchivedUsersCount(): JsonResponse
    {
        try {
            $count = User::onlyTrashed()->count();

            return response()->json([
                'success' => true,
                'count' => $count,
                'message' => 'Archived users count retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching archived users count', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived users count: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived user details
     */
    public function getArchivedUserDetails(int $userId): JsonResponse
    {
        try {
            $user = User::onlyTrashed()->find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived user not found'
                ], 404);
            }

            $userData = [
                'id' => $user->id,
                'citizen_id' => $user->citizen_id,
                'email' => $user->email,
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
                'deleted_at' => $user->deleted_at->toISOString(),
                'deleted_by' => $user->deleted_by,
                'reason' => $user->deletion_reason
            ];

            return response()->json([
                'success' => true,
                'data' => $userData,
                'message' => 'Archived user details retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching archived user details', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived user details: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore archived user
     */
    public function restoreUser(int $userId): JsonResponse
    {
        try {
            $user = User::onlyTrashed()->find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived user not found'
                ], 404);
            }

            $user->restore();
            $user->update([
                'deleted_by' => null,
                'deletion_reason' => null,
                'is_active' => true,
                'status' => 'active'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'User restored successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error restoring user', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to restore user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete archived user
     */
    public function permanentDeleteUser(int $userId): JsonResponse
    {
        try {
            $user = User::onlyTrashed()->find($userId);

            if (!$user) {
                return response()->json([
                    'success' => false,
                    'message' => 'Archived user not found'
                ], 404);
            }

            $user->forceDelete();

            return response()->json([
                'success' => true,
                'message' => 'User permanently deleted'
            ]);

        } catch (\Exception $e) {
            Log::error('Error permanently deleting user', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to permanently delete user: ' . $e->getMessage()
            ], 500);
        }
    }
}
