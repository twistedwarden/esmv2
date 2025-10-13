<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\GsmAuthController;
use App\Http\Controllers\UserController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public authentication routes
Route::post('/login', [AuthController::class, 'login']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/auth/google', [AuthController::class, 'googleCallback']);
Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
Route::get('/user', [AuthController::class, 'user'])->middleware('auth:sanctum');

// GSM-compatible endpoints (migrated from sqlite PHP script)
Route::post('/gsm/login', [GsmAuthController::class, 'login']);
Route::post('/gsm/check-email', [GsmAuthController::class, 'checkEmail']);

// User management endpoints (for other services)
Route::prefix('users')->group(function () {
    Route::get('/', [UserController::class, 'getAllUsers']);
    Route::get('/role/{role}', [UserController::class, 'getUsersByRole']);
    Route::get('/stats', [UserController::class, 'getUserStats']);
    Route::get('/{id}', [UserController::class, 'getUserById']);
    Route::post('/', [UserController::class, 'createUser']);
    Route::put('/{id}', [UserController::class, 'updateUser']);
    Route::get('/email/{email}', [UserController::class, 'getUserByEmail']);
    Route::post('/batch', [UserController::class, 'getUsersByIds']);
    Route::get('/staff', [UserController::class, 'getStaffUsers']);
});
