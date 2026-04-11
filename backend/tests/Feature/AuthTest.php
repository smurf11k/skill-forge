<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    public function test_user_can_login_with_correct_credentials(): void
    {
        $this->makeUser('employee', 'login@skillforge.test');

        $response = $this->postJson('/api/login', [
            'email' => 'login@skillforge.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'role']]);
    }

    public function test_login_returns_correct_role(): void
    {
        $this->makeUser('admin', 'admin@skillforge.test');

        $response = $this->postJson('/api/login', [
            'email' => 'admin@skillforge.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('user.role', 'admin');
    }

    public function test_login_fails_with_wrong_password(): void
    {
        $this->makeUser('employee', 'wrong@skillforge.test');

        $response = $this->postJson('/api/login', [
            'email' => 'wrong@skillforge.test',
            'password' => 'notthepassword',
        ]);

        $response->assertStatus(401)
            ->assertJsonFragment(['error' => 'Invalid credentials']);
    }

    public function test_login_fails_with_nonexistent_email(): void
    {
        $response = $this->postJson('/api/login', [
            'email' => 'ghost@skillforge.test',
            'password' => 'password123',
        ]);

        $response->assertStatus(401);
    }

    public function test_login_fails_with_missing_fields(): void
    {
        $response = $this->postJson('/api/login', []);
        $response->assertStatus(422);
    }

    public function test_user_can_logout(): void
    {
        $user = $this->makeUser('employee', 'logout@skillforge.test');
        $token = $this->postJson('/api/login', [
            'email' => 'logout@skillforge.test',
            'password' => 'password123',
        ])->json('token');

        $response = $this->withHeader('Authorization', "Bearer $token")
            ->postJson('/api/logout');

        $response->assertStatus(200);
    }

    public function test_protected_route_requires_token(): void
    {
        $response = $this->getJson('/api/courses');
        $response->assertStatus(401);
    }

    public function test_invalid_token_is_rejected(): void
    {
        $response = $this->withHeader('Authorization', 'Bearer faketoken123')
            ->getJson('/api/courses');
        $response->assertStatus(401);
    }
}