<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\SubtaskController;
use App\Http\Controllers\StatsController;

// Routes publiques
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login',    [AuthController::class, 'login']);

// Routes protégées
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    // Tasks
    Route::get('/tasks',                  [TaskController::class, 'index']);
    Route::post('/tasks',                 [TaskController::class, 'store']);
    Route::get('/tasks/{id}',             [TaskController::class, 'show']);
    Route::put('/tasks/{id}',             [TaskController::class, 'update']);
    Route::delete('/tasks/{id}',          [TaskController::class, 'destroy']);
    Route::patch('/tasks/{id}/complete',  [TaskController::class, 'complete']);

    // Subtasks
    Route::get('/tasks/{taskId}/subtasks',
        [SubtaskController::class, 'index']);
    Route::post('/tasks/{taskId}/subtasks',
        [SubtaskController::class, 'store']);
    Route::put('/tasks/{taskId}/subtasks/{subtaskId}',
        [SubtaskController::class, 'update']);
    Route::delete('/tasks/{taskId}/subtasks/{subtaskId}',
        [SubtaskController::class, 'destroy']);
    Route::patch('/tasks/{taskId}/subtasks/{subtaskId}/toggle',
        [SubtaskController::class, 'toggle']);

    // Stats
    Route::get('/stats', [StatsController::class, 'index']);
});
