<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $query = DB::table('courses')->orderBy('created_at', 'desc');

        if ($request->user()->role !== 'admin') {
            $query->where('status', 'published');
        }

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $query = DB::table('courses')->where('id', $id);

        if ($request->user()->role !== 'admin') {
            $query->where('status', 'published');
        }

        $course = $query->first();

        if (!$course) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($course);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:200',
            'description' => 'nullable|string',
            'status' => 'in:published,draft',
        ]);

        $id = DB::table('courses')->insertGetId([
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
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $course = DB::table('courses')->where('id', $id)->first();

        if (!$course) {
            return response()->json(['error' => 'Not found'], 404);
        }

        DB::table('courses')->where('id', $id)->update([
            'title' => $request->title ?? $course->title,
            'description' => $request->description ?? $course->description,
            'status' => $request->input('status', $course->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $course = DB::table('courses')->where('id', $id)->first();

        if (!$course) {
            return response()->json(['error' => 'Not found'], 404);
        }

        DB::table('courses')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }
}