<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class QuestionTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    public function test_admin_can_create_question_and_order_is_incremented(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $this->makeQuestion($quizId, 'b', ['order_number' => 0]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/questions', [
                'quiz_id' => $quizId,
                'question_text' => 'Second question?',
                'option_a' => 'A',
                'option_b' => 'B',
                'option_c' => 'C',
                'option_d' => 'D',
                'correct_answer' => 'a',
            ]);

        $response->assertStatus(201)->assertJsonStructure(['id']);
        $this->assertDatabaseHas('questions', [
            'id' => $response->json('id'),
            'order_number' => 1,
        ]);
    }

    public function test_employee_cannot_create_question(): void
    {
        $employee = $this->makeUser();
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($employee))
            ->postJson('/api/questions', [
                'quiz_id' => $quizId,
                'question_text' => 'Q?',
                'option_a' => 'A',
                'option_b' => 'B',
                'option_c' => 'C',
                'option_d' => 'D',
                'correct_answer' => 'a',
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_update_and_delete_question(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $questionId = $this->makeQuestion($quizId, 'b');

        $update = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/questions/{$questionId}", [
                'question_text' => 'Updated question',
                'correct_answer' => 'c',
            ]);

        $update->assertStatus(200)->assertJson(['updated' => true]);
        $this->assertDatabaseHas('questions', [
            'id' => $questionId,
            'question_text' => 'Updated question',
            'correct_answer' => 'c',
        ]);

        $delete = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/questions/{$questionId}");

        $delete->assertStatus(200)->assertJson(['deleted' => true]);
        $this->assertDatabaseMissing('questions', ['id' => $questionId]);
    }

    public function test_admin_can_reorder_questions(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $quizId = $this->makeQuiz($courseId);
        $q1 = $this->makeQuestion($quizId, 'a', ['order_number' => 0]);
        $q2 = $this->makeQuestion($quizId, 'b', ['order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson('/api/questions/reorder', [
                'items' => [
                    ['id' => $q1, 'order_number' => 1],
                    ['id' => $q2, 'order_number' => 0],
                ],
            ]);

        $response->assertStatus(200)->assertJson(['reordered' => true]);
        $this->assertDatabaseHas('questions', ['id' => $q1, 'order_number' => 1]);
        $this->assertDatabaseHas('questions', ['id' => $q2, 'order_number' => 0]);
    }
}
