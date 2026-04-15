<?php

namespace Tests\Feature;

use Tests\TestCase;
use Tests\CreatesTestDatabase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;

class InviteTest extends TestCase
{
    use RefreshDatabase, CreatesTestDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->setUpTestDatabase();
    }

    public function test_admin_can_create_invite_without_sending_email(): void
    {
        $admin = $this->makeUser('admin');

        $response = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'NEW.USER@SkillForge.test',
                'role' => 'employee',
                'send_email' => false,
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('invite.email', 'new.user@skillforge.test')
            ->assertJsonPath('email_sent', false);
    }

    public function test_cannot_create_duplicate_pending_invite_for_same_email(): void
    {
        $admin = $this->makeUser('admin');

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'dup@skillforge.test',
                'role' => 'employee',
                'send_email' => false,
            ])
            ->assertStatus(201);

        $second = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'DUP@skillforge.test',
                'role' => 'employee',
                'send_email' => false,
            ]);

        $second->assertStatus(422)
            ->assertJsonFragment(['error' => 'A pending invite for this email already exists.']);
    }

    public function test_public_can_resolve_invite_by_token_and_accept_it(): void
    {
        $admin = $this->makeUser('admin');

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'accept@skillforge.test',
                'role' => 'employee',
                'send_email' => false,
            ])
            ->assertStatus(201);

        $invite = DB::table('user_invites')
            ->where('email', 'accept@skillforge.test')
            ->first();

        $show = $this->getJson("/api/invites/{$invite->token}");

        $show->assertStatus(200)
            ->assertJsonPath('email', 'accept@skillforge.test')
            ->assertJsonPath('role', 'employee');

        $accept = $this->postJson('/api/invites/accept', [
            'token' => $invite->token,
            'name' => 'Accepted User',
            'password' => 'password123',
        ]);

        $accept->assertStatus(200)
            ->assertJsonStructure(['token', 'user' => ['id', 'email', 'role']]);

        $this->assertDatabaseHas('users', ['email' => 'accept@skillforge.test']);
        $this->assertDatabaseHas('user_invites', [
            'id' => $invite->id,
        ]);
        $this->assertNotNull(DB::table('user_invites')->where('id', $invite->id)->value('accepted_at'));
    }

    public function test_revoked_invite_returns_410_for_public_lookup(): void
    {
        $admin = $this->makeUser('admin');

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'revoke@skillforge.test',
                'role' => 'employee',
                'send_email' => false,
            ])
            ->assertStatus(201);

        $invite = DB::table('user_invites')
            ->where('email', 'revoke@skillforge.test')
            ->first();

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->deleteJson("/api/invites/{$invite->id}")
            ->assertStatus(200)
            ->assertJson(['success' => true]);

        $lookup = $this->getJson("/api/invites/{$invite->token}");
        $lookup->assertStatus(410)
            ->assertJsonFragment(['error' => 'Invite has been revoked']);
    }

    public function test_admin_can_list_and_resend_active_invites(): void
    {
        $admin = $this->makeUser('admin');

        $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson('/api/invites', [
                'email' => 'list@skillforge.test',
                'role' => 'employee',
                'send_email' => false,
            ])
            ->assertStatus(201);

        $invite = DB::table('user_invites')->where('email', 'list@skillforge.test')->first();

        $list = $this->withHeader('Authorization', $this->authHeader($admin))
            ->getJson('/api/invites');

        $list->assertStatus(200);
        $this->assertGreaterThanOrEqual(1, count($list->json()));

        $resend = $this->withHeader('Authorization', $this->authHeader($admin))
            ->postJson("/api/invites/{$invite->id}/resend");

        $resend->assertStatus(200)
            ->assertJsonStructure(['success', 'email_sent', 'expires_at']);
    }
}
