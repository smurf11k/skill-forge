import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import LessonMarkdownEditor from "../markdown/LessonMarkdownEditor";

export function EditorHeader({ backLabel, title, onBack, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <button
        type="button"
        onClick={onBack}
        className="text-xs text-muted-foreground hover:text-foreground"
      >
        ← {backLabel}
      </button>
      <h1 className="text-2xl font-semibold mt-1">{title}</h1>
    </div>
  );
}

export function EditorCard({ children, className = "" }) {
  return (
    <Card>
      <CardContent className={`p-4 space-y-4 ${className}`}>
        {children}
      </CardContent>
    </Card>
  );
}

export function EditorActions({
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryVariant = "default",
  secondaryLabel,
  onSecondary,
  secondaryDisabled,
  secondaryVariant = "outline",
  tertiaryLabel,
  onTertiary,
  tertiaryDisabled,
  tertiaryVariant = "ghost",
  destructiveLabel,
  onDestructive,
  destructiveDisabled,
  destructiveVariant = "ghost",
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {primaryLabel && (
        <Button
          size="sm"
          variant={primaryVariant}
          onClick={onPrimary}
          disabled={primaryDisabled}
        >
          {primaryLabel}
        </Button>
      )}

      {secondaryLabel && (
        <Button
          size="sm"
          variant={secondaryVariant}
          onClick={onSecondary}
          disabled={secondaryDisabled}
        >
          {secondaryLabel}
        </Button>
      )}

      {tertiaryLabel && (
        <Button
          size="sm"
          variant={tertiaryVariant}
          onClick={onTertiary}
          disabled={tertiaryDisabled}
        >
          {tertiaryLabel}
        </Button>
      )}

      {destructiveLabel && (
        <Button
          size="sm"
          variant={destructiveVariant}
          className="text-destructive hover:text-destructive"
          onClick={onDestructive}
          disabled={destructiveDisabled}
        >
          {destructiveLabel}
        </Button>
      )}
    </div>
  );
}

export function CourseEditorForm({
  backLabel,
  title,
  form,
  setForm,
  onBack,
  onPublish,
  onDraft,
  onCancel,
  onDelete,
  saving,
  hint = "Draft courses are only visible to admins.",
}) {
  return (
    <div className="max-w-2xl space-y-4">
      <EditorHeader backLabel={backLabel} title={title} onBack={onBack} />

      <EditorCard>
        <div className="space-y-1">
          <Label>Course Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Advanced CI/CD Pipeline"
          />
        </div>

        <div className="space-y-1">
          <Label>Description</Label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will employees learn?"
            rows={4}
          />
        </div>

        <Separator />

        <p className="text-xs text-muted-foreground">{hint}</p>

        <EditorActions
          primaryLabel="Save & Publish"
          onPrimary={onPublish}
          primaryDisabled={saving}
          secondaryLabel="Save as Draft"
          onSecondary={onDraft}
          secondaryDisabled={saving}
          tertiaryLabel="Cancel"
          onTertiary={onCancel}
          tertiaryDisabled={saving}
          destructiveLabel={onDelete ? "Delete Course" : undefined}
          onDestructive={onDelete}
          destructiveDisabled={saving}
        />
      </EditorCard>
    </div>
  );
}

export function LessonEditorForm({
  mode,
  backLabel,
  title,
  form,
  setForm,
  courses,
  showCourseSelect,
  onBack,
  onPublish,
  onDraft,
  onCancel,
  onDelete,
  saving,
  hint = "Draft lessons are only visible to admins.",
}) {
  const isEdit = mode === "edit";

  return (
    <div className="max-w-4xl space-y-4">
      <EditorHeader backLabel={backLabel} title={title} onBack={onBack} />

      <EditorCard>
        <div className="space-y-1">
          <Label>Lesson Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Commit Best Practices"
          />
        </div>

        {showCourseSelect && (
          <div className="space-y-1">
            <Label>Course</Label>
            <Select
              value={form.course_id}
              onValueChange={(v) => setForm({ ...form, course_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1">
          <Label>Content</Label>
          <LessonMarkdownEditor
            value={form.content}
            onChange={(value) => setForm({ ...form, content: value })}
          />
        </div>

        <Separator />

        <EditorActions
          primaryLabel="Save & Publish"
          onPrimary={onPublish}
          primaryDisabled={saving}
          secondaryLabel={
            isEdit && form.status === "published"
              ? "Unpublish → Draft"
              : "Save as Draft"
          }
          onSecondary={onDraft}
          secondaryDisabled={saving}
          tertiaryLabel="Cancel"
          onTertiary={onCancel}
          tertiaryDisabled={saving}
          destructiveLabel={onDelete ? "Delete Lesson" : undefined}
          onDestructive={onDelete}
          destructiveDisabled={saving}
        />
      </EditorCard>
    </div>
  );
}

export function QuizEditorForm({
  mode,
  backLabel,
  title,
  form,
  setForm,
  courses,
  showCourseSelect,
  onBack,
  onPublish,
  onDraft,
  onCancel,
  onDelete,
  saving,
  hint = "Save the quiz first, then you can add questions to it.",
}) {
  const isEdit = mode === "edit";

  return (
    <div className="max-w-2xl space-y-4">
      <EditorHeader backLabel={backLabel} title={title} onBack={onBack} />

      <EditorCard>
        <div className="space-y-1">
          <Label>Quiz Title</Label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Security Awareness Check"
          />
        </div>

        {showCourseSelect && (
          <div className="space-y-1">
            <Label>Attach to Course</Label>
            <Select
              value={form.course_id}
              onValueChange={(v) => setForm({ ...form, course_id: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={String(course.id)}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <Separator />

        <EditorActions
          primaryLabel="Save & Publish"
          onPrimary={onPublish}
          primaryDisabled={saving}
          secondaryLabel={
            isEdit && form.status === "published"
              ? "Unpublish → Draft"
              : "Save as Draft"
          }
          onSecondary={onDraft}
          secondaryDisabled={saving}
          tertiaryLabel="Cancel"
          onTertiary={onCancel}
          tertiaryDisabled={saving}
          destructiveLabel={onDelete ? "Delete Quiz" : undefined}
          onDestructive={onDelete}
          destructiveDisabled={saving}
        />
      </EditorCard>

      {hint && (
        <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5">
          <Lightbulb className="h-3.5 w-3.5" />
          <span>{hint}</span>
        </p>
      )}
    </div>
  );
}

export function QuestionEditorForm({
  mode,
  form,
  setForm,
  saving,
  onSave,
  onCancel,
}) {
  const isEdit = mode === "edit";

  return (
    <EditorCard>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
        {isEdit ? "Edit Question" : "New Question"}
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

      <EditorActions
        primaryLabel={isEdit ? "Save" : "Add Question"}
        onPrimary={onSave}
        primaryDisabled={saving}
        tertiaryLabel="Cancel"
        onTertiary={onCancel}
        tertiaryDisabled={saving}
      />
    </EditorCard>
  );
}
