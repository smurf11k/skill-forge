<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class UserTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    public function test_admin_can_list_users(): void
    {
        $admin = $this->makeUser('admin');
        $this->makeUser('employee', 'employee1@skillforge.test');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson('/api/users');

        $response->assertStatus(200);
        $this->assertGreaterThanOrEqual(2, count($response->json()));
    }

    public function test_employee_cannot_list_users(): void
    {
        $employee = $this->makeUser('employee');

        $response = $this->withHeader('Authorization', $this->authHeader($employee))
            ->getJson('/api/users');

        $response->assertStatus(403);
    }

    public function test_admin_cannot_demote_self(): void
    {
        $admin = $this->makeUser('admin');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/users/{$admin->id}/role", ['role' => 'employee']);

        $response->assertStatus(422)
            ->assertJsonFragment(['error' => 'Cannot change your own role']);
    }

    public function test_admin_can_update_other_user_role(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/users/{$employee->id}/role", ['role' => 'admin']);

        $response->assertStatus(200)->assertJson(['updated' => true]);
        $this->assertDatabaseHas('users', ['id' => $employee->id, 'role' => 'admin']);
    }

    public function test_admin_cannot_delete_self_but_can_delete_other_user(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');

        $selfDelete = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/users/{$admin->id}");

        $selfDelete->assertStatus(422)
            ->assertJsonFragment(['error' => 'Cannot delete your own account']);

        $deleteOther = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/users/{$employee->id}");

        $deleteOther->assertStatus(200)->assertJson(['deleted' => true]);
        $this->assertDatabaseMissing('users', ['id' => $employee->id]);
    }

    public function test_admin_stats_and_team_progress_are_returned(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse(['title' => 'Stats Course']);
        $lessonId = $this->makeLesson($courseId);
        $quizId = $this->makeQuiz($courseId);

        DB::table('results')->insert([
            'user_id' => $employee->id,
            'course_id' => $courseId,
            'quiz_id' => $quizId,
            'score' => 8,
            'total_questions' => 10,
            'completed_at' => now(),
        ]);

        DB::table('lesson_progress')->insert([
            'user_id' => $employee->id,
            'lesson_id' => $lessonId,
            'completed_at' => now(),
        ]);

        $stats = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson('/api/admin/stats');

        $stats->assertStatus(200)
            ->assertJsonStructure([
                'total_users',
                'total_employees',
                'total_admins',
                'total_courses',
                'total_results',
                'avg_score',
                'users_with_results',
            ]);

        $team = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson('/api/admin/team-progress');

        $team->assertStatus(200)
            ->assertJsonStructure(['results', 'lesson_progress']);
    }
}
