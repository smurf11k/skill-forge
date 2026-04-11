<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // GET /api/users — admin only
    public function index(Request $request)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $users = DB::table('users')
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    // PUT /api/users/{id}/role — admin only
    public function updateRole(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $request->validate(['role' => 'required|in:employee,admin']);

        // Prevent admin from demoting themselves
        if ($request->user()->id == $id && $request->role !== 'admin')
            return response()->json(['error' => 'Cannot change your own role'], 422);

        DB::table('users')->where('id', $id)->update(['role' => $request->role]);

        return response()->json(['updated' => true]);
    }

    // DELETE /api/users/{id} — admin only
    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        if ($request->user()->id == $id)
            return response()->json(['error' => 'Cannot delete your own account'], 422);

        DB::table('users')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    // GET /api/admin/stats — platform-wide stats for admin dashboard
    public function stats(Request $request)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $totalUsers = DB::table('users')->count();
        $totalEmployees = DB::table('users')->where('role', 'employee')->count();
        $totalAdmins = DB::table('users')->where('role', 'admin')->count();
        $totalCourses = DB::table('courses')->count();
        $totalResults = DB::table('results')->count();

        // Avg score across all results
        $results = DB::table('results')->get();
        $avgScore = $results->count() > 0
            ? round($results->avg(fn($r) => ($r->score / $r->total_questions) * 100))
            : null;

        // Per-user progress: count distinct users who have any result
        $usersWithResults = DB::table('results')->distinct('user_id')->count('user_id');

        return response()->json([
            'total_users' => $totalUsers,
            'total_employees' => $totalEmployees,
            'total_admins' => $totalAdmins,
            'total_courses' => $totalCourses,
            'total_results' => $totalResults,
            'avg_score' => $avgScore,
            'users_with_results' => $usersWithResults,
        ]);
    }

    // GET /api/admin/team-progress — all results for all users
    public function teamProgress(Request $request)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $results = DB::table('results')
            ->join('users', 'results.user_id', '=', 'users.id')
            ->join('courses', 'results.course_id', '=', 'courses.id')
            ->select(
                'results.id',
                'results.score',
                'results.total_questions',
                'results.completed_at',
                'results.quiz_id',
                'results.course_id',
                'results.user_id',
                'users.name as user_name',
                'users.email as user_email',
                'courses.title as course_title'
            )
            ->orderBy('results.completed_at', 'desc')
            ->get();

        $lessonProgress = DB::table('lesson_progress')
            ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
            ->select(
                'lesson_progress.user_id',
                'lessons.course_id',
                DB::raw('count(*) as completed_count')
            )
            ->groupBy('lesson_progress.user_id', 'lessons.course_id')
            ->get();

        return response()->json([
            'results' => $results,
            'lesson_progress' => $lessonProgress,
        ]);
    }
}
