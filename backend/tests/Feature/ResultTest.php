<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class ResultTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    private function submitQuiz(\App\Models\User $user, int $quizId, int $questionId, string $answer): void
    {
        $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/quizzes/$quizId/submit", [
                'answers' => [['question_id' => $questionId, 'answer' => $answer]]
            ]);
    }

    private function completeLesson(\App\Models\User $user, int $lessonId): void
    {
        $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/lessons/$lessonId/complete");
    }

    // ── Fetching results ──────────────────────────────────────────────────────

    public function test_user_can_fetch_their_own_results(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($user, $quizId, $qId, 'b');

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/results/{$user->id}");

        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_results_include_quiz_id(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($user, $quizId, $qId, 'b');

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/results/{$user->id}");

        $result = $response->json()[0];
        $this->assertEquals($quizId, $result['quiz_id']);
    }

    public function test_employee_cannot_fetch_another_users_results(): void
    {
        $user1 = $this->makeUser();
        $user2 = $this->makeUser();

        $response = $this->withHeader('Authorization', $this->authHeader($user1))
            ->getJson("/api/results/{$user2->id}");

        $response->assertStatus(403);
    }

    public function test_admin_can_fetch_any_users_results(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($employee, $quizId, $qId, 'b');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson("/api/results/{$employee->id}");

        $response->assertStatus(200)->assertJsonCount(1);
    }

    // ── Resetting ─────────────────────────────────────────────────────────────

    public function test_user_can_reset_their_own_progress(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $lessonId = $this->makeLesson($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($user, $quizId, $qId, 'b');
        $this->completeLesson($user, $lessonId);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->deleteJson("/api/results/{$user->id}/reset");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('results', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('lesson_progress', ['user_id' => $user->id]);
    }

    public function test_reset_clears_both_results_and_lesson_progress(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $lessonId = $this->makeLesson($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($user, $quizId, $qId, 'b');
        $this->completeLesson($user, $lessonId);

        // Verify data exists before reset
        $this->assertDatabaseHas('results', ['user_id' => $user->id]);
        $this->assertDatabaseHas('lesson_progress', ['user_id' => $user->id]);

        $this->withHeader('Authorization', $this->authHeader($user))
            ->deleteJson("/api/results/{$user->id}/reset");

        // Verify everything is cleared
        $this->assertDatabaseMissing('results', ['user_id' => $user->id]);
        $this->assertDatabaseMissing('lesson_progress', ['user_id' => $user->id]);
    }

    public function test_employee_cannot_reset_another_users_progress(): void
    {
        $user1 = $this->makeUser();
        $user2 = $this->makeUser();

        $response = $this->withHeader('Authorization', $this->authHeader($user1))
            ->deleteJson("/api/results/{$user2->id}/reset");

        $response->assertStatus(403);
    }

    public function test_admin_can_reset_any_users_progress(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $qId = $this->makeQuestion($quizId, 'b');

        $this->submitQuiz($employee, $quizId, $qId, 'b');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/results/{$employee->id}/reset");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('results', ['user_id' => $employee->id]);
    }
}