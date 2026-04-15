import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  BookOpen,
  FileQuestion,
  Lightbulb,
  Pencil,
  Trash2,
} from "lucide-react";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import LessonMarkdownEditor from "../components/markdown/LessonMarkdownEditor";

const EMPTY_LESSON = { title: "", content: "", status: "draft" };
const EMPTY_QUIZ = { title: "", status: "draft" };
const EMPTY_QUESTION = {
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "a",
};

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

const TYPE_META = {
  lesson: { icon: BookOpen },
  quiz: { icon: FileQuestion },
};

function SortableContentItem({ item, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item._dnd_id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const meta = TYPE_META[item._type];
  const ItemIcon = meta.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 px-3 py-2 rounded-md border bg-card text-sm"
    >
      <span
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground/40 hover:text-muted-foreground select-none shrink-0"
      >
        ⠿
      </span>
      <ItemIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
      <span className="flex-1 truncate">{item.title}</span>
      <StatusPill status={item.status} />
      <div className="hidden group-hover:flex gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function QuestionForm({
  quizId,
  form,
  setForm,
  editingQuestionId,
  setEditingQuestionId,
  saving,
  setSaving,
  setQuizQuestions,
}) {
  return (
    <Card>
      <CardContent className="pt-3 pb-3 space-y-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {editingQuestionId && editingQuestionId !== "new"
            ? "Edit Question"
            : "New Question"}
        </p>

        <Textarea
          value={form.question_text}
          onChange={(e) => setForm({ ...form, question_text: e.target.value })}
          rows={2}
          placeholder="Question text"
        />

        <div className="grid grid-cols-2 gap-2">
          {["a", "b", "c", "d"].map((opt) => (
            <div key={opt} className="space-y-1">
              <Label className="text-xs">Option {opt.toUpperCase()}</Label>
              <Input
                value={form[`option_${opt}`]}
                onChange={(e) =>
                  setForm({ ...form, [`option_${opt}`]: e.target.value })
                }
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Correct Answer</Label>
          <Select
            value={form.correct_answer}
            onValueChange={(v) => setForm({ ...form, correct_answer: v })}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["a", "b", "c", "d"].map((opt) => (
                <SelectItem key={opt} value={opt}>
                  {opt.toUpperCase()} —{" "}
                  {form[`option_${opt}`] || `Option ${opt.toUpperCase()}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          <Button
            size="sm"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                if (editingQuestionId && editingQuestionId !== "new") {
                  await api.put(`/questions/${editingQuestionId}`, form);
                } else {
                  await api.post("/questions", { ...form, quiz_id: quizId });
                }

                const { data } = await api.get(`/quizzes/${quizId}/questions`);
                setQuizQuestions(data);
                setForm(EMPTY_QUESTION);
                setEditingQuestionId(null);
              } catch {
                alert("Failed to save question.");
              } finally {
                setSaving(false);
              }
            }}
          >
            {editingQuestionId && editingQuestionId !== "new"
              ? "Save"
              : "Add Question"}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              setEditingQuestionId(null);
              setForm(EMPTY_QUESTION);
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
  quizQuestions,
  setQuizQuestions,
  questionForm,
  setQuestionForm,
  editingQuestionId,
  setEditingQuestionId,
  savingQuestion,
  setSavingQuestion,
}) {
  const qProps = {
    quizId,
    form: questionForm,
    setForm: setQuestionForm,
    editingQuestionId,
    setEditingQuestionId,
    saving: savingQuestion,
    setSaving: setSavingQuestion,
    setQuizQuestions,
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold">
        Questions ({quizQuestions.length})
      </h3>

      {quizQuestions.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="pt-3 pb-3">
            {editingQuestionId === q.id ? (
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
                      setQuestionForm({
                        question_text: q.question_text,
                        option_a: q.option_a,
                        option_b: q.option_b,
                        option_c: q.option_c,
                        option_d: q.option_d,
                        correct_answer: q.correct_answer ?? "a",
                      });
                      setEditingQuestionId(q.id);
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
                        setQuizQuestions(data);
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

      {editingQuestionId === "new" ? (
        <QuestionForm {...qProps} />
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setQuestionForm(EMPTY_QUESTION);
            setEditingQuestionId("new");
          }}
        >
          + Add Question
        </Button>
      )}

      {quizQuestions.length === 0 && editingQuestionId !== "new" && (
        <p className="text-xs text-muted-foreground">No questions yet.</p>
      )}
    </div>
  );
}

export default function AdminCourseView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = getUser();

  const [course, setCourse] = useState(null);
  const [items, setItems] = useState([]);
  const [panel, setPanel] = useState("course");
  const [editingItem, setEditingItem] = useState(null);

  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    status: "draft",
  });

  const [lessonForm, setLessonForm] = useState(EMPTY_LESSON);
  const [quizForm, setQuizForm] = useState(EMPTY_QUIZ);

  const [quizQuestions, setQuizQuestions] = useState([]);
  const [questionForm, setQuestionForm] = useState(EMPTY_QUESTION);
  const [editingQuestionId, setEditingQuestionId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingQuestion, setSavingQuestion] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const buildItems = (lessons, quizzes) => {
    const ls = lessons.map((l) => ({
      ...l,
      _type: "lesson",
      _dnd_id: `lesson-${l.id}`,
    }));

    const qs = quizzes.map((q) => ({
      ...q,
      _type: "quiz",
      _dnd_id: `quiz-${q.id}`,
    }));

    return [...ls, ...qs].sort((a, b) => a.order_number - b.order_number);
  };

  const loadAll = async () => {
    const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/lessons`),
      api.get(`/courses/${id}/quizzes`),
    ]);

    const loadedCourse = courseRes.data;
    const merged = buildItems(lessonsRes.data, quizzesRes.data);

    setCourse(loadedCourse);
    setItems(merged);
    setCourseForm({
      title: loadedCourse.title,
      description: loadedCourse.description || "",
      status: loadedCourse.status,
    });

    return { course: loadedCourse, items: merged };
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (user.role !== "admin") {
      navigate(`/courses/${id}`);
      return;
    }

    const init = async () => {
      setLoading(true);
      try {
        await loadAll();
      } catch {
        navigate("/admin/content");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [id]);

  const openEditLesson = (lesson) => {
    setLessonForm({
      title: lesson.title,
      content: lesson.content || "",
      status: lesson.status,
    });
    setEditingItem(lesson);
    setPanel("lesson");
  };

  const openEditQuiz = async (quiz) => {
    setQuizForm({
      title: quiz.title,
      status: quiz.status,
    });
    setEditingItem(quiz);
    setPanel("quiz");

    const { data } = await api.get(`/quizzes/${quiz.id}/questions`);
    setQuizQuestions(data);
    setQuestionForm(EMPTY_QUESTION);
    setEditingQuestionId(null);
  };

  const saveCourse = async (status) => {
    setSaving(true);
    try {
      await api.put(`/courses/${course.id}`, {
        ...courseForm,
        status,
      });
      await loadAll();
      setPanel("course");
    } catch {
      alert("Failed to save course.");
    } finally {
      setSaving(false);
    }
  };

  const saveLesson = async (status) => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/lessons/${editingItem.id}`, {
          ...lessonForm,
          status,
        });
      } else {
        await api.post("/lessons", {
          ...lessonForm,
          course_id: Number(id),
          status,
        });
      }

      await loadAll();
      setPanel("course");
      setEditingItem(null);
      setLessonForm(EMPTY_LESSON);
    } catch {
      alert("Failed to save lesson.");
    } finally {
      setSaving(false);
    }
  };

  const saveQuiz = async (status) => {
    setSaving(true);
    try {
      if (editingItem) {
        await api.put(`/quizzes/${editingItem.id}`, {
          ...quizForm,
          status,
        });

        await loadAll();
        setPanel("course");
        setEditingItem(null);
        setQuizForm(EMPTY_QUIZ);
        return;
      }

      const { data } = await api.post("/quizzes", {
        ...quizForm,
        course_id: Number(id),
        status,
      });

      await loadAll();
      await openEditQuiz({
        id: data.id,
        title: quizForm.title,
        status,
      });
    } catch {
      alert("Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  const deleteCourse = async () => {
    if (!confirm("Delete this course and all its content?")) return;
    try {
      await api.delete(`/courses/${course.id}`);
      navigate("/admin/content");
    } catch {
      alert("Failed to delete course.");
    }
  };

  const deleteLesson = async (lessonId) => {
    if (!confirm("Delete this lesson?")) return;

    try {
      await api.delete(`/lessons/${lessonId}`);

      const remainingLessons = items
        .filter((item) => item._type === "lesson" && item.id !== lessonId)
        .sort((a, b) => a.order_number - b.order_number);

      if (remainingLessons.length > 0) {
        await api.put("/lessons/reorder", {
          items: remainingLessons.map((lesson, i) => ({
            id: lesson.id,
            order_number: i,
          })),
        });
      }

      await loadAll();
      setPanel("course");
      setEditingItem(null);
    } catch {
      alert("Failed to delete lesson.");
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz and all its questions?")) return;

    try {
      await api.delete(`/quizzes/${quizId}`);

      const remainingQuizzes = items
        .filter((item) => item._type === "quiz" && item.id !== quizId)
        .sort((a, b) => a.order_number - b.order_number);

      if (remainingQuizzes.length > 0) {
        await api.put("/quizzes/reorder", {
          items: remainingQuizzes.map((quiz, i) => ({
            id: quiz.id,
            order_number: i,
          })),
        });
      }

      await loadAll();
      setPanel("course");
      setEditingItem(null);
    } catch {
      alert("Failed to delete quiz.");
    }
  };

  const handleCourseItemDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;

    const reordered = arrayMove(
      items,
      items.findIndex((i) => i._dnd_id === active.id),
      items.findIndex((i) => i._dnd_id === over.id),
    );

    setItems(reordered);

    try {
      await Promise.all([
        api.put("/lessons/reorder", {
          items: reordered
            .filter((i) => i._type === "lesson")
            .map((l) => ({ id: l.id, order_number: reordered.indexOf(l) })),
        }),
        api.put("/quizzes/reorder", {
          items: reordered
            .filter((i) => i._type === "quiz")
            .map((q) => ({ id: q.id, order_number: reordered.indexOf(q) })),
        }),
      ]);

      await loadAll();
    } catch {
      alert("Failed to reorder items.");
      await loadAll();
    }
  };

  const contentCount = useMemo(() => items.length, [items]);

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
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 space-y-6">
            {panel === "course" && (
              <div>
                <div className="mb-4">
                  <button
                    onClick={() => navigate("/admin/content")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Courses
                  </button>
                  <h1 className="text-2xl font-semibold mt-1">
                    Edit: {course.title}
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
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
                          />
                        </div>

                        <div className="space-y-1">
                          <Label>Description</Label>
                          <Textarea
                            value={courseForm.description}
                            onChange={(e) =>
                              setCourseForm({
                                ...courseForm,
                                description: e.target.value,
                              })
                            }
                            rows={4}
                          />
                        </div>

                        <Separator />

                        <p className="text-xs text-muted-foreground">
                          Draft courses are only visible to admins.
                        </p>

                        <div className="flex flex-wrap gap-2">
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
                          {course.status === "published" && (
                            <Button
                              variant="ghost"
                              className="text-muted-foreground"
                              onClick={() => saveCourse("draft")}
                              disabled={saving}
                            >
                              Unpublish → Draft
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() => navigate("/admin/content")}
                          >
                            Cancel
                          </Button>
                        </div>

                        <Separator />

                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={deleteCourse}
                        >
                          Delete Course
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">
                        Course Content ({contentCount})
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Drag to reorder
                      </p>
                    </div>

                    {items.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        No lessons or quizzes yet.
                      </p>
                    )}

                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={handleCourseItemDragEnd}
                    >
                      <SortableContext
                        items={items.map((i) => i._dnd_id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2">
                          {items.map((item) => (
                            <SortableContentItem
                              key={item._dnd_id}
                              item={item}
                              onEdit={() =>
                                item._type === "lesson"
                                  ? openEditLesson(item)
                                  : openEditQuiz(item)
                              }
                              onDelete={() =>
                                item._type === "lesson"
                                  ? deleteLesson(item.id)
                                  : deleteQuiz(item.id)
                              }
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DndContext>

                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setLessonForm(EMPTY_LESSON);
                          setEditingItem(null);
                          setPanel("lesson");
                        }}
                      >
                        + Lesson
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setQuizForm(EMPTY_QUIZ);
                          setEditingItem(null);
                          setPanel("quiz");
                          setQuizQuestions([]);
                          setQuestionForm(EMPTY_QUESTION);
                          setEditingQuestionId(null);
                        }}
                      >
                        + Quiz
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {panel === "lesson" && (
              <div className="max-w-4xl space-y-4">
                <div>
                  <button
                    onClick={() => setPanel("course")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Course
                  </button>
                  <h1 className="text-2xl font-semibold mt-1">
                    {editingItem ? "Edit Lesson" : "Create New Lesson"}
                  </h1>
                </div>

                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1">
                      <Label>Title</Label>
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
                      <Button
                        variant="ghost"
                        onClick={() => setPanel("course")}
                      >
                        Cancel
                      </Button>
                    </div>

                    {editingItem && (
                      <>
                        <Separator />
                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteLesson(editingItem.id)}
                        >
                          Delete Lesson
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {panel === "quiz" && (
              <div className="max-w-2xl space-y-4">
                <div>
                  <button
                    onClick={() => setPanel("course")}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Course
                  </button>
                  <h1 className="text-2xl font-semibold mt-1">
                    {editingItem ? "Edit Quiz" : "Create New Quiz"}
                  </h1>
                </div>

                <Card>
                  <CardContent className="pt-4 space-y-4">
                    <div className="space-y-1">
                      <Label>Title</Label>
                      <Input
                        value={quizForm.title}
                        onChange={(e) =>
                          setQuizForm({
                            ...quizForm,
                            title: e.target.value,
                          })
                        }
                      />
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
                      <Button
                        variant="ghost"
                        onClick={() => setPanel("course")}
                      >
                        Cancel
                      </Button>
                    </div>

                    {editingItem && (
                      <>
                        <Separator />
                        <Button
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => deleteQuiz(editingItem.id)}
                        >
                          Delete Quiz
                        </Button>
                      </>
                    )}
                  </CardContent>
                </Card>

                {editingItem ? (
                  <QuestionsList
                    quizId={editingItem.id}
                    quizQuestions={quizQuestions}
                    setQuizQuestions={setQuizQuestions}
                    questionForm={questionForm}
                    setQuestionForm={setQuestionForm}
                    editingQuestionId={editingQuestionId}
                    setEditingQuestionId={setEditingQuestionId}
                    savingQuestion={savingQuestion}
                    setSavingQuestion={setSavingQuestion}
                  />
                ) : (
                  <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5" />
                    <span>
                      Save the quiz first, then you can add questions to it.
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
