<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CourseController;
use App\Http\Controllers\LessonController;
use App\Http\Controllers\LessonProgressController;
use App\Http\Controllers\QuizController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\ResultController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InviteController;

// Public
Route::post('/login', [AuthController::class, 'login']);

// Public invite accept (NO auth!)
Route::get('/invites/{token}', [InviteController::class, 'showByToken']);
Route::post('/invites/accept', [InviteController::class, 'accept']);

// Protected
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // Courses
    Route::apiResource('courses', CourseController::class);

    // Lessons
    Route::get('courses/{id}/lessons', [LessonController::class, 'byCourse']);
    Route::post('lessons', [LessonController::class, 'store']);
    Route::put('lessons/reorder', [LessonController::class, 'reorder']);
    Route::put('lessons/{id}', [LessonController::class, 'update']);
    Route::delete('lessons/{id}', [LessonController::class, 'destroy']);

    // Lesson progress
    Route::post('lessons/{id}/complete', [LessonProgressController::class, 'complete']);
    Route::get('courses/{id}/progress', [LessonProgressController::class, 'byCourse']);

    // Quizzes
    Route::get('courses/{courseId}/quizzes', [QuizController::class, 'byCourse']);
    Route::post('quizzes', [QuizController::class, 'store']);
    Route::put('quizzes/reorder', [QuizController::class, 'reorder']);
    Route::get('quizzes/{id}', [QuizController::class, 'show']);
    Route::put('quizzes/{id}', [QuizController::class, 'update']);
    Route::delete('quizzes/{id}', [QuizController::class, 'destroy']);
    Route::get('quizzes/{id}/questions', [QuizController::class, 'questions']);
    Route::post('quizzes/{id}/submit', [QuizController::class, 'submit']);

    // Questions
    Route::post('questions', [QuestionController::class, 'store']);
    Route::put('questions/reorder', [QuestionController::class, 'reorder']);
    Route::put('questions/{id}', [QuestionController::class, 'update']);
    Route::delete('questions/{id}', [QuestionController::class, 'destroy']);

    // Results
    Route::get('results/{userId}', [ResultController::class, 'byUser']);
    Route::delete('results/{userId}/reset', [ResultController::class, 'reset']);

    // Users (admin)
    Route::get('users', [UserController::class, 'index']);
    Route::put('users/{id}/role', [UserController::class, 'updateRole']);
    Route::delete('users/{id}', [UserController::class, 'destroy']);

    // Invites (admin)
    Route::get('/invites', [InviteController::class, 'index']);
    Route::post('/invites', [InviteController::class, 'store']);
    Route::post('/invites/{id}/resend', [InviteController::class, 'resend']);
    Route::delete('/invites/{id}', [InviteController::class, 'revoke']);

    // Admin stats & team progress
    Route::get('admin/stats', [UserController::class, 'stats']);
    Route::get('admin/team-progress', [UserController::class, 'teamProgress']);
});