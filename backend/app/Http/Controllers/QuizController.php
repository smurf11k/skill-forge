<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class QuizController extends Controller
{
    public function byCourse(Request $request, string $courseId)
    {
        $courseQuery = $this->table('courses')->where('id', $courseId);
        $this->publishedOnlyForNonAdmin($request, $courseQuery, 'status');

        $course = $courseQuery->first();

        if (!$course) {
            return $this->notFoundResponse();
        }

        $query = $this->table('quizzes')
            ->where('course_id', $courseId)
            ->orderBy('order_number');

        $this->publishedOnlyForNonAdmin($request, $query, 'status');

        return response()->json($query->get());
    }

    public function show(Request $request, string $id)
    {
        $query = $this->table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*');

        $this->publishedOnlyForNonAdmin($request, $query, 'courses.status', 'quizzes.status');

        $quiz = $query->first();

        if (!$quiz) {
            return $this->notFoundResponse();
        }

        return response()->json($quiz);
    }

    public function questions(Request $request, string $id)
    {
        $quizQuery = $this->table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*');

        $this->publishedOnlyForNonAdmin($request, $quizQuery, 'courses.status', 'quizzes.status');

        $quiz = $quizQuery->first();

        if (!$quiz) {
            return $this->notFoundResponse();
        }

        $questions = $this->table('questions')
            ->where('quiz_id', $id)
            ->orderBy('order_number')
            ->get([
                'id',
                'quiz_id',
                'question_text',
                'option_a',
                'option_b',
                'option_c',
                'option_d',
                'order_number',
            ]);

        return response()->json($questions);
    }

    public function store(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'course_id' => 'required|integer|exists:courses,id',
            'title' => 'required|string|max:200',
            'status' => 'in:published,draft',
        ]);

        $maxOrder = $this->table('quizzes')
            ->where('course_id', $request->course_id)
            ->max('order_number');

        $id = $this->table('quizzes')->insertGetId([
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
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $quiz = $this->findById('quizzes', $id);

        if (!$quiz) {
            return $this->notFoundResponse();
        }

        $request->validate([
            'title' => 'nullable|string|max:200',
            'status' => 'nullable|in:published,draft',
        ]);

        $this->table('quizzes')->where('id', $id)->update([
            'title' => $request->title ?? $quiz->title,
            'status' => $request->input('status', $quiz->status),
            'updated_at' => now(),
        ]);

        return response()->json(['updated' => true]);
    }

    public function destroy(Request $request, string $id)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $quiz = $this->findById('quizzes', $id);

        if (!$quiz) {
            return $this->notFoundResponse();
        }

        $this->table('quizzes')->where('id', $id)->delete();

        return response()->json(['deleted' => true]);
    }

    public function reorder(Request $request)
    {
        if ($response = $this->requireAdmin($request)) {
            return $response;
        }

        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|integer|exists:quizzes,id',
            'items.*.order_number' => 'required|integer|min:0',
        ]);

        foreach ($request->items as $item) {
            $this->table('quizzes')
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

        $quizQuery = $this->table('quizzes')
            ->join('courses', 'quizzes.course_id', '=', 'courses.id')
            ->where('quizzes.id', $id)
            ->select('quizzes.*', 'courses.status as course_status');

        $this->publishedOnlyForNonAdmin($request, $quizQuery, 'quizzes.status', 'courses.status');

        $quiz = $quizQuery->first();

        if (!$quiz) {
            return $this->notFoundResponse();
        }

        $quizQuestions = $this->table('questions')
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

        $this->table('results')->insert([
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
