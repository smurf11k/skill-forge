import { Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import api from "../../api/auth";
import { QuestionEditorForm } from "./ContentEditors";

function QuestionForm({
  quizId,
  form,
  setForm,
  editingId,
  setEditingId,
  saving,
  setSaving,
  setQuestions,
  emptyQuestion,
}) {
  const isEdit = editingId && editingId !== "new";

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
            await api.put(`/questions/${editingId}`, form);
          } else {
            await api.post("/questions", { ...form, quiz_id: quizId });
          }

          const { data } = await api.get(`/quizzes/${quizId}/questions`);
          setQuestions(data);
          setForm(emptyQuestion);
          setEditingId(null);
        } catch {
          alert("Failed to save question.");
        } finally {
          setSaving(false);
        }
      }}
      onCancel={() => {
        setEditingId(null);
        setForm(emptyQuestion);
      }}
    />
  );
}

export default function QuizQuestionsList({
  quizId,
  questions,
  setQuestions,
  form,
  setForm,
  editingId,
  setEditingId,
  saving,
  setSaving,
  emptyQuestion,
  actionMode = "icon",
  className = "space-y-3",
}) {
  const qProps = {
    quizId,
    form,
    setForm,
    editingId,
    setEditingId,
    saving,
    setSaving,
    setQuestions,
    emptyQuestion,
  };

  const isTextMode = actionMode === "text";

  return (
    <div className={className}>
      <h3 className="text-sm font-semibold">Questions ({questions.length})</h3>

      {questions.map((q, i) => (
        <Card key={q.id}>
          <CardContent className="pt-3 pb-3">
            {editingId === q.id ? (
              <QuestionForm {...qProps} />
            ) : (
              <div className="flex items-start gap-3">
                <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded shrink-0 mt-0.5">
                  Q{i + 1}
                </span>
                <p className="text-sm flex-1">{q.question_text}</p>

                <div className="flex gap-1 shrink-0">
                  {isTextMode ? (
                    <>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setForm({
                            question_text: q.question_text,
                            option_a: q.option_a,
                            option_b: q.option_b,
                            option_c: q.option_c,
                            option_d: q.option_d,
                            correct_answer: q.correct_answer ?? "a",
                          });
                          setEditingId(q.id);
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
                            setQuestions(data);
                          } catch {
                            alert("Failed to delete question.");
                          }
                        }}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          setForm({
                            question_text: q.question_text,
                            option_a: q.option_a,
                            option_b: q.option_b,
                            option_c: q.option_c,
                            option_d: q.option_d,
                            correct_answer: q.correct_answer ?? "a",
                          });
                          setEditingId(q.id);
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
                            setQuestions(data);
                          } catch {
                            alert("Failed to delete question.");
                          }
                        }}
                        aria-label="Delete question"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}

      {editingId === "new" ? (
        <QuestionForm {...qProps} />
      ) : (
        <div className={isTextMode ? "" : "pt-2"}>
          <Button
            variant="outline"
            size="sm"
            className="rounded-[var(--radius)]"
            onClick={() => {
              setForm(emptyQuestion);
              setEditingId("new");
            }}
          >
            + Add Question
          </Button>
        </div>
      )}

      {questions.length === 0 && editingId !== "new" && (
        <p className="text-xs text-muted-foreground">No questions yet.</p>
      )}
    </div>
  );
}
