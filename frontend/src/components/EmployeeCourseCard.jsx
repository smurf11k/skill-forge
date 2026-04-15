import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge, ProgressBar, ScoreText } from "./StatusBadge";

export function EmployeeCourseCard({ course, navigate }) {
  const actionLabel =
    course.status === "completed"
      ? "Review"
      : course.status === "in_progress"
        ? "Continue →"
        : "Start Course →";
  const actionVariant = course.status === "not_started" ? "outline" : "default";

  return (
    <Card
      className="cursor-pointer hover:border-foreground/20 transition-colors flex flex-col"
      onClick={() => navigate(`/courses/${course.id}`)}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-sm leading-snug">{course.title}</CardTitle>
          <StatusBadge status={course.status} />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 flex-1">
        <p className="text-xs text-muted-foreground line-clamp-2">
          {course.description || "No description."}
        </p>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">
            {course.totalLessons} lesson{course.totalLessons !== 1 ? "s" : ""} ·{" "}
            {course.totalQuizzes} quiz{course.totalQuizzes !== 1 ? "zes" : ""}
          </p>
          {/* Due date and assignment status badge */}
          {(() => {
            const status = course.deadline_status || course.assignment_status;
            return (
              <div className="flex items-center justify-between gap-2">
                {course.due_at && (
                  <p className="text-xs text-muted-foreground">
                    Due {new Date(course.due_at).toLocaleDateString()}
                  </p>
                )}
                {status && (
                  <span
                    className={`inline-flex items-center rounded px-2 py-1 text-xs font-medium whitespace-nowrap ${
                      {
                        assigned:
                          "bg-blue-500/15 text-blue-400 border border-blue-500/30",
                        in_progress:
                          "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
                        overdue:
                          "bg-red-500/15 text-red-400 border border-red-500/30",
                        completed_on_time:
                          "bg-green-500/15 text-green-400 border border-green-500/30",
                        completed_late:
                          "bg-orange-500/15 text-orange-400 border border-orange-500/30",
                        completed:
                          "bg-green-500/15 text-green-400 border border-green-500/30",
                      }[status] || ""
                    }`}
                  >
                    {{
                      assigned: "Assigned",
                      in_progress: "In Progress",
                      overdue: "Overdue",
                      completed_on_time: "On Time",
                      completed_late: "Late",
                      completed: "Completed",
                    }[status] || status.replaceAll("_", " ")}
                  </span>
                )}
              </div>
            );
          })()}
        </div>
        <div className="space-y-1">
          <ProgressBar pct={course.progressPct} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{course.progressPct}% complete</span>
            {course.avgScore !== null && (
              <span>
                Avg <ScoreText pct={course.avgScore} className="text-xs" />
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          variant={actionVariant}
          className="w-full mt-auto"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/courses/${course.id}`);
          }}
        >
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
}
