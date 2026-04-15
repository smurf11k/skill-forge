<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('results', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->foreignId('quiz_id')->nullable()->constrained('quizzes')->nullOnDelete();
            $table->integer('score');
            $table->integer('total_questions');
            $table->timestamp('completed_at')->useCurrent();
            $table->index('user_id');
            $table->index('course_id');
            $table->index('quiz_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('results');
    }
};