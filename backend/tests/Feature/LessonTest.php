<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class LessonTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    // ── Listing ───────────────────────────────────────────────────────────────

    public function test_employee_can_list_published_lessons(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $this->makeLesson($courseId, ['status' => 'published']);
        $this->makeLesson($courseId, ['status' => 'published', 'order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/lessons");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_employee_cannot_see_draft_lessons(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $this->makeLesson($courseId, ['status' => 'published']);
        $this->makeLesson($courseId, ['status' => 'draft', 'order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/lessons");

        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_admin_can_see_draft_lessons(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $this->makeLesson($courseId, ['status' => 'published']);
        $this->makeLesson($courseId, ['status' => 'draft', 'order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson("/api/courses/$courseId/lessons");

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_lessons_are_ordered_by_order_number(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $this->makeLesson($courseId, ['title' => 'Second', 'order_number' => 1]);
        $this->makeLesson($courseId, ['title' => 'First', 'order_number' => 0]);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/lessons");

        $lessons = $response->json();
        $this->assertEquals('First', $lessons[0]['title']);
        $this->assertEquals('Second', $lessons[1]['title']);
    }

    // ── Creating ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_lesson(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/lessons', [
                'course_id' => $courseId,
                'title' => 'Intro Lesson',
                'content' => 'Some content here.',
                'status' => 'published',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('lessons', ['title' => 'Intro Lesson', 'course_id' => $courseId]);
    }

    public function test_admin_can_create_draft_lesson(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/lessons', [
                'course_id' => $courseId,
                'title' => 'Draft Lesson',
                'status' => 'draft',
            ]);

        $this->assertDatabaseHas('lessons', ['title' => 'Draft Lesson', 'status' => 'draft']);
    }

    public function test_employee_cannot_create_lesson(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson('/api/lessons', [
                'course_id' => $courseId,
                'title' => 'Sneaky Lesson',
                'status' => 'published',
            ]);

        $response->assertStatus(403);
    }

    // ── Updating ──────────────────────────────────────────────────────────────

    public function test_admin_can_update_lesson(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/lessons/$lessonId", [
                'title' => 'Updated Lesson Title',
                'status' => 'published',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('lessons', ['id' => $lessonId, 'title' => 'Updated Lesson Title']);
    }

    public function test_admin_can_unpublish_lesson(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId, ['status' => 'published']);

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/lessons/$lessonId", ['title' => 'Test Lesson', 'status' => 'draft']);

        $this->assertDatabaseHas('lessons', ['id' => $lessonId, 'status' => 'draft']);
    }

    public function test_employee_cannot_update_lesson(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->putJson("/api/lessons/$lessonId", ['title' => 'Hacked']);

        $response->assertStatus(403);
    }

    // ── Deleting ──────────────────────────────────────────────────────────────

    public function test_admin_can_delete_lesson(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/lessons/$lessonId");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('lessons', ['id' => $lessonId]);
    }

    public function test_employee_cannot_delete_lesson(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->deleteJson("/api/lessons/$lessonId");

        $response->assertStatus(403);
    }

    // ── Lesson progress ───────────────────────────────────────────────────────

    public function test_employee_can_mark_lesson_complete(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/lessons/$lessonId/complete");

        $response->assertStatus(200)->assertJson(['completed' => true]);
        $this->assertDatabaseHas('lesson_progress', ['user_id' => $user->id, 'lesson_id' => $lessonId]);
    }

    public function test_marking_lesson_complete_twice_does_not_duplicate(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $lessonId = $this->makeLesson($courseId);
        $auth = $this->authHeader($user);

        $this->withHeader('Authorization', $auth)->postJson("/api/lessons/$lessonId/complete");
        $this->withHeader('Authorization', $auth)->postJson("/api/lessons/$lessonId/complete");

        $count = \Illuminate\Support\Facades\DB::table('lesson_progress')
            ->where('user_id', $user->id)
            ->where('lesson_id', $lessonId)
            ->count();

        $this->assertEquals(1, $count);
    }

    public function test_employee_can_fetch_course_progress(): void
    {
        $user = $this->makeUser();
        $courseId = $this->makeCourse();
        $l1 = $this->makeLesson($courseId);
        $l2 = $this->makeLesson($courseId, ['order_number' => 1]);

        // Complete only first lesson
        $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson("/api/lessons/$l1/complete");

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$courseId/progress");

        $response->assertStatus(200);
        $completedIds = $response->json('completed_lesson_ids');
        $this->assertContains($l1, $completedIds);
        $this->assertNotContains($l2, $completedIds);
    }

    // ── Reordering ────────────────────────────────────────────────────────────

    public function test_admin_can_reorder_lessons(): void
    {
        $admin = $this->makeUser('admin');
        $courseId = $this->makeCourse();
        $l1 = $this->makeLesson($courseId, ['order_number' => 0]);
        $l2 = $this->makeLesson($courseId, ['order_number' => 1]);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson('/api/lessons/reorder', [
                'items' => [
                    ['id' => $l1, 'order_number' => 1],
                    ['id' => $l2, 'order_number' => 0],
                ]
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('lessons', ['id' => $l1, 'order_number' => 1]);
        $this->assertDatabaseHas('lessons', ['id' => $l2, 'order_number' => 0]);
    }
}