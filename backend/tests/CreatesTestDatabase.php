<?php

namespace Tests;

use Illuminate\Support\Facades\DB;

trait CreatesTestDatabase
{
    protected function setUpTestDatabase(): void
    {
        DB::statement('PRAGMA foreign_keys = ON');
    }

    // ── Helpers shared across test classes ────────────────────────────────────

    protected function makeUser(string $role = 'employee', ?string $email = null): \App\Models\User
    {
        $id = DB::table('users')->insertGetId([
            'name' => $role === 'admin' ? 'Test Admin' : 'Test Employee',
            'email' => $email ?? uniqid($role) . '@skillforge.test',
            'password' => \Illuminate\Support\Facades\Hash::make('password123'),
            'role' => $role,
        ]);
        return \App\Models\User::find($id);
    }

    protected function authHeader(\App\Models\User $user): string
    {
        return 'Bearer ' . $user->createToken('test')->plainTextToken;
    }

    protected function makeCourse(array $overrides = []): int
    {
        return DB::table('courses')->insertGetId(array_merge([
            'title' => 'Test Course',
            'description' => 'A test course',
            'status' => 'published',
        ], $overrides));
    }

    protected function makeLesson(int $courseId, array $overrides = []): int
    {
        return DB::table('lessons')->insertGetId(array_merge([
            'course_id' => $courseId,
            'title' => 'Test Lesson',
            'content' => 'Lesson content here.',
            'order_number' => 0,
            'status' => 'published',
        ], $overrides));
    }

    protected function makeQuiz(int $courseId, array $overrides = []): int
    {
        return DB::table('quizzes')->insertGetId(array_merge([
            'course_id' => $courseId,
            'title' => 'Test Quiz',
            'order_number' => 1,
            'status' => 'published',
        ], $overrides));
    }

    protected function makeQuestion(int $quizId, string $correct = 'b', array $overrides = []): int
    {
        return DB::table('questions')->insertGetId(array_merge([
            'quiz_id' => $quizId,
            'question_text' => 'What is 2 + 2?',
            'option_a' => '3',
            'option_b' => '4',
            'option_c' => '5',
            'option_d' => '6',
            'correct_answer' => $correct,
            'order_number' => 0,
        ], $overrides));
    }
}