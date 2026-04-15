import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { useCourseProgress } from "../hooks/useCourseProgress";
import {
  StatusBadge,
  ProgressBar,
  ScoreText,
  scoreColor,
} from "../components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StatCard from "../components/common/StatCard";
import { useEffect, useState } from "react";
import PageLoader from "../components/common/PageLoader";

export default function Results() {
  const user = getUser();
  const navigate = useNavigate();
  const { courses, results, stats, loading } = useCourseProgress();
  const [resetting, setResetting] = useState(false);
  const [assignments, setAssignments] = useState([]);

  const handleReset = async () => {
    if (!confirm("Reset all your progress? This cannot be undone.")) return;
    setResetting(true);
    try {
      await api.delete(`/results/${user.id}/reset`);
      window.location.reload();
    } catch (error) {
      console.error("Failed to reset progress", error);
    } finally {
      setResetting(false);
    }
  };

  useEffect(() => {
    const loadAssignments = async () => {
      try {
        const { data } = await api.get("/assignments");
        setAssignments(data);
      } catch {
        setAssignments([]);
      }
    };

    loadAssignments();
  }, []);

  if (loading) return <PageLoader />;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">My Progress</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your quiz scores and course completion overview
            </p>
          </div>
          {results.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="rounded-[var(--radius)]"
              onClick={handleReset}
              disabled={resetting}
            >
              {resetting ? "Resetting…" : "Reset Progress"}
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            ["🏁", "Courses Done", stats.coursesDone],
            ["🧠", "Quizzes Taken", stats.quizzesTaken],
            [
              "📊",
              "Avg Score",
              stats.avgScore !== null ? `${stats.avgScore}%` : "—",
            ],
          ].map(([visual, label, value]) => (
            <StatCard key={label} label={label} value={value} visual={visual} />
          ))}
        </div>

        {/* Per-course breakdown */}
        {courses.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm text-muted-foreground">
              No courses available yet.
            </p>
            <Button variant="link" onClick={() => navigate("/courses")}>
              Browse courses →
            </Button>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              {/* Header */}
              <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="col-span-4">Course</span>
                <span className="col-span-3">Progress</span>
                <span className="col-span-1">Quizzes</span>
                <span className="col-span-1">Avg</span>
                <span className="col-span-1">Due</span>
                <span className="col-span-2">Status</span>
              </div>

              {courses.map((course, i) => {
                const assignment = assignments.find(
                  (a) => a.course_id === course.id,
                );

                const dueText = assignment?.due_at
                  ? new Date(assignment.due_at).toLocaleDateString()
                  : "—";

                const deadlineStatusText =
                  assignment?.deadline_status === "completed_on_time"
                    ? "On time"
                    : assignment?.deadline_status === "completed_late"
                      ? "Late"
                      : assignment?.deadline_status === "overdue"
                        ? "Overdue"
                        : null;

                // find the latest attempt date for this course
                const courseResults = results.filter(
                  (r) => r.course_id === course.id,
                );
                const lastAttempt = courseResults.length
                  ? new Date(
                      Math.max(
                        ...courseResults.map((r) => new Date(r.completed_at)),
                      ),
                    ).toLocaleDateString()
                  : null;

                return (
                  <div
                    key={course.id}
                    className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t" : ""}`}
                    onClick={() => navigate(`/courses/${course.id}`)}
                  >
                    {/* Course name */}
                    <div className="col-span-4">
                      <p className="text-base font-semibold">{course.title}</p>
                      {lastAttempt && (
                        <p className="text-xs text-muted-foreground">
                          Last attempt {lastAttempt}
                        </p>
                      )}
                    </div>

                    {/* Progress bar */}
                    <div className="col-span-3 space-y-1">
                      <ProgressBar pct={course.progressPct} />
                      <p className="text-xs text-muted-foreground">
                        {course.progressPct}%
                      </p>
                    </div>

                    {/* Quizzes passed */}
                    <div className="col-span-1 text-sm text-muted-foreground">
                      {course.passedQuizzes} / {course.totalQuizzes}
                    </div>

                    {/* Avg score */}
                    <div className="col-span-1">
                      {course.avgScore !== null ? (
                        <ScoreText pct={course.avgScore} className="text-sm" />
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </div>

                    {/* Due date */}
                    <div className="col-span-1 text-xs text-muted-foreground">
                      <div>{dueText}</div>
                      {deadlineStatusText && (
                        <div
                          className={
                            assignment?.deadline_status === "overdue" ||
                            assignment?.deadline_status === "completed_late"
                              ? "text-amber-600 mt-1"
                              : "mt-1"
                          }
                        >
                          {deadlineStatusText}
                        </div>
                      )}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <StatusBadge status={course.status} />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Recent quiz attempts */}
        {results.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Recent Quiz Attempts
            </h2>
            <Card>
              <CardContent className="p-0">
                <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="col-span-5">Course</span>
                  <span className="col-span-3">Score</span>
                  <span className="col-span-2">Result</span>
                  <span className="col-span-2">Date</span>
                </div>
                {results.slice(0, 10).map((r, i) => {
                  const pct = Math.round((r.score / r.total_questions) * 100);
                  const passed = pct >= 80;
                  const course = courses.find((c) => c.id === r.course_id);
                  return (
                    <div
                      key={r.id}
                      className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${i !== 0 ? "border-t" : ""}`}
                    >
                      <span className="col-span-5 text-sm">
                        {course?.title ?? `Course #${r.course_id}`}
                      </span>
                      <div className="col-span-3 flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${scoreColor(pct)}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <ScoreText pct={pct} className="text-xs" />
                      </div>
                      <span className="col-span-2">
                        {passed ? (
                          <span className="text-xs text-green-500 font-medium">
                            Passed
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">
                            Not passed
                          </span>
                        )}
                      </span>
                      <span className="col-span-2 text-xs text-muted-foreground">
                        {new Date(r.completed_at).toLocaleString([], {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
