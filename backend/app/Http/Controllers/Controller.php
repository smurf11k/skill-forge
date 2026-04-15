<?php

namespace App\Http\Controllers;

use Closure;
use Illuminate\Database\Query\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

abstract class Controller
{
    protected function table(string $table): Builder
    {
        return DB::table($table);
    }

    protected function forbiddenResponse(string $message = 'Forbidden'): JsonResponse
    {
        return response()->json(['error' => $message], 403);
    }

    protected function notFoundResponse(string $message = 'Not found'): JsonResponse
    {
        return response()->json(['error' => $message], 404);
    }

    protected function requireAdmin(Request $request, string $message = 'Forbidden'): ?JsonResponse
    {
        if ($request->user()->role !== 'admin') {
            return $this->forbiddenResponse($message);
        }

        return null;
    }

    protected function publishedOnlyForNonAdmin(Request $request, Builder $query, string ...$columns): Builder
    {
        if ($request->user()->role === 'admin') {
            return $query;
        }

        foreach ($columns as $column) {
            $query->where($column, 'published');
        }

        return $query;
    }

    protected function findById(string $table, string|int $id, ?Closure $scope = null): mixed
    {
        $query = $this->table($table)->where('id', $id);

        if ($scope) {
            $scope($query);
        }

        return $query->first();
    }
}