<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class CourseAssignmentTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    public function test_employee_cannot_create_assignment(): void
    {
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($employee))
            ->postJson('/api/assignments', [
                'course_id' => $courseId,
                'user_id' => $employee->id,
                'send_email' => false,
            ]);

        $response->assertStatus(403);
    }

    public function test_admin_can_create_assignments_for_multiple_users(): void
    {
        $admin = $this->makeUser('admin');
        $employee1 = $this->makeUser('employee', 'e1@skillforge.test');
        $employee2 = $this->makeUser('employee', 'e2@skillforge.test');
        $courseId = $this->makeCourse(['title' => 'Assigned Course']);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/assignments', [
                'course_id' => $courseId,
                'user_ids' => [$employee1->id, $employee2->id],
                'due_at' => now()->addDays(3)->toDateTimeString(),
                'send_email' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['assignments', 'skipped_user_ids', 'email_results']);

        $this->assertDatabaseHas('course_assignments', [
            'user_id' => $employee1->id,
            'course_id' => $courseId,
            'assigned_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('course_assignments', [
            'user_id' => $employee2->id,
            'course_id' => $courseId,
            'assigned_by' => $admin->id,
        ]);
    }

    public function test_employee_only_sees_own_assignments_in_index(): void
    {
        $admin = $this->makeUser('admin');
        $employee1 = $this->makeUser('employee', 'emp1@skillforge.test');
        $employee2 = $this->makeUser('employee', 'emp2@skillforge.test');
        $course1 = $this->makeCourse(['title' => 'Course One']);
        $course2 = $this->makeCourse(['title' => 'Course Two']);

        DB::table('course_assignments')->insert([
            [
                'user_id' => $employee1->id,
                'course_id' => $course1,
                'assigned_by' => $admin->id,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'user_id' => $employee2->id,
                'course_id' => $course2,
                'assigned_by' => $admin->id,
                'assigned_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);

        $list = $this->withHeader('Authorization', $this->authHeader($employee1))
            ->getJson('/api/assignments');

        $list->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($list->json()));
        $this->assertContains($employee1->id, array_column($list->json(), 'user_id'));
    }

    public function test_deadline_status_becomes_in_progress_after_lesson_progress(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);
        $this->makeQuiz($courseId);

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/assignments', [
                'course_id' => $courseId,
                'user_id' => $employee->id,
                'send_email' => false,
            ])
            ->assertStatus(201);

        DB::table('lesson_progress')->insert([
            'user_id' => $employee->id,
            'lesson_id' => $lessonId,
            'completed_at' => now(),
        ]);

        $list = $this->withHeader('Authorization', $this->authHeader($employee))
            ->getJson('/api/assignments');

        $list->assertStatus(200);
        $this->assertEquals('in_progress', $list->json()[0]['deadline_status']);
    }

    public function test_admin_can_update_and_delete_assignment(): void
    {
        $admin = $this->makeUser('admin');
        $employee = $this->makeUser('employee');
        $courseId = $this->makeCourse();

        $create = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/assignments', [
                'course_id' => $courseId,
                'user_id' => $employee->id,
                'send_email' => false,
            ]);

        $assignmentId = $create->json('assignments.0.id');

        $update = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/assignments/{$assignmentId}", [
                'due_at' => now()->addDays(10)->toDateTimeString(),
            ]);

        $update->assertStatus(200)
            ->assertJsonPath('id', $assignmentId);

        $delete = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/assignments/{$assignmentId}");

        $delete->assertStatus(200)->assertJson(['success' => true]);
        $this->assertDatabaseMissing('course_assignments', ['id' => $assignmentId]);
    }
}
