<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/user', [AuthController::class, 'updateProfile']);
    Route::delete('/user/image', [AuthController::class, 'removeProfileImage']);
    Route::get('/users/search', [AuthController::class, 'searchUsers']);
    Route::get('/users/{id}', [AuthController::class, 'showProfile']);
    
    Route::get('/posts', [PostController::class, 'index']);
    Route::post('/posts', [PostController::class, 'store']);
    Route::put('/posts/{id}', [PostController::class, 'update']);
    Route::delete('/posts/{id}', [PostController::class, 'destroy']);
    Route::post('/posts/{id}/like', [PostController::class, 'like']);
    Route::post('/posts/{id}/comment', [PostController::class, 'comment']);

    Route::get('/notifications', [\App\Http\Controllers\NotificationController::class, 'index']);
    Route::post('/notifications/read', [\App\Http\Controllers\NotificationController::class, 'markAsRead']);

    Route::post('/logout', [AuthController::class, 'logout']);
});
