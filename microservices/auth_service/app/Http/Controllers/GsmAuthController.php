<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\OtpVerification;
use App\Services\BrevoEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class GsmAuthController extends Controller
{
    protected $brevoService;

    public function __construct(BrevoEmailService $brevoService)
    {
        $this->brevoService = $brevoService;
    }

    /**
     * POST /api/gsm/login
     * Accepts { email, password } and returns a response compatible with the legacy gsm_login endpoint.
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
            'remember_me' => 'boolean|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => [ 'errors' => $validator->errors()->all() ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid email or password',
                'data' => null,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        // Check if user is active
        if ($user->status !== 'active') {
            return response()->json([
                'success' => false,
                'message' => 'Account is not active. Please verify your email first.',
                'data' => null,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 401);
        }

        // No OTP required - login immediately
        // Set token expiration based on remember me choice
        $rememberMe = $request->boolean('remember_me', false);
        $tokenName = $rememberMe ? 'auth-token-remember' : 'auth-token-session';
        
        $token = $user->createToken($tokenName, [], $rememberMe ? now()->addDays(30) : now()->addHours(24))->plainTextToken;

        // Get staff system role for staff users
        $systemRole = null;
        if ($user->role === 'staff') {
            $systemRole = $this->getStaffSystemRole($user->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
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
                    'system_role' => $systemRole,
                    'is_active' => $user->is_active,
                ],
                'token' => $token,
                'requires_otp' => false
            ],
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * POST /api/gsm/check-email
     * Accepts { email } and returns { exists }
     */
    public function checkEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => [ 'errors' => $validator->errors()->all() ],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        $exists = User::where('email', $request->email)->where('is_active', true)->exists();

        return response()->json([
            'success' => true,
            'message' => 'Email check completed',
            'data' => [ 'exists' => (bool) $exists ],
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * POST /api/gsm/login-with-otp
     * GSM-compatible OTP login with staff permission check
     */
    public function loginWithOtp(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
            'otp_code' => 'required|string|size:6',
            'remember_me' => 'boolean|nullable',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'data' => ['errors' => $validator->errors()->all()],
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        $user = User::where('email', $request->email)->first();
        
        $otp = OtpVerification::where('user_id', $user->id)
            ->where('otp_code', $request->otp_code)
            ->where('type', 'login')
            ->where('is_used', false)
            ->first();

        if (!$otp || !$otp->isValid()) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid or expired OTP',
                'data' => null,
                'timestamp' => now()->format('Y-m-d H:i:s'),
            ], 400);
        }

        // For staff users, check if they have permissions in scholarship service
        if ($user->role === 'staff') {
            $staffData = $this->getStaffDataFromScholarshipService($user->id);
            if (!$staffData) {
                return response()->json([
                    'success' => false,
                    'message' => 'Access denied. You do not have staff permissions.',
                    'data' => null,
                    'timestamp' => now()->format('Y-m-d H:i:s'),
                ], 403);
            }
        }

        // Mark OTP as used
        $otp->markAsUsed();

        // Create token with expiration based on remember me choice
        $rememberMe = $request->boolean('remember_me', false);
        $tokenName = $rememberMe ? 'auth-token-remember' : 'auth-token-session';
        
        $token = $user->createToken($tokenName, [], $rememberMe ? now()->addDays(30) : now()->addHours(24))->plainTextToken;

        // Get staff system role for staff users
        $systemRole = null;
        if ($user->role === 'staff') {
            $systemRole = $this->getStaffSystemRole($user->id);
        }

        return response()->json([
            'success' => true,
            'message' => 'Login successful',
            'data' => [
                'user' => [
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
                    'system_role' => $systemRole,
                    'is_active' => $user->is_active,
                ],
                'token' => $token
            ],
            'timestamp' => now()->format('Y-m-d H:i:s'),
        ]);
    }

    /**
     * Get staff system role from scholarship service
     */
    private function getStaffSystemRole($userId)
    {
        try {
            $scholarshipServiceUrl = config('services.scholarship_service.url', 'http://localhost:8001');
            
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->get("{$scholarshipServiceUrl}/api/public/staff/verify/{$userId}");
            
            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] && isset($data['data']['system_role'])) {
                    return $data['data']['system_role'];
                }
            }
        } catch (\Exception $e) {
            // Log error but don't fail login
            \Illuminate\Support\Facades\Log::warning('Failed to fetch staff system role', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
        
        return null;
    }

    /**
     * Check if staff user exists in scholarship service
     */
    private function getStaffDataFromScholarshipService($userId)
    {
        try {
            $scholarshipServiceUrl = config('services.scholarship_service.url', 'http://localhost:8001');
            
            $response = \Illuminate\Support\Facades\Http::timeout(10)
                ->get("{$scholarshipServiceUrl}/api/public/staff/verify/{$userId}");
            
            if ($response->successful()) {
                $data = $response->json();
                if ($data['success'] && isset($data['data'])) {
                    return $data['data'];
                }
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to fetch staff data from scholarship service', [
                'user_id' => $userId,
                'error' => $e->getMessage()
            ]);
        }
        
        return null;
    }
}






