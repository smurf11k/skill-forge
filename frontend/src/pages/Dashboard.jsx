import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { getUser } from "../api/auth";
import { useCourseProgress } from "../hooks/useCourseProgress";
import { EmployeeCourseCard } from "../components/EmployeeCourseCard";
import StatCard from "../components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const user = getUser();
  const navigate = useNavigate();
  const { courses, stats, loading } = useCourseProgress();

  if (loading)
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );

  const inProgress = courses.filter((c) => c.status === "in_progress");
  const notStarted = courses.filter((c) => c.status === "not_started");
  const completed = courses.filter((c) => c.status === "completed");
  const assigned = courses.filter(
    (c) =>
      (c.deadline_status || c.assignment_status) && c.status !== "completed",
  );

  // Welcome message subtitle
  const subtitle = () => {
    const parts = [];
    if (assigned.length > 0)
      parts.push(
        `${assigned.length} course${assigned.length !== 1 ? "s" : ""} assigned`,
      );
    if (inProgress.length > 0) parts.push(`${inProgress.length} in progress`);
    if (notStarted.length > 0) parts.push(`${notStarted.length} not started`);
    if (parts.length === 0 && completed.length > 0)
      return "You've completed all available courses. Great work!";
    if (parts.length === 0) return "No courses available yet.";
    return `You have ${parts.join(", ")}. Keep forging your skills.`;
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Welcome hero */}
        <Card className="relative overflow-hidden">
          <CardContent className="pt-6 pb-6">
            <h1 className="text-2xl font-semibold">
              Welcome back, {user.name}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{subtitle()}</p>
            <div className="flex gap-3 mt-5">
              {inProgress.length > 0 && (
                <Button onClick={() => navigate(`/courses`)}>
                  Continue Learning →
                </Button>
              )}
              {notStarted.length > 0 && inProgress.length === 0 && (
                <Button
                  onClick={() => navigate(`/courses/${notStarted[0].id}`)}
                >
                  Start Learning →
                </Button>
              )}
              <Button variant="outline" onClick={() => navigate("/results")}>
                View My Progress
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats — 4 cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            ["📚", "Total Courses", courses.length],
            ["✅", "Completed", completed.length],
            ["⏳", "In Progress", inProgress.length],
            [
              "📈",
              "Avg Quiz Score",
              stats.avgScore !== null ? `${stats.avgScore}%` : "—",
            ],
          ].map(([visual, label, value]) => (
            <StatCard key={label} label={label} value={value} visual={visual} />
          ))}
        </div>

        {/* In progress */}
        {inProgress.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Continue Learning
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {inProgress.map((course) => (
                <EmployeeCourseCard
                  key={course.id}
                  course={course}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Not started */}
        {notStarted.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Not Started
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {notStarted.map((course) => (
                <EmployeeCourseCard
                  key={course.id}
                  course={course}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Completed ✓
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {completed.map((course) => (
                <EmployeeCourseCard
                  key={course.id}
                  course={course}
                  navigate={navigate}
                />
              ))}
            </div>
          </div>
        )}

        {courses.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No courses available yet.
          </p>
        )}
      </div>
    </Layout>
  );
}
