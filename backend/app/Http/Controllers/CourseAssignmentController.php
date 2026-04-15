<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class CourseAssignmentController extends Controller
{
    private const PASS_PERCENT = 80;

    public function index(Request $request)
    {
        $user = $request->user();

        $query = DB::table('course_assignments')
            ->join('users', 'course_assignments.user_id', '=', 'users.id')
            ->join('courses', 'course_assignments.course_id', '=', 'courses.id')
            ->join('users as assigner', 'course_assignments.assigned_by', '=', 'assigner.id')
            ->select(
                'course_assignments.id',
                'course_assignments.user_id',
                'course_assignments.course_id',
                'course_assignments.assigned_by',
                'course_assignments.due_at',
                'course_assignments.assigned_at',
                'course_assignments.notification_sent_at',
                'course_assignments.completed_at',
                'course_assignments.created_at',
                'course_assignments.updated_at',
                'users.name as user_name',
                'users.email as user_email',
                'users.role as user_role',
                'courses.title as course_title',
                'courses.status as course_status',
                'assigner.name as assigned_by_name'
            )
            ->orderByDesc('course_assignments.assigned_at');

        if ($user->role !== 'admin') {
            $query->where('course_assignments.user_id', $user->id);
        }

        if ($request->filled('user_id')) {
            $query->where('course_assignments.user_id', $request->input('user_id'));
        }

        if ($request->filled('course_id')) {
            $query->where('course_assignments.course_id', $request->input('course_id'));
        }

        $assignments = $query->get()->map(function ($assignment) {
            $assignment->deadline_status = $this->resolveAssignmentStatus(
                $assignment->user_id,
                $assignment->course_id,
                $assignment->due_at,
                $assignment->completed_at
            );

            return $assignment;
        });

        return response()->json($assignments);
    }

    public function store(Request $request)
    {
        $admin = $request->user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'course_id' => ['required', 'integer', 'exists:courses,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
            'user_ids' => ['nullable', 'array', 'min:1'],
            'user_ids.*' => ['integer', 'exists:users,id'],
            'due_at' => ['nullable', 'date'],
            'send_email' => ['nullable', 'boolean'],
        ]);

        $userIds = collect($validated['user_ids'] ?? [])
            ->when(
                isset($validated['user_id']),
                fn($collection) => $collection->push($validated['user_id'])
            )
            ->filter()
            ->unique()
            ->values()
            ->all();

        if (count($userIds) === 0) {
            return response()->json([
                'error' => 'Please select at least one employee.',
            ], 422);
        }

        $course = DB::table('courses')->where('id', $validated['course_id'])->first();

        if (!$course) {
            return response()->json(['error' => 'Course not found'], 404);
        }

        $users = DB::table('users')
            ->whereIn('id', $userIds)
            ->where('role', 'employee')
            ->get(['id', 'name', 'email', 'role']);

        if ($users->count() !== count($userIds)) {
            return response()->json([
                'error' => 'One or more selected users are invalid or not employees.',
            ], 422);
        }

        $sendEmail = $validated['send_email'] ?? true;
        $frontendUrl = rtrim(env('FRONTEND_URL', 'http://localhost:5173'), '/');
        $courseUrl = "{$frontendUrl}/courses/{$course->id}";
        $dueAt = $validated['due_at'] ?? null;

        $createdAssignments = [];
        $skippedUserIds = [];
        $emailResults = [];

        foreach ($users as $user) {
            $existing = DB::table('course_assignments')
                ->where('user_id', $user->id)
                ->where('course_id', $course->id)
                ->first();

            if ($existing) {
                $skippedUserIds[] = $user->id;
                continue;
            }

            $assignmentId = DB::table('course_assignments')->insertGetId([
                'user_id' => $user->id,
                'course_id' => $course->id,
                'assigned_by' => $admin->id,
                'due_at' => $dueAt,
                'assigned_at' => now(),
                'notification_sent_at' => null,
                'completed_at' => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $emailSent = false;

            if ($sendEmail) {
                try {
                    $dueLine = $dueAt
                        ? "Deadline: " . now()->parse($dueAt)->format('F j, Y H:i')
                        : "Deadline: none";

                    Mail::raw(
                        "You have been assigned a new course in SkillForge.\n\n" .
                        "Course: {$course->title}\n" .
                        "{$dueLine}\n" .
                        "Assigned by: {$admin->name}\n\n" .
                        "Open the course:\n{$courseUrl}",
                        function ($message) use ($user, $course) {
                            $message
                                ->to($user->email)
                                ->subject("New SkillForge course assigned: {$course->title}");
                        }
                    );

                    $emailSent = true;

                    DB::table('course_assignments')
                        ->where('id', $assignmentId)
                        ->update([
                            'notification_sent_at' => now(),
                            'updated_at' => now(),
                        ]);
                } catch (\Throwable $e) {
                    // Keep assignment even if email sending fails.
                }
            }

            $assignment = DB::table('course_assignments')
                ->join('users', 'course_assignments.user_id', '=', 'users.id')
                ->join('courses', 'course_assignments.course_id', '=', 'courses.id')
                ->join('users as assigner', 'course_assignments.assigned_by', '=', 'assigner.id')
                ->select(
                    'course_assignments.id',
                    'course_assignments.user_id',
                    'course_assignments.course_id',
                    'course_assignments.assigned_by',
                    'course_assignments.due_at',
                    'course_assignments.assigned_at',
                    'course_assignments.notification_sent_at',
                    'course_assignments.completed_at',
                    'course_assignments.created_at',
                    'course_assignments.updated_at',
                    'users.name as user_name',
                    'users.email as user_email',
                    'courses.title as course_title',
                    'assigner.name as assigned_by_name'
                )
                ->where('course_assignments.id', $assignmentId)
                ->first();

            if ($assignment) {
                $assignment->deadline_status = $this->resolveAssignmentStatus(
                    $assignment->user_id,
                    $assignment->course_id,
                    $assignment->due_at,
                    $assignment->completed_at
                );
                $createdAssignments[] = $assignment;
            }

            $emailResults[] = [
                'user_id' => $user->id,
                'email' => $user->email,
                'email_sent' => $emailSent,
            ];
        }

        return response()->json([
            'assignments' => $createdAssignments,
            'skipped_user_ids' => $skippedUserIds,
            'email_results' => $emailResults,
        ], 201);
    }

    public function update(Request $request, string $id)
    {
        $admin = $request->user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $validated = $request->validate([
            'due_at' => ['nullable', 'date'],
        ]);

        $assignment = DB::table('course_assignments')->where('id', $id)->first();

        if (!$assignment) {
            return response()->json(['error' => 'Assignment not found'], 404);
        }

        DB::table('course_assignments')
            ->where('id', $id)
            ->update([
                'due_at' => $validated['due_at'] ?? null,
                'updated_at' => now(),
            ]);

        $updated = DB::table('course_assignments')
            ->join('users', 'course_assignments.user_id', '=', 'users.id')
            ->join('courses', 'course_assignments.course_id', '=', 'courses.id')
            ->join('users as assigner', 'course_assignments.assigned_by', '=', 'assigner.id')
            ->select(
                'course_assignments.id',
                'course_assignments.user_id',
                'course_assignments.course_id',
                'course_assignments.assigned_by',
                'course_assignments.due_at',
                'course_assignments.assigned_at',
                'course_assignments.notification_sent_at',
                'course_assignments.completed_at',
                'course_assignments.created_at',
                'course_assignments.updated_at',
                'users.name as user_name',
                'users.email as user_email',
                'courses.title as course_title',
                'assigner.name as assigned_by_name'
            )
            ->where('course_assignments.id', $id)
            ->first();

        if ($updated) {
            $updated->deadline_status = $this->resolveAssignmentStatus(
                $updated->user_id,
                $updated->course_id,
                $updated->due_at,
                $updated->completed_at
            );
        }

        return response()->json($updated);
    }

    public function destroy(Request $request, string $id)
    {
        $admin = $request->user();

        if ($admin->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $deleted = DB::table('course_assignments')->where('id', $id)->delete();

        if (!$deleted) {
            return response()->json(['error' => 'Assignment not found'], 404);
        }

        return response()->json(['success' => true]);
    }

    public static function syncCompletionForUserCourse(int $userId, int $courseId): void
    {
        $lessonIds = DB::table('lessons')
            ->where('course_id', $courseId)
            ->where('status', 'published')
            ->pluck('id');

        $quizIds = DB::table('quizzes')
            ->where('course_id', $courseId)
            ->where('status', 'published')
            ->pluck('id');

        $completedLessonIds = collect();

        if ($lessonIds->isNotEmpty()) {
            $completedLessonIds = DB::table('lesson_progress')
                ->where('user_id', $userId)
                ->whereIn('lesson_id', $lessonIds)
                ->pluck('lesson_id')
                ->unique();
        }

        $passedQuizIds = collect();

        if ($quizIds->isNotEmpty()) {
            $results = DB::table('results')
                ->where('user_id', $userId)
                ->where('course_id', $courseId)
                ->whereIn('quiz_id', $quizIds)
                ->get(['quiz_id', 'score', 'total_questions']);

            $passedQuizIds = $results
                ->filter(function ($result) {
                    if (!$result->quiz_id || (int) $result->total_questions <= 0) {
                        return false;
                    }

                    $pct = round(((int) $result->score / (int) $result->total_questions) * 100);

                    return $pct >= self::PASS_PERCENT;
                })
                ->pluck('quiz_id')
                ->unique();
        }

        $allLessonsComplete = $lessonIds->count() === $completedLessonIds->count();
        $allQuizzesComplete = $quizIds->count() === $passedQuizIds->count();

        $isComplete = $allLessonsComplete && $allQuizzesComplete;

        if ($isComplete) {
            DB::table('course_assignments')
                ->where('user_id', $userId)
                ->where('course_id', $courseId)
                ->whereNull('completed_at')
                ->update([
                    'completed_at' => now(),
                    'updated_at' => now(),
                ]);
        } else {
            DB::table('course_assignments')
                ->where('user_id', $userId)
                ->where('course_id', $courseId)
                ->whereNotNull('completed_at')
                ->update([
                    'completed_at' => null,
                    'updated_at' => now(),
                ]);
        }
    }

    private function resolveAssignmentStatus(int $userId, int $courseId, $dueAt, $completedAt): string
    {
        if ($completedAt !== null) {
            if ($dueAt === null) {
                return 'completed';
            }

            return strtotime($completedAt) <= strtotime($dueAt)
                ? 'completed_on_time'
                : 'completed_late';
        }

        if ($dueAt !== null && now()->greaterThan($dueAt)) {
            return 'overdue';
        }

        if ($this->hasStartedCourse($userId, $courseId)) {
            return 'in_progress';
        }

        return 'assigned';
    }

    private function hasStartedCourse(int $userId, int $courseId): bool
    {
        $completedLessonExists = DB::table('lesson_progress')
            ->join('lessons', 'lesson_progress.lesson_id', '=', 'lessons.id')
            ->where('lesson_progress.user_id', $userId)
            ->where('lessons.course_id', $courseId)
            ->exists();

        if ($completedLessonExists) {
            return true;
        }

        return DB::table('results')
            ->where('user_id', $userId)
            ->where('course_id', $courseId)
            ->exists();
    }

}
