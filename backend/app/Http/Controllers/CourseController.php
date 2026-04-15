<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = $this->table('courses')->orderBy('created_at', 'desc');

        if ($request->user()->role !== 'admin') {
            $query->where('status', 'published');
        }

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $course = $this->findById('courses', $id, function ($query) use ($request) {
            if ($request->user()->role !== 'admin') {
                $query->where('status', 'published');
            }
        });

        if (!$course) {
            return $this->notFoundResponse();
        }

        return response()->json($course);
    }

    public function store(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'status' => 'in:published,draft',
        ]);

        $id = $this->table('courses')->insertGetId([
            'title' => $request->title,
            'description' => $request->description,
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

        $course = $this->findById('courses', $id);

        if (!$course) {
            return $this->notFoundResponse();
        }

        $this->table('courses')->where('id', $id)->update([
            'title' => $request->title ?? $course->title,
            'description' => $request->description ?? $course->description,
            'status' => $request->input('status', $course->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $course = $this->findById('courses', $id);

        if (!$course) {
            return $this->notFoundResponse();
        }

        $this->table('courses')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }
}