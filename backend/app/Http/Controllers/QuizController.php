<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
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

        $query = DB::table('quizzes')
            ->where('course_id', $courseId)
            ->orderBy('order_number');

        if ($request->user()->role !== 'admin') {
            $query->where('status', 'published');
        }

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $query = DB::table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*');

        if ($request->user()->role !== 'admin') {
            $query->where('courses.status', 'published')
                ->where('quizzes.status', 'published');
        }

        $quiz = $query->first();

        if (!$quiz) {
            return response()->json(['error' => 'Not found'], 404);
        }

        return response()->json($quiz);
    }

    public function questions(Request $request, string $id)
    {
        $quizQuery = DB::table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*');

        if ($request->user()->role !== 'admin') {
            $quizQuery->where('courses.status', 'published')
                ->where('quizzes.status', 'published');
        }

        $quiz = $quizQuery->first();

        if (!$quiz) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $questions = DB::table('questions')
            ->where('quiz_id', $id)
            ->orderBy('order_number')
            ->get()
            ->map(fn($q) => [
                'id' => $q->id,
                'quiz_id' => $q->quiz_id,
                'question_text' => $q->question_text,
                'option_a' => $q->option_a,
                'option_b' => $q->option_b,
                'option_c' => $q->option_c,
                'option_d' => $q->option_d,
                'order_number' => $q->order_number,
            ]);

        return response()->json($questions);
    }

    public function store(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'title' => 'required|string|max:200',
            'status' => 'in:published,draft',
        ]);

        $maxOrder = DB::table('quizzes')
            ->where('course_id', $request->course_id)
            ->max('order_number');

        $id = DB::table('quizzes')->insertGetId([
            'course_id' => $request->course_id,
            'title' => $request->title,
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

        $quiz = DB::table('quizzes')->where('id', $id)->first();

        if (!$quiz) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $request->validate([
            'title' => 'nullable|string|max:200',
            'status' => 'nullable|in:published,draft',
        ]);

        DB::table('quizzes')->where('id', $id)->update([
            'title' => $request->title ?? $quiz->title,
            'status' => $request->input('status', $quiz->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $quiz = DB::table('quizzes')->where('id', $id)->first();

        if (!$quiz) {
            return response()->json(['error' => 'Not found'], 404);
        }

        DB::table('quizzes')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request)
    {
        if ($request->user()->role !== 'admin') {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:quizzes,id',
            'items.*.order_number' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            DB::table('quizzes')
                ->where('id', $item['id'])
                ->update([
                    'order_number' => $item['order_number'],
                    'updated_at' => now(),
                ]);
        }

        return response()->json(['reordered' => true]);
    }

    public function submit(Request $request, string $id)
    {
        $request->validate([
            'answers' => 'required|array|min:1',
            'answers.*.question_id' => 'required|integer',
            'answers.*.answer' => 'required|string|in:a,b,c,d',
        ]);

        $quizQuery = DB::table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*', 'courses.status as course_status');

        if ($request->user()->role !== 'admin') {
            $quizQuery->where('quizzes.status', 'published')
                ->where('courses.status', 'published');
        }

        $quiz = $quizQuery->first();

        if (!$quiz) {
            return response()->json(['error' => 'Not found'], 404);
        }

        $quizQuestions = DB::table('questions')
            ->where('quiz_id', $id)
            ->orderBy('order_number')
            ->get();

        if ($quizQuestions->isEmpty()) {
            return response()->json(['error' => 'Quiz has no questions'], 422);
        }

        $quizQuestionIds = $quizQuestions->pluck('id')->sort()->values();
        $submittedQuestionIds = collect($request->answers)
            ->pluck('question_id')
            ->unique()
            ->sort()
            ->values();

        if ($submittedQuestionIds->toArray() !== $quizQuestionIds->toArray()) {
            return response()->json([
                'error' => 'Answers must include every question in this quiz exactly once',
            ], 422);
        }

        $questionsById = $quizQuestions->keyBy('id');

        $score = 0;

        foreach ($request->answers as $answer) {
            $question = $questionsById->get($answer['question_id']);

            if ($question && $question->correct_answer === $answer['answer']) {
                $score++;
            }
        }

        $total = $quizQuestions->count();

        DB::table('results')->insert([
            'user_id' => $request->user()->id,
            'course_id' => $quiz->course_id,
            'quiz_id' => $quiz->id,
            'score' => $score,
            'total_questions' => $total,
            'completed_at' => now(),
        ]);

        CourseAssignmentController::syncCompletionForUserCourse(
            (int) $request->user()->id,
            (int) $quiz->course_id
        );

        return response()->json([
            'score' => $score,
            'total_questions' => $total,
        ]);
    }
}
