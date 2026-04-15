import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { ScoreText } from "../components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import MarkdownContent from "../components/markdown/MarkdownContent";

const PASS = 80;

const TYPE_META = {
  lesson: { icon: "📖", label: "Lesson" },
  quiz: { icon: "📝", label: "Quiz" },
};

function LessonContent({ content }) {
  return <MarkdownContent content={content} />;
}

function SidebarRow({ item, index, isActive, isDone, onClick }) {
  const meta = TYPE_META[item._type];

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors text-left
        ${
          isActive
            ? "bg-muted font-medium"
            : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
        }`}
    >
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono shrink-0
          ${
            isDone
              ? "bg-green-500 text-white"
              : isActive
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
          }`}
      >
        {isDone ? "✓" : index + 1}
      </div>

      <span className="flex-1 truncate">{item.title}</span>
      <span className="text-xs opacity-50">{meta.icon}</span>
    </button>
  );
}

function InlineQuiz({ quiz, questions, onFinish, onCancel }) {
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (questions.length === 0) return;

    if (Object.keys(answers).length < questions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setSubmitting(true);

    try {
      const { data } = await api.post(`/quizzes/${quiz.id}/submit`, {
        answers: Object.entries(answers).map(([question_id, answer]) => ({
          question_id: Number(question_id),
          answer,
        })),
      });

      setResult(data);
    } catch {
      alert("Failed to submit quiz.");
    } finally {
      setSubmitting(false);
    }
  };

  if (result) {
    const pct = Math.round((result.score / result.total_questions) * 100);
    const passed = pct >= PASS;

    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <p className="text-5xl">{passed ? "🎉" : "📚"}</p>

        <ScoreText pct={pct} className="text-5xl" />

        <p className="text-muted-foreground">
          {result.score} out of {result.total_questions} correct
        </p>

        {passed ? (
          <p className="text-xs text-green-500 font-medium">
            Quiz passed — counts toward your progress.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Score below 80% — attempt noted but won&apos;t count toward
            completion.
          </p>
        )}

        <div className="flex gap-2 mt-2">
          {!passed && (
            <Button
              variant="outline"
              onClick={() => {
                setResult(null);
                setAnswers({});
              }}
            >
              Retry
            </Button>
          )}
          <Button onClick={onFinish}>Continue →</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <Card key={q.id}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex gap-3 text-left">
              <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                Q{i + 1}
              </span>
              <span>{q.question_text}</span>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {["a", "b", "c", "d"].map((opt) => (
              <label
                key={opt}
                className={`flex items-center gap-3 p-2.5 rounded-md border cursor-pointer transition-colors
                  ${
                    answers[q.id] === opt
                      ? "border-foreground bg-muted"
                      : "hover:bg-muted/50"
                  }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  className="hidden"
                  checked={answers[q.id] === opt}
                  onChange={() =>
                    setAnswers((prev) => ({ ...prev, [q.id]: opt }))
                  }
                />
                <span className="text-xs font-mono w-5 h-5 rounded-full border flex items-center justify-center shrink-0">
                  {opt.toUpperCase()}
                </span>
                <span className="text-sm">{q[`option_${opt}`]}</span>
              </label>
            ))}
          </CardContent>
        </Card>
      ))}

      <div className="flex items-center justify-between pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
          onClick={onCancel}
        >
          ← Exit Quiz
        </Button>

        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {Object.keys(answers).length}/{questions.length} answered
          </span>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit Quiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function CourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const user = getUser();

  const [course, setCourse] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [items, setItems] = useState([]);
  const [questions, setQuestions] = useState({});
  const [activeId, setActiveId] = useState(null);

  const [completedLessonIds, setCompletedLessonIds] = useState(new Set());
  const [userResults, setUserResults] = useState([]);

  const [quizActive, setQuizActive] = useState(false);
  const [lockWarning, setLockWarning] = useState(false);

  const [loading, setLoading] = useState(true);

  const buildItems = (lessons, quizzes) =>
    [
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

  const loadQuestions = async (quizId) => {
    if (questions[quizId]) return questions[quizId];

    const { data } = await api.get(`/quizzes/${quizId}/questions`);
    setQuestions((prev) => ({ ...prev, [quizId]: data }));
    return data;
  };

  const loadProgress = async () => {
    const { data } = await api.get(`/courses/${id}/progress`);
    setCompletedLessonIds(new Set(data.completed_lesson_ids));
  };

  const loadResults = async () => {
    const { data } = await api.get(`/results/${user.id}`);
    setUserResults(data);
  };

  const loadAssignment = async () => {
    const { data } = await api.get(`/assignments?course_id=${id}`);
    setAssignment(data?.[0] ?? null);
  };

  const loadPage = async () => {
    setLoading(true);

    try {
      const [courseRes, lessonsRes, quizzesRes, assignmentsRes] =
        await Promise.all([
          api.get(`/courses/${id}`),
          api.get(`/courses/${id}/lessons`),
          api.get(`/courses/${id}/quizzes`),
          api.get(`/assignments?course_id=${id}`),
        ]);

      const merged = buildItems(lessonsRes.data, quizzesRes.data);

      setCourse(courseRes.data);
      setItems(merged);
      setAssignment(assignmentsRes.data?.[0] ?? null);

      await Promise.all([loadProgress(), loadResults()]);

      const startQuizId = location.state?.startQuiz;

      if (startQuizId) {
        const targetQuiz = merged.find(
          (item) => item._type === "quiz" && item.id === startQuizId,
        );

        if (targetQuiz) {
          await loadQuestions(targetQuiz.id);
          setActiveId(targetQuiz._dnd_id);
          setQuizActive(true);
          return;
        }
      }

      if (merged.length > 0) {
        setActiveId(merged[0]._dnd_id);

        if (merged[0]._type === "quiz") {
          await loadQuestions(merged[0].id);
        }
      } else {
        setActiveId(null);
      }
    } catch {
      navigate("/courses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role === "admin") {
      navigate(`/admin/courses/${id}`);
      return;
    }

    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const activeItem = useMemo(
    () => items.find((item) => item._dnd_id === activeId) ?? null,
    [items, activeId],
  );

  const currentIndex = items.findIndex((item) => item._dnd_id === activeId);
  const prevItem = currentIndex > 0 ? items[currentIndex - 1] : null;
  const nextItem = currentIndex >= 0 ? (items[currentIndex + 1] ?? null) : null;

  const currentQuestions =
    activeItem?._type === "quiz" ? (questions[activeItem.id] ?? []) : [];

  const allLessons = items.filter((item) => item._type === "lesson");
  const allQuizzes = items.filter((item) => item._type === "quiz");
  const totalItems = items.length;

  const completedQuizIds = new Set(
    allQuizzes
      .filter((quiz) =>
        userResults.some(
          (r) =>
            r.quiz_id === quiz.id &&
            r.total_questions > 0 &&
            Math.round((r.score / r.total_questions) * 100) >= PASS,
        ),
      )
      .map((quiz) => quiz.id),
  );

  const doneItems = completedLessonIds.size + completedQuizIds.size;
  const progressPct =
    totalItems === 0 ? 0 : Math.round((doneItems / totalItems) * 100);

  const allLessonsComplete = allLessons.every((lesson) =>
    completedLessonIds.has(lesson.id),
  );
  const allQuizzesComplete = allQuizzes.every((quiz) =>
    completedQuizIds.has(quiz.id),
  );
  const courseComplete =
    totalItems > 0 && allLessonsComplete && allQuizzesComplete;

  const dueDateLabel = assignment?.due_at
    ? new Date(assignment.due_at).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : null;

  const deadlineTone =
    assignment?.deadline_status === "overdue"
      ? "destructive"
      : assignment?.deadline_status === "completed_late"
        ? "secondary"
        : "outline";

  const deadlineText =
    assignment?.deadline_status === "completed_on_time"
      ? "Completed on time"
      : assignment?.deadline_status === "completed_late"
        ? "Completed late"
        : assignment?.deadline_status === "overdue"
          ? "Overdue"
          : assignment?.deadline_status === "assigned"
            ? "Assigned"
            : assignment?.deadline_status === "completed"
              ? "Completed"
              : null;

  const isItemDone = (item) => {
    if (item._type === "lesson") return completedLessonIds.has(item.id);
    return completedQuizIds.has(item.id);
  };

  const trySelectItem = async (item) => {
    if (quizActive) {
      setLockWarning(true);
      setTimeout(() => setLockWarning(false), 2500);
      return;
    }

    setActiveId(item._dnd_id);

    if (item._type === "quiz") {
      await loadQuestions(item.id);
    }
  };

  const completeLesson = async () => {
    if (!activeItem || activeItem._type !== "lesson") return;

    if (!completedLessonIds.has(activeItem.id)) {
      await api.post(`/lessons/${activeItem.id}/complete`);
      setCompletedLessonIds((prev) => new Set([...prev, activeItem.id]));
      await loadAssignment();
    }

    if (nextItem) {
      setActiveId(nextItem._dnd_id);

      if (nextItem._type === "quiz") {
        await loadQuestions(nextItem.id);
      }
    }
  };

  const startQuiz = async () => {
    if (!activeItem || activeItem._type !== "quiz") return;
    await loadQuestions(activeItem.id);
    setQuizActive(true);
  };

  const finishQuiz = async () => {
    setQuizActive(false);
    await loadResults();
    await loadAssignment();

    if (nextItem) {
      setActiveId(nextItem._dnd_id);

      if (nextItem._type === "quiz") {
        await loadQuestions(nextItem.id);
      }
    }
  };

  const resetProgress = async () => {
    if (!confirm("Reset your progress?")) return;

    try {
      await api.delete(`/results/${user.id}/reset`);
      setCompletedLessonIds(new Set());
      setUserResults([]);
      setQuizActive(false);

      if (items.length > 0) {
        setActiveId(items[0]._dnd_id);
      }
    } catch {
      alert("Failed to reset progress.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  if (!course) return null;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-57px)]">
        <aside className="w-64 border-r flex flex-col shrink-0 overflow-y-auto">
          <div className="p-4 space-y-3">
            <Button
              variant="ghost"
              size="sm"
              className="px-0 text-muted-foreground h-auto"
              onClick={() => navigate("/courses")}
            >
              ← Courses
            </Button>

            <div className="space-y-2">
              <div>
                <p className="font-semibold text-sm leading-snug">
                  {course.title}
                </p>
                {course.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {course.description}
                  </p>
                )}
              </div>

              {dueDateLabel && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Deadline: {dueDateLabel}
                  </p>
                  {deadlineText && (
                    <Badge
                      variant={deadlineTone}
                      className="text-[10px] uppercase tracking-wide"
                    >
                      {deadlineText}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {allLessons.length} lesson{allLessons.length !== 1 ? "s" : ""} ·{" "}
                {allQuizzes.length} quiz{allQuizzes.length !== 1 ? "zes" : ""}
              </p>

              <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all bg-primary"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                {doneItems} of {totalItems} completed
              </p>
            </div>
          </div>

          <Separator />

          {lockWarning && (
            <div className="px-3 pt-3">
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-xs">
                  Finish the quiz before navigating.
                </AlertDescription>
              </Alert>
            </div>
          )}

          <div className="flex-1 p-2">
            {items.length === 0 ? (
              <p className="text-xs text-muted-foreground px-2 py-4">
                No content available yet.
              </p>
            ) : (
              items.map((item, index) => (
                <SidebarRow
                  key={item._dnd_id}
                  item={item}
                  index={index}
                  isActive={item._dnd_id === activeId}
                  isDone={isItemDone(item)}
                  onClick={() => trySelectItem(item)}
                />
              ))
            )}
          </div>

          {courseComplete && (
            <>
              <Separator />
              <div className="p-4 space-y-3 text-center">
                <p className="text-2xl">🏆</p>
                <p className="text-xs font-semibold text-green-500">
                  Course Completed!
                </p>

                <Button
                  size="sm"
                  className="w-full"
                  onClick={() => navigate("/results")}
                >
                  View Results
                </Button>

                <Button
                  size="sm"
                  variant="ghost"
                  className="w-full text-xs text-muted-foreground"
                  onClick={resetProgress}
                >
                  Reset Progress
                </Button>
              </div>
            </>
          )}
        </aside>

        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-8 py-8 space-y-6">
            {!activeItem && (
              <p className="text-sm text-muted-foreground">
                No content available yet.
              </p>
            )}

            {activeItem?._type === "lesson" && (
              <div className="w-full text-left">
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs mb-2">
                    📖 Lesson
                  </Badge>
                  <h1 className="text-2xl font-semibold">{activeItem.title}</h1>
                </div>

                <Separator className="mb-6" />

                <LessonContent content={activeItem.content} />

                <div className="flex gap-2 pt-8">
                  {prevItem && (
                    <Button
                      variant="outline"
                      onClick={() => trySelectItem(prevItem)}
                    >
                      ← Previous
                    </Button>
                  )}

                  {nextItem ? (
                    <Button onClick={completeLesson}>
                      {nextItem._type === "quiz"
                        ? "Continue to Quiz →"
                        : "Next →"}
                    </Button>
                  ) : (
                    <Button onClick={completeLesson}>Complete Lesson ✓</Button>
                  )}
                </div>
              </div>
            )}

            {activeItem?._type === "quiz" && (
              <div className="w-full text-left">
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs mb-2">
                    📝 Quiz
                  </Badge>
                  <h1 className="text-2xl font-semibold">{activeItem.title}</h1>
                </div>

                <Separator className="mb-6" />

                {quizActive ? (
                  <InlineQuiz
                    quiz={activeItem}
                    questions={currentQuestions}
                    onFinish={finishQuiz}
                    onCancel={() => setQuizActive(false)}
                  />
                ) : (
                  (() => {
                    const alreadyPassed = completedQuizIds.has(activeItem.id);
                    const attempts = userResults.filter(
                      (r) => r.quiz_id === activeItem.id,
                    );

                    const bestPct = attempts.length
                      ? Math.max(
                          ...attempts.map((r) =>
                            Math.round((r.score / r.total_questions) * 100),
                          ),
                        )
                      : null;

                    return (
                      <div className="space-y-4">
                        {alreadyPassed ? (
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <span className="text-green-500 text-lg">✓</span>
                              <p className="text-sm font-medium text-green-500">
                                Quiz passed!
                              </p>
                            </div>

                            {bestPct !== null && (
                              <p className="text-sm text-muted-foreground">
                                Your best score:{" "}
                                <ScoreText pct={bestPct} className="text-sm" />
                              </p>
                            )}

                            <p className="text-xs text-muted-foreground">
                              You can retake it anytime, but it already counts
                              toward your progress.
                            </p>

                            <div className="flex gap-2">
                              {prevItem && (
                                <Button
                                  variant="outline"
                                  onClick={() => trySelectItem(prevItem)}
                                >
                                  ← Previous
                                </Button>
                              )}

                              <Button variant="outline" onClick={startQuiz}>
                                Retake Quiz
                              </Button>

                              {nextItem && (
                                <Button onClick={() => trySelectItem(nextItem)}>
                                  Next →
                                </Button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {attempts.length > 0 && bestPct !== null && (
                              <p className="text-sm text-muted-foreground">
                                Best attempt:{" "}
                                <ScoreText pct={bestPct} className="text-sm" />{" "}
                                — below 80%, try again to pass.
                              </p>
                            )}

                            <p className="text-sm text-muted-foreground">
                              {currentQuestions.length} question
                              {currentQuestions.length !== 1 ? "s" : ""}. Once
                              started you can exit and come back.
                            </p>

                            <div className="flex gap-2">
                              {prevItem && (
                                <Button
                                  variant="outline"
                                  onClick={() => trySelectItem(prevItem)}
                                >
                                  ← Previous
                                </Button>
                              )}

                              {currentQuestions.length > 0 ? (
                                <Button onClick={startQuiz}>
                                  Start Quiz →
                                </Button>
                              ) : (
                                <Button disabled>No Questions Yet</Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
