<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ArchivedData;
use App\Models\ScholarshipApplication;
use App\Models\Document;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Carbon\Carbon;

class ArchivedDataController extends Controller
{
    private $authServiceUrl;

    public function __construct()
    {
        $this->authServiceUrl = env('AUTH_SERVICE_URL', 'https://auth-gsph.up.railway.app');
    }

    /**
     * Get all archived data
     */
    public function getArchivedData(): JsonResponse
    {
        try {
            // Get archived users from auth service
            $archivedUsers = $this->getArchivedUsers();
            
            // Get archived applications
            $archivedApplications = $this->getArchivedApplications();
            
            // Get archived documents
            $archivedDocuments = $this->getArchivedDocuments();
            
            // Get archived logs
            $archivedLogs = $this->getArchivedLogs();

            return response()->json([
                'success' => true,
                'data' => [
                    'users' => $archivedUsers,
                    'applications' => $archivedApplications,
                    'documents' => $archivedDocuments,
                    'logs' => $archivedLogs
                ],
                'message' => 'Archived data retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching archived data', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived data by category
     */
    public function getArchivedDataByCategory(string $category): JsonResponse
    {
        try {
            $data = [];
            
            switch ($category) {
                case 'users':
                    $data = $this->getArchivedUsers();
                    break;
                case 'applications':
                    $data = $this->getArchivedApplications();
                    break;
                case 'documents':
                    $data = $this->getArchivedDocuments();
                    break;
                case 'logs':
                    $data = $this->getArchivedLogs();
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category specified'
                    ], 400);
            }

            return response()->json([
                'success' => true,
                'data' => $data,
                'message' => "Archived {$category} retrieved successfully"
            ]);

        } catch (\Exception $e) {
            Log::error("Error fetching archived {$category}", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to fetch archived {$category}: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Restore an archived item
     */
    public function restoreItem(string $category, int $itemId): JsonResponse
    {
        try {
            $restored = false;
            
            switch ($category) {
                case 'users':
                    $restored = $this->restoreUser($itemId);
                    break;
                case 'applications':
                    $restored = $this->restoreApplication($itemId);
                    break;
                case 'documents':
                    $restored = $this->restoreDocument($itemId);
                    break;
                case 'logs':
                    $restored = $this->restoreLog($itemId);
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category specified'
                    ], 400);
            }

            if ($restored) {
                // Log the restore action
                $this->logRestoreAction($category, $itemId);
                
                return response()->json([
                    'success' => true,
                    'message' => "Item restored successfully"
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found or could not be restored'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error("Error restoring {$category} item", ['item_id' => $itemId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to restore item: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Permanently delete an archived item
     */
    public function permanentDeleteItem(string $category, int $itemId): JsonResponse
    {
        try {
            $deleted = false;
            
            switch ($category) {
                case 'users':
                    $deleted = $this->permanentDeleteUser($itemId);
                    break;
                case 'applications':
                    $deleted = $this->permanentDeleteApplication($itemId);
                    break;
                case 'documents':
                    $deleted = $this->permanentDeleteDocument($itemId);
                    break;
                case 'logs':
                    $deleted = $this->permanentDeleteLog($itemId);
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category specified'
                    ], 400);
            }

            if ($deleted) {
                // Log the permanent delete action
                $this->logPermanentDeleteAction($category, $itemId);
                
                return response()->json([
                    'success' => true,
                    'message' => "Item permanently deleted"
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found or could not be deleted'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error("Error permanently deleting {$category} item", ['item_id' => $itemId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to permanently delete item: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived data statistics
     */
    public function getArchivedStats(): JsonResponse
    {
        try {
            $stats = [
                'users' => $this->getArchivedUsersCount(),
                'applications' => $this->getArchivedApplicationsCount(),
                'documents' => $this->getArchivedDocumentsCount(),
                'logs' => $this->getArchivedLogsCount(),
                'total' => $this->getArchivedUsersCount() + 
                          $this->getArchivedApplicationsCount() + 
                          $this->getArchivedDocumentsCount() + 
                          $this->getArchivedLogsCount()
            ];

            return response()->json([
                'success' => true,
                'data' => $stats,
                'message' => 'Archived statistics retrieved successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error fetching archived stats', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch archived statistics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search archived data
     */
    public function searchArchivedData(Request $request): JsonResponse
    {
        try {
            $query = $request->get('q', '');
            $category = $request->get('category', 'all');
            
            $results = [];
            
            if ($category === 'all' || $category === 'users') {
                $results['users'] = $this->searchArchivedUsers($query);
            }
            
            if ($category === 'all' || $category === 'applications') {
                $results['applications'] = $this->searchArchivedApplications($query);
            }
            
            if ($category === 'all' || $category === 'documents') {
                $results['documents'] = $this->searchArchivedDocuments($query);
            }
            
            if ($category === 'all' || $category === 'logs') {
                $results['logs'] = $this->searchArchivedLogs($query);
            }

            return response()->json([
                'success' => true,
                'data' => $results,
                'message' => 'Search completed successfully'
            ]);

        } catch (\Exception $e) {
            Log::error('Error searching archived data', ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => 'Failed to search archived data: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk restore items
     */
    public function bulkRestoreItems(string $category, Request $request): JsonResponse
    {
        try {
            $itemIds = $request->input('item_ids', []);
            $restoredCount = 0;
            
            foreach ($itemIds as $itemId) {
                $restored = false;
                
                switch ($category) {
                    case 'users':
                        $restored = $this->restoreUser($itemId);
                        break;
                    case 'applications':
                        $restored = $this->restoreApplication($itemId);
                        break;
                    case 'documents':
                        $restored = $this->restoreDocument($itemId);
                        break;
                    case 'logs':
                        $restored = $this->restoreLog($itemId);
                        break;
                }
                
                if ($restored) {
                    $restoredCount++;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "Successfully restored {$restoredCount} items",
                'data' => ['restored_count' => $restoredCount]
            ]);

        } catch (\Exception $e) {
            Log::error("Error bulk restoring {$category} items", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to bulk restore items: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk permanent delete items
     */
    public function bulkPermanentDeleteItems(string $category, Request $request): JsonResponse
    {
        try {
            $itemIds = $request->input('item_ids', []);
            $deletedCount = 0;
            
            foreach ($itemIds as $itemId) {
                $deleted = false;
                
                switch ($category) {
                    case 'users':
                        $deleted = $this->permanentDeleteUser($itemId);
                        break;
                    case 'applications':
                        $deleted = $this->permanentDeleteApplication($itemId);
                        break;
                    case 'documents':
                        $deleted = $this->permanentDeleteDocument($itemId);
                        break;
                    case 'logs':
                        $deleted = $this->permanentDeleteLog($itemId);
                        break;
                }
                
                if ($deleted) {
                    $deletedCount++;
                }
            }
            
            return response()->json([
                'success' => true,
                'message' => "Successfully permanently deleted {$deletedCount} items",
                'data' => ['deleted_count' => $deletedCount]
            ]);

        } catch (\Exception $e) {
            Log::error("Error bulk deleting {$category} items", ['error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to bulk delete items: " . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get archived item details
     */
    public function getArchivedItemDetails(string $category, int $itemId): JsonResponse
    {
        try {
            $item = null;
            
            switch ($category) {
                case 'users':
                    $item = $this->getArchivedUserDetails($itemId);
                    break;
                case 'applications':
                    $item = $this->getArchivedApplicationDetails($itemId);
                    break;
                case 'documents':
                    $item = $this->getArchivedDocumentDetails($itemId);
                    break;
                case 'logs':
                    $item = $this->getArchivedLogDetails($itemId);
                    break;
                default:
                    return response()->json([
                        'success' => false,
                        'message' => 'Invalid category specified'
                    ], 400);
            }

            if ($item) {
                return response()->json([
                    'success' => true,
                    'data' => $item,
                    'message' => 'Archived item details retrieved successfully'
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Item not found'
                ], 404);
            }

        } catch (\Exception $e) {
            Log::error("Error fetching archived {$category} item details", ['item_id' => $itemId, 'error' => $e->getMessage()]);
            return response()->json([
                'success' => false,
                'message' => "Failed to fetch item details: " . $e->getMessage()
            ], 500);
        }
    }

    // Private helper methods

    private function getArchivedUsers(): array
    {
        try {
            // Get archived users from auth service
            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/archived/users", [
                    'headers' => [
                        'Authorization' => 'Bearer ' . request()->bearerToken(),
                        'Accept' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['data'] ?? [];
            }

            // Fallback: get from local archived_data table
            return ArchivedData::where('resource_type', 'user')
                ->orderBy('deleted_at', 'desc')
                ->get()
                ->map(function ($item) {
                    $originalData = $item->original_data;
                    return [
                        'id' => $item->resource_id,
                        'name' => trim(($originalData['first_name'] ?? '') . ' ' . 
                                 ($originalData['middle_name'] ?? '') . ' ' . 
                                 ($originalData['last_name'] ?? '') . ' ' . 
                                 ($originalData['extension_name'] ?? '')),
                        'email' => $originalData['email'] ?? '',
                        'role' => $originalData['role'] ?? '',
                        'deleted_at' => $item->deleted_at->toISOString(),
                        'deleted_by' => $item->deleted_by,
                        'reason' => $item->deletion_reason
                    ];
                })
                ->toArray();

        } catch (\Exception $e) {
            Log::error('Error fetching archived users', ['error' => $e->getMessage()]);
            return [];
        }
    }

    private function getArchivedApplications(): array
    {
        return ScholarshipApplication::onlyTrashed()
            ->with(['student', 'category', 'subcategory'])
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($application) {
                return [
                    'id' => $application->id,
                    'applicant_name' => $application->student ? 
                        trim($application->student->first_name . ' ' . 
                             ($application->student->middle_name ?? '') . ' ' . 
                             $application->student->last_name . ' ' . 
                             ($application->student->extension_name ?? '')) : 'Unknown',
                    'scholarship_type' => $application->category->name ?? 'Unknown',
                    'status' => $application->status,
                    'deleted_at' => $application->deleted_at->toISOString(),
                    'deleted_by' => $application->deleted_by,
                    'reason' => $application->deletion_reason
                ];
            })
            ->toArray();
    }

    private function getArchivedDocuments(): array
    {
        return Document::onlyTrashed()
            ->with(['application', 'user'])
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($document) {
                return [
                    'id' => $document->id,
                    'name' => $document->original_name,
                    'type' => $document->type,
                    'size' => $this->formatFileSize($document->size),
                    'deleted_at' => $document->deleted_at->toISOString(),
                    'deleted_by' => $document->deleted_by,
                    'reason' => $document->deletion_reason
                ];
            })
            ->toArray();
    }

    private function getArchivedLogs(): array
    {
        return AuditLog::onlyTrashed()
            ->orderBy('deleted_at', 'desc')
            ->get()
            ->map(function ($log) {
                return [
                    'id' => $log->id,
                    'action' => $log->action,
                    'user' => $log->user_email ?? 'System',
                    'deleted_at' => $log->deleted_at->toISOString(),
                    'deleted_by' => $log->deleted_by,
                    'reason' => $log->deletion_reason
                ];
            })
            ->toArray();
    }

    private function getArchivedUsersCount(): int
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/archived/users/count", [
                    'headers' => [
                        'Authorization' => 'Bearer ' . request()->bearerToken(),
                        'Accept' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                $data = $response->json();
                return $data['count'] ?? 0;
            }

            return ArchivedData::where('resource_type', 'user')->count();
        } catch (\Exception $e) {
            return ArchivedData::where('resource_type', 'user')->count();
        }
    }

    private function getArchivedApplicationsCount(): int
    {
        return ScholarshipApplication::onlyTrashed()->count();
    }

    private function getArchivedDocumentsCount(): int
    {
        return Document::onlyTrashed()->count();
    }

    private function getArchivedLogsCount(): int
    {
        return AuditLog::onlyTrashed()->count();
    }

    private function searchArchivedUsers(string $query): array
    {
        $users = $this->getArchivedUsers();
        return array_filter($users, function($user) use ($query) {
            return stripos($user['name'], $query) !== false || 
                   stripos($user['email'], $query) !== false;
        });
    }

    private function searchArchivedApplications(string $query): array
    {
        $applications = $this->getArchivedApplications();
        return array_filter($applications, function($app) use ($query) {
            return stripos($app['applicant_name'], $query) !== false || 
                   stripos($app['scholarship_type'], $query) !== false;
        });
    }

    private function searchArchivedDocuments(string $query): array
    {
        $documents = $this->getArchivedDocuments();
        return array_filter($documents, function($doc) use ($query) {
            return stripos($doc['name'], $query) !== false || 
                   stripos($doc['type'], $query) !== false;
        });
    }

    private function searchArchivedLogs(string $query): array
    {
        $logs = $this->getArchivedLogs();
        return array_filter($logs, function($log) use ($query) {
            return stripos($log['action'], $query) !== false || 
                   stripos($log['user'], $query) !== false;
        });
    }

    private function restoreUser(int $userId): bool
    {
        try {
            // Call auth service to restore user
            $response = Http::timeout(10)
                ->post("{$this->authServiceUrl}/api/archived/users/{$userId}/restore", [], [
                    'headers' => [
                        'Authorization' => 'Bearer ' . request()->bearerToken(),
                        'Accept' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                // Remove from local archived_data table
                ArchivedData::where('resource_type', 'user')
                    ->where('resource_id', $userId)
                    ->delete();
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Error restoring user', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function restoreApplication(int $applicationId): bool
    {
        try {
            $application = ScholarshipApplication::onlyTrashed()->find($applicationId);
            if ($application) {
                $application->restore();
                $application->update([
                    'deleted_by' => null,
                    'deletion_reason' => null
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error restoring application', ['application_id' => $applicationId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function restoreDocument(int $documentId): bool
    {
        try {
            $document = Document::onlyTrashed()->find($documentId);
            if ($document) {
                $document->restore();
                $document->update([
                    'deleted_by' => null,
                    'deletion_reason' => null
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error restoring document', ['document_id' => $documentId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function restoreLog(int $logId): bool
    {
        try {
            $log = AuditLog::onlyTrashed()->find($logId);
            if ($log) {
                $log->restore();
                $log->update([
                    'deleted_by' => null,
                    'deletion_reason' => null
                ]);
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error restoring log', ['log_id' => $logId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function permanentDeleteUser(int $userId): bool
    {
        try {
            // Call auth service to permanently delete user
            $response = Http::timeout(10)
                ->delete("{$this->authServiceUrl}/api/archived/users/{$userId}", [
                    'headers' => [
                        'Authorization' => 'Bearer ' . request()->bearerToken(),
                        'Accept' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                // Remove from local archived_data table
                ArchivedData::where('resource_type', 'user')
                    ->where('resource_id', $userId)
                    ->delete();
                return true;
            }

            return false;
        } catch (\Exception $e) {
            Log::error('Error permanently deleting user', ['user_id' => $userId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function permanentDeleteApplication(int $applicationId): bool
    {
        try {
            $application = ScholarshipApplication::onlyTrashed()->find($applicationId);
            if ($application) {
                $application->forceDelete();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error permanently deleting application', ['application_id' => $applicationId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function permanentDeleteDocument(int $documentId): bool
    {
        try {
            $document = Document::onlyTrashed()->find($documentId);
            if ($document) {
                // Delete physical file if it exists
                if (file_exists(storage_path('app/' . $document->path))) {
                    unlink(storage_path('app/' . $document->path));
                }
                $document->forceDelete();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error permanently deleting document', ['document_id' => $documentId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function permanentDeleteLog(int $logId): bool
    {
        try {
            $log = AuditLog::onlyTrashed()->find($logId);
            if ($log) {
                $log->forceDelete();
                return true;
            }
            return false;
        } catch (\Exception $e) {
            Log::error('Error permanently deleting log', ['log_id' => $logId, 'error' => $e->getMessage()]);
            return false;
        }
    }

    private function getArchivedUserDetails(int $userId): ?array
    {
        try {
            $response = Http::timeout(10)
                ->get("{$this->authServiceUrl}/api/archived/users/{$userId}", [
                    'headers' => [
                        'Authorization' => 'Bearer ' . request()->bearerToken(),
                        'Accept' => 'application/json',
                    ]
                ]);

            if ($response->successful()) {
                return $response->json()['data'] ?? null;
            }

            return null;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function getArchivedApplicationDetails(int $applicationId): ?array
    {
        $application = ScholarshipApplication::onlyTrashed()
            ->with(['student', 'category', 'subcategory', 'school'])
            ->find($applicationId);

        if (!$application) {
            return null;
        }

        return [
            'id' => $application->id,
            'application_number' => $application->application_number,
            'applicant_name' => $application->student ? 
                trim($application->student->first_name . ' ' . 
                     ($application->student->middle_name ?? '') . ' ' . 
                     $application->student->last_name . ' ' . 
                     ($application->student->extension_name ?? '')) : 'Unknown',
            'scholarship_type' => $application->category->name ?? 'Unknown',
            'subcategory' => $application->subcategory->name ?? null,
            'school' => $application->school->name ?? 'Unknown',
            'status' => $application->status,
            'requested_amount' => $application->requested_amount,
            'approved_amount' => $application->approved_amount,
            'deleted_at' => $application->deleted_at->toISOString(),
            'deleted_by' => $application->deleted_by,
            'reason' => $application->deletion_reason
        ];
    }

    private function getArchivedDocumentDetails(int $documentId): ?array
    {
        $document = Document::onlyTrashed()
            ->with(['application', 'user'])
            ->find($documentId);

        if (!$document) {
            return null;
        }

        return [
            'id' => $document->id,
            'name' => $document->original_name,
            'type' => $document->type,
            'size' => $this->formatFileSize($document->size),
            'mime_type' => $document->mime_type,
            'application_id' => $document->application_id,
            'user_id' => $document->user_id,
            'deleted_at' => $document->deleted_at->toISOString(),
            'deleted_by' => $document->deleted_by,
            'reason' => $document->deletion_reason
        ];
    }

    private function getArchivedLogDetails(int $logId): ?array
    {
        $log = AuditLog::onlyTrashed()->find($logId);

        if (!$log) {
            return null;
        }

        return [
            'id' => $log->id,
            'action' => $log->action,
            'user_email' => $log->user_email,
            'resource_type' => $log->resource_type,
            'resource_id' => $log->resource_id,
            'old_values' => $log->old_values,
            'new_values' => $log->new_values,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->user_agent,
            'deleted_at' => $log->deleted_at->toISOString(),
            'deleted_by' => $log->deleted_by,
            'reason' => $log->deletion_reason
        ];
    }

    private function formatFileSize(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= pow(1024, $pow);
        return round($bytes, 2) . ' ' . $units[$pow];
    }

    private function logRestoreAction(string $category, int $itemId): void
    {
        try {
            AuditLog::create([
                'action' => 'restore_archived_item',
                'user_email' => auth()->user()->email ?? 'system',
                'resource_type' => $category,
                'resource_id' => $itemId,
                'new_values' => ['restored_at' => now()],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error logging restore action', ['error' => $e->getMessage()]);
        }
    }

    private function logPermanentDeleteAction(string $category, int $itemId): void
    {
        try {
            AuditLog::create([
                'action' => 'permanent_delete_archived_item',
                'user_email' => auth()->user()->email ?? 'system',
                'resource_type' => $category,
                'resource_id' => $itemId,
                'new_values' => ['permanently_deleted_at' => now()],
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);
        } catch (\Exception $e) {
            Log::error('Error logging permanent delete action', ['error' => $e->getMessage()]);
        }
    }
}