import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Pencil,
  FolderOpen,
  Eye,
  EyeOff,
  Trash2,
  BookOpen,
  FileText,
  HelpCircle,
  Lightbulb,
} from "lucide-react";
import LessonMarkdownEditor from "../components/markdown/LessonMarkdownEditor";
import Layout from "../components/Layout";
import api from "../api/auth";
import { ScoreText } from "../components/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function StatusPill({ status }) {
  if (status === "published") {
    return (
      <Badge className="bg-green-600/20 text-green-500 border-green-600/30 hover:bg-green-600/20 text-xs">
        Published
      </Badge>
    );
  }

  return (
    <Badge className="bg-yellow-600/20 text-yellow-500 border-yellow-600/30 hover:bg-yellow-600/20 text-xs">
      Draft
    </Badge>
  );
}

function IconActionButton({
  label,
  onClick,
  children,
  className = "",
  variant = "ghost",
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          size="icon"
          variant={variant}
          className={`h-8 w-8 ${className}`}
          onClick={onClick}
        >
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  );
}

function QuestionForm({
  quizId,
  qForm,
  setQForm,
  editingQId,
  setEditingQId,
  savingQ,
  setSavingQ,
  setQuizQuestionsList,
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {editingQId && editingQId !== "new"
            ? "Edit Question"
            : "New Question"}
        </p>

        <Input
          value={qForm.question_text}
          onChange={(e) =>
            setQForm({ ...qForm, question_text: e.target.value })
          }
          placeholder="Question text"
        />

        <div className="grid grid-cols-2 gap-2">
          {["a", "b", "c", "d"].map((opt) => (
            <div key={opt} className="space-y-1">
              <Label className="text-xs">Option {opt.toUpperCase()}</Label>
              <Input
                value={qForm[`option_${opt}`]}
                onChange={(e) =>
                  setQForm({ ...qForm, [`option_${opt}`]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Correct Answer</Label>
          <Select
            value={qForm.correct_answer}
            onValueChange={(v) => setQForm({ ...qForm, correct_answer: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["a", "b", "c", "d"].map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.toUpperCase()} —{" "}
                  {qForm[`option_${opt}`] || `Option ${opt.toUpperCase()}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={savingQ}
            onClick={async () => {
              setSavingQ(true);
              try {
                if (editingQId && editingQId !== "new") {
                  await api.put(`/questions/${editingQId}`, qForm);
                } else {
                  await api.post("/questions", { ...qForm, quiz_id: quizId });
                }

                const { data } = await api.get(`/quizzes/${quizId}/questions`);
                setQuizQuestionsList(data);
                setQForm({
                  question_text: "",
                  option_a: "",
                  option_b: "",
                  option_c: "",
                  option_d: "",
                  correct_answer: "a",
                });
                setEditingQId(null);
              } catch {
                alert("Failed to save question.");
              } finally {
                setSavingQ(false);
              }
            }}
          >
            {editingQId && editingQId !== "new" ? "Save" : "Add Question"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingQId(null);
              setQForm({
                question_text: "",
                option_a: "",
                option_b: "",
                option_c: "",
                option_d: "",
                correct_answer: "a",
              });
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function QuestionsList({
  quizId,
  quizQuestionsList,
  setQuizQuestionsList,
  qForm,
  setQForm,
  editingQId,
  setEditingQId,
  savingQ,
  setSavingQ,
}) {
  const qProps = {
    quizId,
    qForm,
    setQForm,
    editingQId,
    setEditingQId,
    savingQ,
    setSavingQ,
    setQuizQuestionsList,
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        Questions ({quizQuestionsList.length})
      </h3>

      {quizQuestionsList.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="pt-3 pb-3">
            {editingQId === q.id ? (
              <QuestionForm {...qProps} />
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  Q{i + 1}
                </span>

                <p className="text-sm flex-1">{q.question_text}</p>

                <div className="flex gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setQForm({
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer ?? "a",
                      });
                      setEditingQId(q.id);
                    }}
                  >
                    Edit
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={async () => {
                      if (!confirm("Delete this question?")) return;

                      try {
                        await api.delete(`/questions/${q.id}`);
                        const { data } = await api.get(
                          `/quizzes/${quizId}/questions`,
                        );
                        setQuizQuestionsList(data);
                      } catch {
                        alert("Failed to delete question.");
                      }
                    }}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {editingQId === "new" ? (
        <QuestionForm {...qProps} />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQForm({
              question_text: "",
              option_a: "",
              option_b: "",
              option_c: "",
              option_d: "",
              correct_answer: "a",
            });
            setEditingQId("new");
          }}
        >
          + Add Question
        </Button>
      )}

      {quizQuestionsList.length === 0 && editingQId !== "new" && (
        <p className="text-xs text-muted-foreground">No questions yet.</p>
      )}
    </div>
  );
}

const EMPTY_COURSE = { title: "", description: "", status: "draft" };
const EMPTY_LESSON = { title: "", content: "", course_id: "", status: "draft" };
const EMPTY_QUIZ = { title: "", course_id: "", status: "draft" };
const EMPTY_Q = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "a",
};

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

export default function AdminContent() {
  const navigate = useNavigate();

  const [view, setView] = useState("courses");
  const [panel, setPanel] = useState(null);
  const [editingItem, setEditingItem] = useState(null);

  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [quizQuestionCounts, setQuizQuestionCounts] = useState({});
  const [allResults, setAllResults] = useState([]);
  const [lessonMap, setLessonMap] = useState({});
  const [quizMap, setQuizMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [filterCourse, setFilterCourse] = useState("all");
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [courseForm, setCourseForm] = useState(EMPTY_COURSE);
  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [quizForm, setQuizForm] = useState(EMPTY_QUIZ);

  const [quizQuestionsList, setQuizQuestionsList] = useState([]);
  const [qForm, setQForm] = useState(EMPTY_Q);
  const [editingQId, setEditingQId] = useState(null);
  const [savingQ, setSavingQ] = useState(false);

  const load = async () => {
    setLoading(true);

    try {
      const [c, r] = await Promise.all([
        api.get("/courses"),
        api.get("/admin/team-progress"),
      ]);

      const courseList = c.data;
      setCourses(courseList);
      setAllResults(r.data.results ?? []);

      const lMap = {};
      const qMap = {};
      const allLessons = [];
      const allQuizzes = [];
      const qCounts = {};

      await Promise.all(
        courseList.map(async (course) => {
          const [ls, qs] = await Promise.all([
            api.get(`/courses/${course.id}/lessons`),
            api.get(`/courses/${course.id}/quizzes`),
          ]);

          lMap[course.id] = ls.data;
          qMap[course.id] = qs.data;

          allLessons.push(
            ...ls.data.map((l) => ({ ...l, courseTitle: course.title })),
          );

          allQuizzes.push(
            ...qs.data.map((q) => ({ ...q, courseTitle: course.title })),
          );

          await Promise.all(
            qs.data.map(async (quiz) => {
              const { data } = await api.get(`/quizzes/${quiz.id}/questions`);
              qCounts[quiz.id] = data.length;
            }),
          );
        }),
      );

      setLessonMap(lMap);
      setQuizMap(qMap);
      setLessons(allLessons);
      setQuizzes(allQuizzes);
      setQuizQuestionCounts(qCounts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const closePanel = () => {
    setPanel(null);
    setEditingItem(null);
    setQuizQuestionsList([]);
    setQForm(EMPTY_Q);
    setEditingQId(null);
  };

  const openCourseEditor = (course) => {
    navigate(`/admin/courses/${course.id}`);
  };

  const toggleCourseStatus = async (course) => {
    await api.put(`/courses/${course.id}`, {
      title: course.title,
      description: course.description,
      status: course.status === "published" ? "draft" : "published",
    });
    await load();
  };

  const toggleLessonStatus = async (lesson) => {
    await api.put(`/lessons/${lesson.id}`, {
      title: lesson.title,
      content: lesson.content,
      status: lesson.status === "published" ? "draft" : "published",
    });
    await load();
  };

  const toggleQuizStatus = async (quiz) => {
    await api.put(`/quizzes/${quiz.id}`, {
      title: quiz.title,
      status: quiz.status === "published" ? "draft" : "published",
    });
    await load();
  };

  const deleteCourse = async (id) => {
    if (!confirm("Delete this course and all its content?")) return;
    await api.delete(`/courses/${id}`);
    await load();
  };

  const deleteLesson = async (id) => {
    if (!confirm("Delete this lesson?")) return;
    await api.delete(`/lessons/${id}`);
    await load();
  };

  const deleteQuiz = async (id) => {
    if (!confirm("Delete this quiz and all its questions?")) return;
    await api.delete(`/quizzes/${id}`);
    await load();
  };

  const saveCourse = async (status) => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/courses/${editingItem.id}`, { ...courseForm, status });
      } else {
        await api.post("/courses", { ...courseForm, status });
      }

      await load();
      closePanel();
    } catch {
      alert("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async (status) => {
    setSaving(true);
    try {
      const payload = {
        ...lessonForm,
        status,
        course_id: Number(lessonForm.course_id),
      };

      if (editingItem && panel === "editLesson") {
        await api.put(`/lessons/${editingItem.id}`, payload);
      } else {
        await api.post("/lessons", payload);
      }

      await load();
      closePanel();
    } catch {
      alert("Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const saveQuiz = async (status) => {
    setSaving(true);
    try {
      const payload = {
        ...quizForm,
        status,
        course_id: Number(quizForm.course_id),
      };

      if (editingItem && panel === "editQuiz") {
        await api.put(`/quizzes/${editingItem.id}`, payload);
        await load();
        return;
      }

      const { data } = await api.post("/quizzes", payload);
      await load();
      await openEditQuiz({ id: data.id, ...payload });
    } catch {
      alert("Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const openEditLesson = (lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      course_id: String(lesson.course_id),
      status: lesson.status,
    });
    setEditingItem(lesson);
    setPanel("editLesson");
  };

  const openEditQuiz = async (quiz) => {
    setQuizForm({
      title: quiz.title,
      course_id: String(quiz.course_id),
      status: quiz.status,
    });
    setEditingItem(quiz);
    setPanel("editQuiz");

    const { data } = await api.get(`/quizzes/${quiz.id}/questions`);
    setQuizQuestionsList(data);
    setQForm(EMPTY_Q);
    setEditingQId(null);
  };

  const quizAvgScore = (quizId) => {
    const results = allResults.filter((r) => r.quiz_id === quizId);
    if (!results.length) return null;

    return Math.round(
      results.reduce((a, r) => a + (r.score / r.total_questions) * 100, 0) /
        results.length,
    );
  };

  const filteredLessons =
    filterCourse === "all"
      ? lessons
      : lessons.filter((l) => String(l.course_id) === filterCourse);

  const filteredQuizzes =
    filterCourse === "all"
      ? quizzes
      : quizzes.filter((q) => String(q.course_id) === filterCourse);

  const filteredCourses = courses.filter((course) =>
    [course.title, course.description, course.status].some((field) =>
      normalize(field).includes(normalize(searchTerm)),
    ),
  );

  const searchedLessons = filteredLessons.filter((lesson) =>
    [lesson.title, lesson.courseTitle, lesson.status].some((field) =>
      normalize(field).includes(normalize(searchTerm)),
    ),
  );

  const searchedQuizzes = filteredQuizzes.filter((quiz) =>
    [quiz.title, quiz.courseTitle, quiz.status].some((field) =>
      normalize(field).includes(normalize(searchTerm)),
    ),
  );

  const qProps = {
    qForm,
    setQForm,
    editingQId,
    setEditingQId,
    savingQ,
    setSavingQ,
    setQuizQuestionsList,
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  return (
    <TooltipProvider>
      <Layout>
        <div className="flex h-[calc(100vh-57px)]">
          <aside className="w-52 border-r flex flex-col shrink-0">
            <div className="p-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Content
              </p>

              <div className="space-y-1">
                {[
                  { key: "courses", icon: BookOpen, label: "Courses" },
                  { key: "lessons", icon: FileText, label: "Lessons" },
                  { key: "quizzes", icon: HelpCircle, label: "Quizzes" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      setView(item.key);
                      setPanel(null);
                      setSearchTerm("");
                    }}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors text-left
                    ${
                      view === item.key && !panel
                        ? "bg-muted font-medium"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              <Separator className="my-3" />

              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Create
              </p>

              <div className="space-y-1">
                <button
                  onClick={() => {
                    setCourseForm(EMPTY_COURSE);
                    setEditingItem(null);
                    setPanel("newCourse");
                    setView("courses");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                >
                  <span>+</span> New Course
                </button>

                <button
                  onClick={() => {
                    setLessonForm(EMPTY_LESSON);
                    setEditingItem(null);
                    setPanel("newLesson");
                    setView("lessons");
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                >
                  <span>+</span> New Lesson
                </button>

                <button
                  onClick={() => {
                    setQuizForm(EMPTY_QUIZ);
                    setEditingItem(null);
                    setPanel("newQuiz");
                    setView("quizzes");
                    setQuizQuestionsList([]);
                    setQForm(EMPTY_Q);
                    setEditingQId(null);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-left"
                >
                  <span>+</span> New Quiz
                </button>
              </div>
            </div>
          </aside>

          <div className="flex-1 overflow-y-auto">
            <div className="px-8 py-8 space-y-6">
              {panel === "newCourse" && (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <button
                      onClick={closePanel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Courses
                    </button>
                    <h1 className="text-2xl font-semibold mt-1">
                      Create New Course
                    </h1>
                  </div>

                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <Label>Course Title</Label>
                        <Input
                          value={courseForm.title}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Advanced CI/CD Pipeline"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Description</Label>
                        <Input
                          value={courseForm.description}
                          onChange={(e) =>
                            setCourseForm({
                              ...courseForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="What will employees learn?"
                        />
                      </div>

                      <Separator />

                      <p className="text-xs text-muted-foreground">
                        Draft courses are only visible to admins.
                      </p>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveCourse("published")}
                          disabled={saving}
                        >
                          Save & Publish
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveCourse("draft")}
                          disabled={saving}
                        >
                          Save as Draft
                        </Button>
                        <Button variant="ghost" onClick={closePanel}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {panel === "newLesson" && (
                <div className="max-w-4xl space-y-4">
                  <div>
                    <button
                      onClick={closePanel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Lessons
                    </button>
                    <h1 className="text-2xl font-semibold mt-1">
                      Create New Lesson
                    </h1>
                  </div>

                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <Label>Lesson Title</Label>
                        <Input
                          value={lessonForm.title}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g. Commit Best Practices"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Course</Label>
                        <Select
                          value={lessonForm.course_id}
                          onValueChange={(v) =>
                            setLessonForm({ ...lessonForm, course_id: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Content</Label>
                        <LessonMarkdownEditor
                          value={lessonForm.content}
                          onChange={(value) =>
                            setLessonForm({
                              ...lessonForm,
                              content: value,
                            })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveLesson("published")}
                          disabled={saving}
                        >
                          Save & Publish
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveLesson("draft")}
                          disabled={saving}
                        >
                          Save as Draft
                        </Button>
                        <Button variant="ghost" onClick={closePanel}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {panel === "editLesson" && (
                <div className="max-w-4xl space-y-4">
                  <div>
                    <button
                      onClick={closePanel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Lessons
                    </button>
                    <h1 className="text-2xl font-semibold mt-1">
                      Edit: {editingItem?.title}
                    </h1>
                  </div>

                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <Label>Lesson Title</Label>
                        <Input
                          value={lessonForm.title}
                          onChange={(e) =>
                            setLessonForm({
                              ...lessonForm,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Course</Label>
                        <Select
                          value={lessonForm.course_id}
                          onValueChange={(v) =>
                            setLessonForm({ ...lessonForm, course_id: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label>Content</Label>
                        <LessonMarkdownEditor
                          value={lessonForm.content}
                          onChange={(value) =>
                            setLessonForm({
                              ...lessonForm,
                              content: value,
                            })
                          }
                        />
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveLesson("published")}
                          disabled={saving}
                        >
                          Save & Publish
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveLesson("draft")}
                          disabled={saving}
                        >
                          Save as Draft
                        </Button>
                        {editingItem?.status === "published" && (
                          <Button
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => saveLesson("draft")}
                            disabled={saving}
                          >
                            Unpublish → Draft
                          </Button>
                        )}
                        <Button variant="ghost" onClick={closePanel}>
                          Cancel
                        </Button>
                      </div>

                      <Separator />

                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteLesson(editingItem.id);
                          closePanel();
                        }}
                      >
                        Delete Lesson
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}

              {panel === "newQuiz" && (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <button
                      onClick={closePanel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Quizzes
                    </button>
                    <h1 className="text-2xl font-semibold mt-1">
                      Create New Quiz
                    </h1>
                  </div>

                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <Label>Quiz Title</Label>
                        <Input
                          value={quizForm.title}
                          onChange={(e) =>
                            setQuizForm({ ...quizForm, title: e.target.value })
                          }
                          placeholder="e.g. Security Awareness Check"
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Attach to Course</Label>
                        <Select
                          value={quizForm.course_id}
                          onValueChange={(v) =>
                            setQuizForm({ ...quizForm, course_id: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a course" />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveQuiz("published")}
                          disabled={saving}
                        >
                          Save & Publish
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveQuiz("draft")}
                          disabled={saving}
                        >
                          Save as Draft
                        </Button>
                        <Button variant="ghost" onClick={closePanel}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>
                      Save the quiz first, then you can add questions to it.
                    </span>
                  </p>
                </div>
              )}

              {panel === "editQuiz" && editingItem && (
                <div className="max-w-2xl space-y-4">
                  <div>
                    <button
                      onClick={closePanel}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      ← Quizzes
                    </button>
                    <h1 className="text-2xl font-semibold mt-1">
                      Edit: {editingItem?.title}
                    </h1>
                  </div>

                  <Card>
                    <CardContent className="pt-4 space-y-4">
                      <div className="space-y-1">
                        <Label>Quiz Title</Label>
                        <Input
                          value={quizForm.title}
                          onChange={(e) =>
                            setQuizForm({ ...quizForm, title: e.target.value })
                          }
                        />
                      </div>

                      <div className="space-y-1">
                        <Label>Attach to Course</Label>
                        <Select
                          value={quizForm.course_id}
                          onValueChange={(v) =>
                            setQuizForm({ ...quizForm, course_id: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {courses.map((c) => (
                              <SelectItem key={c.id} value={String(c.id)}>
                                {c.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Separator />

                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveQuiz("published")}
                          disabled={saving}
                        >
                          Save & Publish
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => saveQuiz("draft")}
                          disabled={saving}
                        >
                          Save as Draft
                        </Button>
                        {editingItem?.status === "published" && (
                          <Button
                            variant="ghost"
                            className="text-muted-foreground"
                            onClick={() => saveQuiz("draft")}
                            disabled={saving}
                          >
                            Unpublish → Draft
                          </Button>
                        )}
                        <Button variant="ghost" onClick={closePanel}>
                          Cancel
                        </Button>
                      </div>

                      <Separator />

                      <Button
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteQuiz(editingItem.id);
                          closePanel();
                        }}
                      >
                        Delete Quiz
                      </Button>
                    </CardContent>
                  </Card>

                  <QuestionsList
                    quizId={editingItem.id}
                    quizQuestionsList={quizQuestionsList}
                    {...qProps}
                  />
                </div>
              )}

              {!panel && view === "courses" && (
                <>
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <h1 className="text-2xl font-semibold">Manage Courses</h1>
                    <div className="flex gap-2">
                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search courses..."
                        className="w-64 h-8 text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          setCourseForm(EMPTY_COURSE);
                          setEditingItem(null);
                          setPanel("newCourse");
                        }}
                      >
                        + New Course
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <span className="col-span-4">Course</span>
                        <span className="col-span-1">Lessons</span>
                        <span className="col-span-1">Quizzes</span>
                        <span className="col-span-2">Status</span>
                        <span className="col-span-4 text-right">Actions</span>
                      </div>

                      {filteredCourses.length === 0 && (
                        <p className="text-sm text-muted-foreground px-4 py-6">
                          No courses found.
                        </p>
                      )}

                      {filteredCourses.map((course, i) => (
                        <div
                          key={course.id}
                          className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${
                            i !== 0 ? "border-t" : ""
                          }`}
                          onClick={() => openCourseEditor(course)}
                        >
                          <div className="col-span-4">
                            <p className="text-sm font-medium">
                              {course.title}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {course.status === "draft"
                                ? "Draft — not visible to employees"
                                : `Updated ${new Date(
                                    course.updated_at,
                                  ).toLocaleDateString()}`}
                            </p>
                          </div>

                          <span className="col-span-1 text-sm text-muted-foreground">
                            {lessonMap[course.id]?.length ?? 0}
                          </span>

                          <span className="col-span-1 text-sm text-muted-foreground">
                            {quizMap[course.id]?.length ?? 0}
                          </span>

                          <div className="col-span-2">
                            <StatusPill status={course.status} />
                          </div>

                          <div
                            className="col-span-4 flex justify-end gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IconActionButton
                              label="Open course editor"
                              onClick={() => openCourseEditor(course)}
                            >
                              <FolderOpen className="h-4 w-4" />
                            </IconActionButton>

                            {course.status === "draft" ? (
                              <IconActionButton
                                label="Publish course"
                                onClick={() => toggleCourseStatus(course)}
                                className="text-green-500 hover:text-green-500"
                              >
                                <Eye className="h-4 w-4" />
                              </IconActionButton>
                            ) : (
                              <IconActionButton
                                label="Unpublish course"
                                onClick={() => toggleCourseStatus(course)}
                                className="text-muted-foreground"
                              >
                                <EyeOff className="h-4 w-4" />
                              </IconActionButton>
                            )}

                            <IconActionButton
                              label="Delete course"
                              onClick={() => deleteCourse(course.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconActionButton>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {!panel && view === "lessons" && (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Manage Lessons</h1>

                    <div className="flex gap-2">
                      <Select
                        value={filterCourse}
                        onValueChange={setFilterCourse}
                      >
                        <SelectTrigger className="w-48 h-8 text-xs">
                          <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search lessons..."
                        className="w-64 h-8 text-sm"
                      />

                      <Button
                        size="sm"
                        onClick={() => {
                          setLessonForm(EMPTY_LESSON);
                          setEditingItem(null);
                          setPanel("newLesson");
                        }}
                      >
                        + New Lesson
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <span className="col-span-4">Lesson</span>
                        <span className="col-span-3">Course</span>
                        <span className="col-span-2">Status</span>
                        <span className="col-span-3 text-right">Actions</span>
                      </div>

                      {searchedLessons.length === 0 && (
                        <p className="text-sm text-muted-foreground px-4 py-6">
                          No lessons found.
                        </p>
                      )}

                      {searchedLessons.map((lesson, i) => (
                        <div
                          key={lesson.id}
                          className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${
                            i !== 0 ? "border-t" : ""
                          }`}
                        >
                          <span className="col-span-4 text-sm font-medium">
                            {lesson.title}
                          </span>

                          <span className="col-span-3 text-sm text-muted-foreground">
                            {lesson.courseTitle}
                          </span>

                          <div className="col-span-2">
                            <StatusPill status={lesson.status} />
                          </div>

                          <div className="col-span-3 flex justify-end gap-1">
                            <IconActionButton
                              label="Edit lesson"
                              onClick={() => openEditLesson(lesson)}
                            >
                              <Pencil className="h-4 w-4" />
                            </IconActionButton>

                            <IconActionButton
                              label="Open course"
                              onClick={() =>
                                navigate(`/admin/courses/${lesson.course_id}`)
                              }
                            >
                              <FolderOpen className="h-4 w-4" />
                            </IconActionButton>

                            {lesson.status === "draft" ? (
                              <IconActionButton
                                label="Publish lesson"
                                onClick={() => toggleLessonStatus(lesson)}
                                className="text-green-500 hover:text-green-500"
                              >
                                <Eye className="h-4 w-4" />
                              </IconActionButton>
                            ) : (
                              <IconActionButton
                                label="Unpublish lesson"
                                onClick={() => toggleLessonStatus(lesson)}
                                className="text-muted-foreground"
                              >
                                <EyeOff className="h-4 w-4" />
                              </IconActionButton>
                            )}

                            <IconActionButton
                              label="Delete lesson"
                              onClick={() => deleteLesson(lesson.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </IconActionButton>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}

              {!panel && view === "quizzes" && (
                <>
                  <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Manage Quizzes</h1>

                    <div className="flex gap-2">
                      <Select
                        value={filterCourse}
                        onValueChange={setFilterCourse}
                      >
                        <SelectTrigger className="w-48 h-8 text-xs">
                          <SelectValue placeholder="All Courses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Courses</SelectItem>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Input
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search quizzes..."
                        className="w-64 h-8 text-sm"
                      />

                      <Button
                        size="sm"
                        onClick={() => {
                          setQuizForm(EMPTY_QUIZ);
                          setEditingItem(null);
                          setPanel("newQuiz");
                          setQuizQuestionsList([]);
                          setQForm(EMPTY_Q);
                          setEditingQId(null);
                        }}
                      >
                        + New Quiz
                      </Button>
                    </div>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        <span className="col-span-3">Quiz</span>
                        <span className="col-span-3">Course</span>
                        <span className="col-span-1">Questions</span>
                        <span className="col-span-1">Avg Score</span>
                        <span className="col-span-1">Status</span>
                        <span className="col-span-3 text-right">Actions</span>
                      </div>

                      {searchedQuizzes.length === 0 && (
                        <p className="text-sm text-muted-foreground px-4 py-6">
                          No quizzes found.
                        </p>
                      )}

                      {searchedQuizzes.map((quiz, i) => {
                        const avg = quizAvgScore(quiz.id);

                        return (
                          <div
                            key={quiz.id}
                            className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${
                              i !== 0 ? "border-t" : ""
                            }`}
                          >
                            <span className="col-span-3 text-sm font-medium">
                              {quiz.title}
                            </span>

                            <span className="col-span-3 text-sm text-muted-foreground">
                              {quiz.courseTitle}
                            </span>

                            <span className="col-span-1 text-sm text-muted-foreground">
                              {quizQuestionCounts[quiz.id] ?? 0}Q
                            </span>

                            <div className="col-span-1">
                              {avg !== null ? (
                                <ScoreText pct={avg} className="text-sm" />
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  —
                                </span>
                              )}
                            </div>

                            <div className="col-span-1">
                              <StatusPill status={quiz.status} />
                            </div>

                            <div className="col-span-3 flex justify-end gap-1">
                              <IconActionButton
                                label="Edit quiz"
                                onClick={() => openEditQuiz(quiz)}
                              >
                                <Pencil className="h-4 w-4" />
                              </IconActionButton>

                              <IconActionButton
                                label="Open course"
                                onClick={() =>
                                  navigate(`/admin/courses/${quiz.course_id}`)
                                }
                              >
                                <FolderOpen className="h-4 w-4" />
                              </IconActionButton>

                              {quiz.status === "draft" ? (
                                <IconActionButton
                                  label="Publish quiz"
                                  onClick={() => toggleQuizStatus(quiz)}
                                  className="text-green-500 hover:text-green-500"
                                >
                                  <Eye className="h-4 w-4" />
                                </IconActionButton>
                              ) : (
                                <IconActionButton
                                  label="Unpublish quiz"
                                  onClick={() => toggleQuizStatus(quiz)}
                                  className="text-muted-foreground"
                                >
                                  <EyeOff className="h-4 w-4" />
                                </IconActionButton>
                              )}

                              <IconActionButton
                                label="Delete quiz"
                                onClick={() => deleteQuiz(quiz.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </IconActionButton>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </Layout>
    </TooltipProvider>
  );
}
