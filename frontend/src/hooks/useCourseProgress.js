import { useEffect, useState } from "react";
import api, { getUser } from "../api/auth";

export function useCourseProgress() {
  const user = getUser();
  const [courses, setCourses] = useState([]);
  const [results, setResults] = useState([]);
  const [quizMap, setQuizMap] = useState({});
  const [lessonMap, setLessonMap] = useState({});
  const [completedLessonMap, setCompletedLessonMap] = useState({}); // courseId -> Set of completed lessonIds
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get("/courses"), api.get(`/results/${user.id}`)])
      .then(async ([c, r]) => {
        const courseList = c.data;
        const resultList = r.data;
        setCourses(courseList);
        setResults(resultList);

        const qMap = {};
        const lMap = {};
        const clMap = {};

        await Promise.all(
          courseList.map(async (course) => {
            const [quizzes, lessons, progress] = await Promise.all([
              api.get(`/courses/${course.id}/quizzes`),
              api.get(`/courses/${course.id}/lessons`),
              api.get(`/courses/${course.id}/progress`),
            ]);
            qMap[course.id] = quizzes.data;
            lMap[course.id] = lessons.data;
            clMap[course.id] = new Set(progress.data.completed_lesson_ids);
          }),
        );

        setQuizMap(qMap);
        setLessonMap(lMap);
        setCompletedLessonMap(clMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const PASS = 80;

  const isQuizPassed = (quizId) =>
    results.some(
      (r) =>
        r.quiz_id === quizId &&
        Math.round((r.score / r.total_questions) * 100) >= PASS,
    );

  const enriched = courses.map((course) => {
    const quizzes = quizMap[course.id] ?? [];
    const lessons = lessonMap[course.id] ?? [];
    const completedLessons = completedLessonMap[course.id] ?? new Set();

    const totalItems = lessons.length + quizzes.length;
    const passedQuizzes = quizzes.filter((q) => isQuizPassed(q.id)).length;
    const doneItems = completedLessons.size + passedQuizzes;
    const progressPct =
      totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);
    const isCompleted =
      lessons.length + quizzes.length > 0 &&
      passedQuizzes === quizzes.length &&
      completedLessons.size === lessons.length;
    const courseResults = results.filter((r) => r.course_id === course.id);
    const isStarted = courseResults.length > 0 || completedLessons.size > 0;
    const avgScore = courseResults.length
      ? Math.round(
          courseResults.reduce(
            (a, r) => a + (r.score / r.total_questions) * 100,
            0,
          ) / courseResults.length,
        )
      : null;

    return {
      ...course,
      quizzes,
      lessons,
      completedLessons,
      totalQuizzes: quizzes.length,
      totalLessons: lessons.length,
      passedQuizzes,
      completedLessonCount: completedLessons.size,
      progressPct,
      isCompleted,
      isStarted,
      avgScore,
      status: isCompleted
        ? "completed"
        : isStarted
          ? "in_progress"
          : "not_started",
    };
  });

  return {
    courses: enriched,
    results,
    loading,
    isQuizPassed,
    stats: {
      coursesDone: enriched.filter((c) => c.isCompleted).length,
      quizzesTaken: results.filter(
        (r) =>
          r.quiz_id && Math.round((r.score / r.total_questions) * 100) >= 80,
      ).length,
      avgScore: results.length
        ? Math.round(
            results.reduce(
              (a, r) => a + (r.score / r.total_questions) * 100,
              0,
            ) / results.length,
          )
        : null,
    },
  };
}
