<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class InviteController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $invites = DB::table('user_invites')
            ->join('users as inviter', 'user_invites.invited_by', '=', 'inviter.id')
            ->select(
                'user_invites.id',
                'user_invites.email',
                'user_invites.role',
                'user_invites.expires_at',
                'user_invites.created_at',
                'user_invites.accepted_at',
                'user_invites.revoked_at',
                'inviter.name as invited_by_name'
            )
            ->whereNull('user_invites.accepted_at')
            ->whereNull('user_invites.revoked_at')
            ->orderByDesc('user_invites.created_at')
            ->get();

        return response()->json($invites);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'email' => ['required', 'email'],
            'role' => ['required', 'in:admin,employee'],
            'send_email' => ['nullable', 'boolean'],
        ]);

        $email = strtolower(trim($validated['email']));

        $existingUser = DB::table('users')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->exists();

        if ($existingUser) {
            return response()->json([
                'error' => 'A user with this email already exists.',
            ], 422);
        }

        $existingInvite = DB::table('user_invites')
            ->whereRaw('LOWER(email) = ?', [$email])
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->exists();

        if ($existingInvite) {
            return response()->json([
                'error' => 'A pending invite for this email already exists.',
            ], 422);
        }

        $token = Str::random(64);
        $expiresAt = now()->addDays(7);

        $inviteId = DB::table('user_invites')->insertGetId([
            'email' => $email,
            'role' => $validated['role'],
            'token' => $token,
            'invited_by' => $request->user()->id,
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $invite = DB::table('user_invites')
            ->join('users as inviter', 'user_invites.invited_by', '=', 'inviter.id')
            ->select(
                'user_invites.id',
                'user_invites.email',
                'user_invites.role',
                'user_invites.expires_at',
                'user_invites.created_at',
                'inviter.name as invited_by_name'
            )
            ->where('user_invites.id', $inviteId)
            ->first();

        $emailSent = false;

        if (($validated['send_email'] ?? true) === true) {
            $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
            $inviteUrl = "{$frontendUrl}/accept-invite?token={$token}";

            try {
                Mail::raw(
                    "You've been invited to SkillForge as {$validated['role']}.\n\nAccept your invite here:\n{$inviteUrl}\n\nThis link expires in 7 days.",
                    function ($message) use ($email) {
                        $message->to($email)->subject('You are invited to SkillForge');
                    }
                );

                $emailSent = true;
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return response()->json([
            'invite' => $invite,
            'email_sent' => $emailSent,
        ], 201);
    }

    public function resend(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $invite = DB::table('user_invites')
            ->where('id', $id)
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->first();

        if (!$invite) {
            return response()->json(['error' => 'Invite not found'], 404);
        }

        $newToken = Str::random(64);
        $newExpiry = now()->addDays(7);

        DB::table('user_invites')
            ->where('id', $id)
            ->update([
                'token' => $newToken,
                'expires_at' => $newExpiry,
                'updated_at' => now(),
            ]);

        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $inviteUrl = "{$frontendUrl}/accept-invite?token={$newToken}";

        $emailSent = false;

        try {
            Mail::raw(
                "Your SkillForge invite has been resent.\n\nAccept your invite here:\n{$inviteUrl}\n\nThis link expires in 7 days.",
                function ($message) use ($invite) {
                    $message->to($invite->email)->subject('Your SkillForge invite was resent');
                }
            );

            $emailSent = true;
        } catch (\Throwable $e) {
            report($e);
        }

        return response()->json([
            'success' => true,
            'email_sent' => $emailSent,
            'expires_at' => $newExpiry,
        ]);
    }

    public function revoke(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $updated = DB::table('user_invites')
            ->where('id', $id)
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->update([
                'revoked_at' => now(),
                'updated_at' => now(),
            ]);

        if (!$updated) {
            return response()->json(['error' => 'Invite not found'], 404);
        }

        return response()->json(['success' => true]);
    }

    public function showByToken(string $token)
    {
        $invite = DB::table('user_invites')
            ->select(
                'id',
                'email',
                'role',
                'expires_at',
                'accepted_at',
                'revoked_at',
                'created_at'
            )
            ->where('token', $token)
            ->first();

        if (!$invite) {
            return response()->json(['error' => 'Invalid invite token'], 404);
        }

        if ($invite->revoked_at) {
            return response()->json(['error' => 'Invite has been revoked'], 410);
        }

        if ($invite->accepted_at) {
            return response()->json(['error' => 'Invite has already been accepted'], 410);
        }

        if (now()->greaterThan($invite->expires_at)) {
            return response()->json(['error' => 'Invite has expired'], 410);
        }

        return response()->json([
            'email' => $invite->email,
            'role' => $invite->role,
            'expires_at' => $invite->expires_at,
        ]);
    }

    public function accept(Request $request)
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'name' => ['required', 'string', 'max:100'],
            'password' => ['required', 'string', 'min:6'],
        ]);

        $invite = DB::table('user_invites')
            ->where('token', $validated['token'])
            ->whereNull('accepted_at')
            ->whereNull('revoked_at')
            ->first();

        if (!$invite) {
            return response()->json(['error' => 'Invalid invite token'], 404);
        }

        if (now()->greaterThan($invite->expires_at)) {
            return response()->json(['error' => 'Invite has expired'], 410);
        }

        $existingUser = DB::table('users')
            ->whereRaw('LOWER(email) = ?', [strtolower($invite->email)])
            ->exists();

        if ($existingUser) {
            return response()->json(['error' => 'A user with this email already exists'], 422);
        }

        $userId = null;

        DB::transaction(function () use ($invite, $validated, &$userId) {
            $userId = DB::table('users')->insertGetId([
                'name' => $validated['name'],
                'email' => strtolower($invite->email),
                'password' => Hash::make($validated['password']),
                'role' => $invite->role,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::table('user_invites')
                ->where('id', $invite->id)
                ->update([
                    'accepted_at' => now(),
                    'updated_at' => now(),
                ]);
        });

        $user = User::find($userId);
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }
}