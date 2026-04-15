<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QuestionController extends Controller
{
    public function store(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'quiz_id' => 'required|integer',
            'question_text' => 'required|string',
            'option_a' => 'required|string',
            'option_b' => 'required|string',
            'option_c' => 'required|string',
            'option_d' => 'required|string',
            'correct_answer' => 'required|in:a,b,c,d',
        ]);

        $maxOrder = $this->table('questions')
            ->where('quiz_id', $request->quiz_id)
            ->max('order_number') ?? -1;

        $id = $this->table('questions')->insertGetId([
            'quiz_id' => $request->quiz_id,
            'question_text' => $request->question_text,
            'option_a' => $request->option_a,
            'option_b' => $request->option_b,
            'option_c' => $request->option_c,
            'option_d' => $request->option_d,
            'correct_answer' => $request->correct_answer,
            'order_number' => $maxOrder + 1,
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

        $q = $this->findById('questions', $id);
        if (!$q) {
            return $this->notFoundResponse();
        }

        $this->table('questions')->where('id', $id)->update([
            'question_text' => $request->question_text ?? $q->question_text,
            'option_a' => $request->option_a ?? $q->option_a,
            'option_b' => $request->option_b ?? $q->option_b,
            'option_c' => $request->option_c ?? $q->option_c,
            'option_d' => $request->option_d ?? $q->option_d,
            'correct_answer' => $request->correct_answer ?? $q->correct_answer,
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $this->table('questions')->where('id', $id)->delete();
        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        foreach ($request->items as $item) {
            $this->table('questions')
                ->where('id', $item['id'])
                ->update(['order_number' => $item['order_number']]);
        }

        return response()->json(['reordered' => true]);
    }
}