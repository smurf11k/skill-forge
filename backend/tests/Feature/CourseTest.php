<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class CourseTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    // ── Listing ───────────────────────────────────────────────────────────────

    public function test_employee_can_list_published_courses(): void
    {
        $user = $this->makeUser();
        $this->makeCourse(['title' => 'Course A', 'status' => 'published']);
        $this->makeCourse(['title' => 'Course B', 'status' => 'published']);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson('/api/courses');

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_employee_cannot_see_draft_courses(): void
    {
        $user = $this->makeUser();
        $this->makeCourse(['status' => 'published']);
        $this->makeCourse(['status' => 'draft']);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson('/api/courses');

        $response->assertStatus(200)->assertJsonCount(1);
    }

    public function test_admin_can_see_draft_courses(): void
    {
        $admin = $this->makeUser('admin');
        $this->makeCourse(['status' => 'published']);
        $this->makeCourse(['status' => 'draft']);

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson('/api/courses');

        $response->assertStatus(200)->assertJsonCount(2);
    }

    public function test_employee_can_view_single_published_course(): void
    {
        $user = $this->makeUser();
        $id = $this->makeCourse(['title' => 'Laravel Basics']);

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson("/api/courses/$id");

        $response->assertStatus(200)
            ->assertJsonFragment(['title' => 'Laravel Basics']);
    }

    public function test_returns_404_for_missing_course(): void
    {
        $user = $this->makeUser();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->getJson('/api/courses/99999');

        $response->assertStatus(404);
    }

    // ── Creating ──────────────────────────────────────────────────────────────

    public function test_admin_can_create_published_course(): void
    {
        $admin = $this->makeUser('admin');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/courses', [
                'title' => 'New Course',
                'description' => 'A description',
                'status' => 'published',
            ]);

        $response->assertStatus(201)->assertJsonStructure(['id']);
    }

    public function test_admin_can_create_draft_course(): void
    {
        $admin = $this->makeUser('admin');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/courses', [
                'title' => 'Draft Course',
                'status' => 'draft',
            ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('courses', ['title' => 'Draft Course', 'status' => 'draft']);
    }

    public function test_employee_cannot_create_course(): void
    {
        $user = $this->makeUser();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->postJson('/api/courses', [
                'title' => 'Sneaky Course',
                'status' => 'published',
            ]);

        $response->assertStatus(403);
    }

    public function test_course_creation_requires_title(): void
    {
        $admin = $this->makeUser('admin');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/courses', ['description' => 'No title']);

        $response->assertStatus(422);
    }

    // ── Updating ──────────────────────────────────────────────────────────────

    public function test_admin_can_update_course(): void
    {
        $admin = $this->makeUser('admin');
        $id = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/courses/$id", [
                'title' => 'Updated Title',
                'status' => 'published',
            ]);

        $response->assertStatus(200);
        $this->assertDatabaseHas('courses', ['id' => $id, 'title' => 'Updated Title']);
    }

    public function test_admin_can_unpublish_course(): void
    {
        $admin = $this->makeUser('admin');
        $id = $this->makeCourse(['status' => 'published']);

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->putJson("/api/courses/$id", ['title' => 'Test Course', 'status' => 'draft']);

        $this->assertDatabaseHas('courses', ['id' => $id, 'status' => 'draft']);
    }

    public function test_employee_cannot_update_course(): void
    {
        $user = $this->makeUser();
        $id = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->putJson("/api/courses/$id", ['title' => 'Hacked']);

        $response->assertStatus(403);
    }

    // ── Deleting ──────────────────────────────────────────────────────────────

    public function test_admin_can_delete_course(): void
    {
        $admin = $this->makeUser('admin');
        $id = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/courses/$id");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('courses', ['id' => $id]);
    }

    public function test_employee_cannot_delete_course(): void
    {
        $user = $this->makeUser();
        $id = $this->makeCourse();

        $response = $this->withHeader('Authorization', $this->authHeader($user))
            ->deleteJson("/api/courses/$id");

        $response->assertStatus(403);
    }
}