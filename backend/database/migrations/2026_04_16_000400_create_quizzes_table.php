<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('course_id')->constrained('courses')->cascadeOnDelete();
            $table->string('title', 200);
            $table->integer('order_number')->default(0);
            $table->string('status', 20)->default('published');
            $table->timestamps();
            $table->index('course_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('quizzes');
    }
};