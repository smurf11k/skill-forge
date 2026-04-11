<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonProgressController extends Controller
{
    public function complete(Request $request, string $lessonId)
    {
        $userId = $request->user()->id;

        $lessonQuery = DB::table('lessons')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->where('lessons.id', $lessonId)
            ->select('lessons.*');

        if ($request->user()->role !== 'admin') {
            $lessonQuery->where('lessons.status', 'published')
                ->where('courses.status', 'published');
        }

        $lesson = $lessonQuery->first();

        if (!$lesson) {
            return response()->json(['error' => 'Not found'], 404);
        }

        DB::table('lesson_progress')->upsert(
            [
                'user_id' => $userId,
                'lesson_id' => $lessonId,
                'completed_at' => now(),
            ],
            ['user_id', 'lesson_id'],
            ['completed_at']
        );

        return response()->json(['completed' => true]);
    }

    public function byCourse(Request $request, string $courseId)
    {
        $courseQuery = DB::table('courses')->where('id', $courseId);

        if ($request->user()->role !== 'admin') {
            $courseQuery->where('status', 'published');
        }

        $course = $courseQuery->first();

        if (!$course) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $lessonIdsQuery = DB::table('lessons')->where('course_id', $courseId);

        if ($request->user()->role !== 'admin') {
            $lessonIdsQuery->where('status', 'published');
        }

        $lessonIds = $lessonIdsQuery->pluck('id');

        $completedIds = DB::table('lesson_progress')
            ->where('user_id', $request->user()->id)
            ->whereIn('lesson_id', $lessonIds)
            ->pluck('lesson_id');

        return response()->json([
            'completed_lesson_ids' => $completedIds,
        ]);
    }
}