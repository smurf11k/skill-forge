<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuizTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    // ── Listing ───────────────────────────────────────────────────────────────

    public function test_employee_can_list_published_quizzes(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $this->makeQuiz($courseId, ['status' => 'published']);
        $this->makeQuiz($courseId, ['status' => 'published', 'order_number' => 2]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/quizzes");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_employee_cannot_see_draft_quizzes(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $this->makeQuiz($courseId, ['status' => 'published']);
        $this->makeQuiz($courseId, ['status' => 'draft', 'order_number' => 2]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/quizzes");

        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_admin_can_see_draft_quizzes(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $this->makeQuiz($courseId, ['status' => 'published']);
        $this->makeQuiz($courseId, ['status' => 'draft', 'order_number' => 2]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson("/api/courses/$courseId/quizzes");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    // ── Questions ─────────────────────────────────────────────────────────────

    public function test_employee_can_fetch_quiz_questions(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $this->makeQuestion($quizId);
        $this->makeQuestion($quizId, 'a', ['order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/quizzes/$quizId/questions");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_questions_do_not_expose_correct_answer(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $this->makeQuestion($quizId);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/quizzes/$quizId/questions");

        foreach ($response->json() as $question) {
            $this->assertArrayNotHasKey('correct_answer', $question);
        }
    }

    // ── Submitting ────────────────────────────────────────────────────────────

    public function test_employee_can_submit_quiz_and_get_score(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $q1 = $this->makeQuestion($quizId, 'b');
        $q2 = $this->makeQuestion($quizId, 'c', [
            'order_number' => 1,
            'question_text' => 'Capital of France?',
            'option_a' => 'Berlin',
            'option_b' => 'Madrid',
            'option_c' => 'Paris',
            'option_d' => 'Rome',
        ]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/quizzes/$quizId/submit", [
                'answers' => [
                    ['question_id' => $q1, 'answer' => 'b'],
                    ['question_id' => $q2, 'answer' => 'c'],
                ]
            ]);

        $response->assertStatus(200)
            ->assertJson(['score' => 2, 'total_questions' => 2]);
    }

    public function test_partial_correct_answers_score_correctly(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $q1 = $this->makeQuestion($quizId, 'b');
        $q2 = $this->makeQuestion($quizId, 'c', [
            'order_number' => 1,
            'question_text' => 'Capital of France?',
            'option_a' => 'Berlin',
            'option_b' => 'Madrid',
            'option_c' => 'Paris',
            'option_d' => 'Rome',
        ]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/quizzes/$quizId/submit", [
                'answers' => [
                    ['question_id' => $q1, 'answer' => 'a'], // wrong
                    ['question_id' => $q2, 'answer' => 'c'], // correct
                ]
            ]);

        $response->assertStatus(200)
            ->assertJson(['score' => 1, 'total_questions' => 2]);
    }

    public function test_quiz_result_is_saved_to_database(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $q1 = $this->makeQuestion($quizId, 'b');

        $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/quizzes/$quizId/submit", [
                'answers' => [['question_id' => $q1, 'answer' => 'b']]
            ]);

        $this->assertDatabaseHas('results', [
            'user_id' => $user->id,
            'course_id' => $courseId,
            'quiz_id' => $quizId,
            'score' => 1,
        ]);
    }

    public function test_multiple_attempts_are_all_saved(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $q1 = $this->makeQuestion($quizId, 'b');
        $auth = $this->authHeader($user);

        $this->withHeader('Authorization', $auth)->postJson("/api/quizzes/$quizId/submit", [
            'answers' => [['question_id' => $q1, 'answer' => 'a']] // wrong
        ]);
        $this->withHeader('Authorization', $auth)->postJson("/api/quizzes/$quizId/submit", [
            'answers' => [['question_id' => $q1, 'answer' => 'b']] // correct
        ]);

        $count = \Illuminate\Support\Facades\DB::table('results')
            ->where('user_id', $user->id)
            ->where('quiz_id', $quizId)
            ->count();

        $this->assertEquals(2, $count);
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    public function test_admin_can_create_quiz(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/quizzes', [
                'course_id' => $courseId,
                'title' => 'New Quiz',
                'status' => 'published',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('quizzes', ['title' => 'New Quiz', 'course_id' => $courseId]);
    }

    public function test_employee_cannot_create_quiz(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson('/api/quizzes', [
                'course_id' => $courseId,
                'title' => 'Sneaky Quiz',
                'status' => 'published',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_quiz(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/quizzes/$quizId", [
                'title' => 'Updated Quiz',
                'status' => 'published',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $quizId, 'title' => 'Updated Quiz']);
    }

    public function test_admin_can_delete_quiz(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/quizzes/$quizId");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('quizzes', ['id' => $quizId]);
    }

    // ── Reordering ────────────────────────────────────────────────────────────

    public function test_admin_can_reorder_quizzes(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $q1 = $this->makeQuiz($courseId, ['order_number' => 0]);
        $q2 = $this->makeQuiz($courseId, ['order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson('/api/quizzes/reorder', [
                'items' => [
                    ['id' => $q1, 'order_number' => 1],
                    ['id' => $q2, 'order_number' => 0],
                ]
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('quizzes', ['id' => $q1, 'order_number' => 1]);
        $this->assertDatabaseHas('quizzes', ['id' => $q2, 'order_number' => 0]);
    }
}