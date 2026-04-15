<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LessonController extends Controller
{
    public function byCourse(Request $request, string $courseId)
    {
        $courseQuery = $this->table('courses')->where('id', $courseId);
        $this->publishedOnlyForNonAdmin($request, $courseQuery, 'status');

        $course = $courseQuery->first();

        if (!$course) {
            return $this->notFoundResponse();
        }

        $query = $this->table('lessons')
            ->where('course_id', $courseId)
            ->orderBy('order_number');

        $this->publishedOnlyForNonAdmin($request, $query, 'status');

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $query = $this->table('lessons')
            ->join('courses', 'lessons.course_id', '=', 'courses.id')
            ->where('lessons.id', $id)
            ->select('lessons.*');

        $this->publishedOnlyForNonAdmin($request, $query, 'courses.status', 'lessons.status');

        $lesson = $query->first();

        if (!$lesson) {
            return $this->notFoundResponse();
        }

        return response()->json($lesson);
    }

    public function store(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'title' => 'required|string|max:200',
            'content' => 'nullable|string',
            'status' => 'in:published,draft',
        ]);

        $maxOrder = $this->table('lessons')
            ->where('course_id', $request->course_id)
            ->max('order_number');

        $id = $this->table('lessons')->insertGetId([
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
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $lesson = $this->findById('lessons', $id);

        if (!$lesson) {
            return $this->notFoundResponse();
        }

        $request->validate([
            'title' => 'nullable|string|max:200',
            'content' => 'nullable|string',
            'status' => 'nullable|in:published,draft',
        ]);

        $this->table('lessons')->where('id', $id)->update([
            'title' => $request->title ?? $lesson->title,
            'content' => $request->has('content') ? $request->input('content') : $lesson->content,
            'status' => $request->input('status', $lesson->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $lesson = $this->findById('lessons', $id);

        if (!$lesson) {
            return $this->notFoundResponse();
        }

        $this->table('lessons')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:lessons,id',
            'items.*.order_number' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            $this->table('lessons')
                ->where('id', $item['id'])
                ->update([
                    'order_number' => $item['order_number'],
                    'updated_at' => now(),
                ]);
        }

        return response()->json(['reordered' => true]);
    }
}