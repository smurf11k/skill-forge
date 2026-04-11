<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ResultController extends Controller
{
    public function byUser(Request $request, string $userId)
    {
        // Employees can only see their own results
        if ($request->user()->role !== 'admin' && $request->user()->id != $userId) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        $results = DB::table('results')
            ->where('user_id', $userId)
            ->orderBy('completed_at', 'desc')
            ->get();

        return response()->json($results);
    }

    public function reset(Request $request, string $userId)
    {
        if ($request->user()->role !== 'admin' && $request->user()->id != $userId)
            return response()->json(['error' => 'Forbidden'], 403);

        DB::table('results')->where('user_id', $userId)->delete();
        DB::table('lesson_progress')->where('user_id', $userId)->delete();

        return response()->json(['reset' => true]);
    }
}