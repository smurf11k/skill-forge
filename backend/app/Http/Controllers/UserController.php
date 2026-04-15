<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $users = $this->table('users')
            ->select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($users);
    }

    public function updateRole(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate(['role' => 'required|in:employee,admin']);

        if ($request->user()->id == $id && $request->role !== 'admin') {
            return response()->json(['error' => 'Cannot change your own role'], 422);
        }

        $this->table('users')->where('id', $id)->update(['role' => $request->role]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        if ($request->user()->id == $id) {
            return response()->json(['error' => 'Cannot delete your own account'], 422);
        }

        $this->table('users')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    public function stats(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $totalUsers = $this->table('users')->count();
        $totalEmployees = $this->table('users')->where('role', 'employee')->count();
        $totalAdmins = $this->table('users')->where('role', 'admin')->count();
        $totalCourses = $this->table('courses')->count();
        $totalResults = $this->table('results')->count();

        $results = $this->table('results')->get();
        $avgScore = $results->count() > 0
            ? round($results->avg(fn($r) => ($r->score / $r->total_questions) * 100))
            : null;

        $usersWithResults = $this->table('results')->distinct('user_id')->count('user_id');

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

    public function teamProgress(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $results = $this->table('results')
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

        $lessonProgress = $this->table('lesson_progress')
            ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
            ->select(
                'lesson_progress.user_id',
                'lessons.course_id',
                \DB::raw('count(*) as completed_count')
            )
            ->groupBy('lesson_progress.user_id', 'lessons.course_id')
            ->get();

        return response()->json([
            'results' => $results,
            'lesson_progress' => $lessonProgress,
        ]);
    }
}
