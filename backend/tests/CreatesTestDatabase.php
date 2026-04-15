<?php

namespace Tests;

use Illuminate\Support\Facades\DB;

trait CreatesTestDatabase
{
    protected function setUpTestDatabase(): void
    {
        DB::statement('PRAGMA foreign_keys = ON');

        DB::statement('CREATE TABLE IF NOT EXISTS users (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            name       VARCHAR(100)  NOT NULL,
            email      VARCHAR(150)  UNIQUE NOT NULL,
            password   VARCHAR(255)  NOT NULL,
            role       VARCHAR(20)   NOT NULL DEFAULT "employee",
            created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS personal_access_tokens (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            tokenable_type VARCHAR(255) NOT NULL,
            tokenable_id   INTEGER      NOT NULL,
            name           VARCHAR(255) NOT NULL,
            token          VARCHAR(64)  UNIQUE NOT NULL,
            abilities      TEXT,
            last_used_at   TIMESTAMP    NULL,
            expires_at     TIMESTAMP    NULL,
            created_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at     TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS user_invites (
            id         INTEGER PRIMARY KEY AUTOINCREMENT,
            email      VARCHAR(150) NOT NULL,
            role       VARCHAR(20)  NOT NULL,
            token      VARCHAR(100) NOT NULL UNIQUE,
            invited_by INTEGER      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            expires_at TIMESTAMP    NOT NULL,
            accepted_at TIMESTAMP   NULL,
            revoked_at TIMESTAMP    NULL,
            created_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS courses (
            id          INTEGER PRIMARY KEY AUTOINCREMENT,
            title       VARCHAR(200) NOT NULL,
            description TEXT,
            status      VARCHAR(20)  NOT NULL DEFAULT "published",
            created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS lessons (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id    INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title        VARCHAR(200) NOT NULL,
            content      TEXT,
            order_number INT          DEFAULT 0,
            status       VARCHAR(20)  NOT NULL DEFAULT "published",
            created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS lesson_progress (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id      INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            lesson_id    INTEGER NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, lesson_id)
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS quizzes (
            id           INTEGER PRIMARY KEY AUTOINCREMENT,
            course_id    INTEGER      NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title        VARCHAR(200) NOT NULL,
            order_number INT          DEFAULT 0,
            status       VARCHAR(20)  NOT NULL DEFAULT "published",
            created_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
            updated_at   TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS questions (
            id             INTEGER PRIMARY KEY AUTOINCREMENT,
            quiz_id        INTEGER     NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
            question_text  TEXT        NOT NULL,
            option_a       VARCHAR(255),
            option_b       VARCHAR(255),
            option_c       VARCHAR(255),
            option_d       VARCHAR(255),
            correct_answer VARCHAR(1)  NOT NULL,
            order_number   INT         DEFAULT 0,
            created_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
            updated_at     TIMESTAMP   DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS results (
            id              INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id         INTEGER   NOT NULL REFERENCES users(id),
            course_id       INTEGER   NOT NULL REFERENCES courses(id),
            quiz_id         INTEGER   REFERENCES quizzes(id),
            score           INT       NOT NULL,
            total_questions INT       NOT NULL,
            completed_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )');

        DB::statement('CREATE TABLE IF NOT EXISTS course_assignments (
            id                   INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id              INTEGER   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            course_id            INTEGER   NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            assigned_by          INTEGER   NOT NULL REFERENCES users(id),
            due_at               TIMESTAMP NULL,
            assigned_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            notification_sent_at TIMESTAMP NULL,
            completed_at         TIMESTAMP NULL,
            created_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at           TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, course_id)
        )');
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