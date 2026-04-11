<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuestionController extends Controller
{
    // POST /api/questions  (admin)
    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $request->validate([
            'quiz_id'        => 'required|integer',
            'question_text'  => 'required|string',
            'option_a'       => 'required|string',
            'option_b'       => 'required|string',
            'option_c'       => 'required|string',
            'option_d'       => 'required|string',
            'correct_answer' => 'required|in:a,b,c,d',
        ]);

        $maxOrder = DB::table('questions')
            ->where('quiz_id', $request->quiz_id)
            ->max('order_number') ?? -1;

        $id = DB::table('questions')->insertGetId([
            'quiz_id'        => $request->quiz_id,
            'question_text'  => $request->question_text,
            'option_a'       => $request->option_a,
            'option_b'       => $request->option_b,
            'option_c'       => $request->option_c,
            'option_d'       => $request->option_d,
            'correct_answer' => $request->correct_answer,
            'order_number'   => $maxOrder + 1,
            'created_at'     => now(),
            'updated_at'     => now(),
        ]);

        return response()->json(['id' => $id], 201);
    }

    // PUT /api/questions/{id}  (admin)
    public function update(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        $q = DB::table('questions')->where('id', $id)->first();
        if (!$q) return response()->json(['error' => 'Not found'], 404);

        DB::table('questions')->where('id', $id)->update([
            'question_text'  => $request->question_text  ?? $q->question_text,
            'option_a'       => $request->option_a       ?? $q->option_a,
            'option_b'       => $request->option_b       ?? $q->option_b,
            'option_c'       => $request->option_c       ?? $q->option_c,
            'option_d'       => $request->option_d       ?? $q->option_d,
            'correct_answer' => $request->correct_answer ?? $q->correct_answer,
            'updated_at'     => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    // DELETE /api/questions/{id}  (admin)
    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        DB::table('questions')->where('id', $id)->delete();
        return response()->json(['deleted' => true]);
    }

    // PUT /api/questions/reorder  (admin)
    public function reorder(Request $request)
    {
        if ($request->user()->role !== 'admin')
            return response()->json(['error' => 'Forbidden'], 403);

        foreach ($request->items as $item) {
            DB::table('questions')
                ->where('id', $item['id'])
                ->update(['order_number' => $item['order_number']]);
        }

        return response()->json(['reordered' => true]);
    }
}