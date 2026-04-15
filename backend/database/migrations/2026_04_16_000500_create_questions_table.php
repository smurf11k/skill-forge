<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('quiz_id')->constrained('quizzes')->cascadeOnDelete();
            $table->text('question_text');
            $table->string('option_a', 255)->nullable();
            $table->string('option_b', 255)->nullable();
            $table->string('option_c', 255)->nullable();
            $table->string('option_d', 255)->nullable();
            $table->string('correct_answer', 1);
            $table->integer('order_number')->default(0);
            $table->timestamps();
            $table->index('quiz_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};