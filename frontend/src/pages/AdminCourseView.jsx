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
import { Pencil, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CONTENT_TYPE_META } from "../components/course/contentTypeMeta";
import { buildCourseContentItems } from "../components/course/buildCourseContentItems";
import {
  CourseEditorForm,
  LessonEditorForm,
  QuizEditorForm,
  QuestionEditorForm,
} from "../components/admin/ContentEditors";
import PageLoader from "../components/common/PageLoader";

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
      <Badge className="border-green-600/35 bg-green-600/18 text-xs text-green-700 hover:bg-green-600/22 dark:text-green-400">
        Published
      </Badge>
    );
  }

  return (
    <Badge className="border-yellow-600/35 bg-yellow-600/18 text-xs text-yellow-700 hover:bg-yellow-600/22 dark:text-yellow-400">
      Draft
    </Badge>
  );
}

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

  const meta = CONTENT_TYPE_META[item._type];
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
  const isEdit = editingQuestionId && editingQuestionId !== "new";

  return (
    <QuestionEditorForm
      mode={isEdit ? "edit" : "create"}
      form={form}
      setForm={setForm}
      saving={saving}
      onSave={async () => {
        setSaving(true);
        try {
          if (isEdit) {
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
      onCancel={() => {
        setEditingQuestionId(null);
        setForm(EMPTY_QUESTION);
      }}
    />
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
    <div className="space-y-3">
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
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
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
                    aria-label="Edit question"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
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
                    aria-label="Delete question"
                  >
                    <Trash2 className="h-4 w-4" />
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
        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-[var(--radius)]"
            onClick={() => {
              setQuestionForm(EMPTY_QUESTION);
              setEditingQuestionId("new");
            }}
          >
            + Add Question
          </Button>
        </div>
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

  const loadAll = async () => {
    const [courseRes, lessonsRes, quizzesRes] = await Promise.all([
      api.get(`/courses/${id}`),
      api.get(`/courses/${id}/lessons`),
      api.get(`/courses/${id}/quizzes`),
    ]);

    const loadedCourse = courseRes.data;
    const merged = buildCourseContentItems(lessonsRes.data, quizzesRes.data);

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

  if (loading) return <PageLoader />;

  if (!course) return null;

  return (
    <Layout>
      <div className="flex h-[calc(100vh-57px)]">
        <div className="flex-1 overflow-y-auto">
          <div className="px-8 py-8 space-y-6">
            {panel === "course" && (
              <div>
                <div className="grid grid-cols-2 gap-6 items-start">
                  <div className="space-y-4">
                    <CourseEditorForm
                      backLabel="Courses"
                      title={`Edit: ${course.title}`}
                      form={courseForm}
                      setForm={setCourseForm}
                      onBack={() => navigate("/admin/content")}
                      onPublish={() => saveCourse("published")}
                      onDraft={() => saveCourse("draft")}
                      onCancel={() => navigate("/admin/content")}
                      onDelete={deleteCourse}
                      saving={saving}
                    />
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
                        className="rounded-[var(--radius)]"
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
                        className="rounded-[var(--radius)]"
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
                <LessonEditorForm
                  mode={editingItem ? "edit" : "create"}
                  backLabel="Back to Course"
                  title={editingItem ? "Edit Lesson" : "Create New Lesson"}
                  form={lessonForm}
                  setForm={setLessonForm}
                  onBack={() => setPanel("course")}
                  onPublish={() => saveLesson("published")}
                  onDraft={() => saveLesson("draft")}
                  onCancel={() => setPanel("course")}
                  onDelete={
                    editingItem ? () => deleteLesson(editingItem.id) : undefined
                  }
                  saving={saving}
                />
              </div>
            )}

            {panel === "quiz" && (
              <div className="max-w-2xl space-y-4">
                <QuizEditorForm
                  mode={editingItem ? "edit" : "create"}
                  backLabel="Back to Course"
                  title={editingItem ? "Edit Quiz" : "Create New Quiz"}
                  form={quizForm}
                  setForm={setQuizForm}
                  onBack={() => setPanel("course")}
                  onPublish={() => saveQuiz("published")}
                  onDraft={() => saveQuiz("draft")}
                  onCancel={() => setPanel("course")}
                  onDelete={
                    editingItem ? () => deleteQuiz(editingItem.id) : undefined
                  }
                  saving={saving}
                />

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
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
