<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class LessonController extends Controller
{
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

        $query = DB::table('lessons')
            ->where('course_id', $courseId)
            ->orderBy('order_number');

        if ($request->user()->role !== 'admin') {
            $query->where('status', 'published');
        }

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $query = DB::table('lessons')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->where('lessons.id', $id)
            ->select('lessons.*');

        if ($request->user()->role !== 'admin') {
            $query->where('courses.status', 'published')
                ->where('lessons.status', 'published');
        }

        $lesson = $query->first();

        if (!$lesson) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($lesson);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'title' => 'required|string|max:200',
            'content' => 'nullable|string',
            'status' => 'in:published,draft',
        ]);

        $maxOrder = DB::table('lessons')
            ->where('course_id', $request->course_id)
            ->max('order_number');

        $id = DB::table('lessons')->insertGetId([
            'course_id' => $request->course_id,
            'title' => $request->title,
            'content' => $request->input('content'),
            'order_number' => ($maxOrder ?? -1) + 1,
            'status' => $request->input('status', 'draft'),
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json(['id' => $id], 201);
    }

    public function update(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $lesson = DB::table('lessons')->where('id', $id)->first();

        if (!$lesson) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $request->validate([
            'title' => 'nullable|string|max:200',
            'content' => 'nullable|string',
            'status' => 'nullable|in:published,draft',
        ]);

        DB::table('lessons')->where('id', $id)->update([
            'title' => $request->title ?? $lesson->title,
            'content' => $request->has('content') ? $request->input('content') : $lesson->content,
            'status' => $request->input('status', $lesson->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $lesson = DB::table('lessons')->where('id', $id)->first();

        if (!$lesson) {
            return response()->json(['error' => 'Not found'], 404);
        }

        DB::table('lessons')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:lessons,id',
            'items.*.order_number' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            DB::table('lessons')
                ->where('id', $item['id'])
                ->update([
                    'order_number' => $item['order_number'],
                    'updated_at' => now(),
                ]);
        }

        return response()->json(['reordered' => true]);
    }
}