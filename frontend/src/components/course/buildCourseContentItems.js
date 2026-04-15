export function buildCourseContentItems(lessons = [], quizzes = []) {
  return [
    ...lessons.map((lesson) => ({
      ...lesson,
      _type: "lesson",
      _dnd_id: `lesson-${lesson.id}`,
    })),
    ...quizzes.map((quiz) => ({
      ...quiz,
      _type: "quiz",
      _dnd_id: `quiz-${quiz.id}`,
    })),
  ].sort((a, b) => a.order_number - b.order_number);
}
