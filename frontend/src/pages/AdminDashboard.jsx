import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/auth";
import { ScoreText, ProgressBar } from "../components/common/StatusBadge";
import StatCard from "../components/common/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageLoader from "../components/common/PageLoader";

const USER_FILTERS = [
  { value: "employees", label: "Employees only" },
  { value: "former_employees", label: "Former employees (now admin)" },
  { value: "all", label: "All users" },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [quizMap, setQuizMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [userFilter, setUserFilter] = useState("employees");

  useEffect(() => {
    Promise.all([
      api.get("/admin/stats"),
      api.get("/users"),
      api.get("/courses"),
      api.get("/admin/team-progress"),
    ])
      .then(async ([s, u, c, r]) => {
        setStats(s.data);
        setUsers(u.data);
        setCourses(c.data);
        setAllResults(r.data.results);
        const map = {};
        await Promise.all(
          c.data.map(async (course) => {
            const { data } = await api.get(`/courses/${course.id}/quizzes`);
            map[course.id] = data;
          }),
        );
        setQuizMap(map);
      })
      .finally(() => setLoading(false));
  }, []);

  const PASS = 80;

  const buildEmployeeStats = (userList) =>
    userList.map((user) => {
      const userResults = allResults.filter((r) => r.user_id === user.id);
      const passedCourses = courses.filter((course) => {
        const quizzes = quizMap[course.id] ?? [];
        return (
          quizzes.length > 0 &&
          quizzes.every((q) =>
            userResults.some(
              (r) =>
                r.quiz_id === q.id &&
                Math.round((r.score / r.total_questions) * 100) >= PASS,
            ),
          )
        );
      });
      const progressPct =
        courses.length === 0
          ? 0
          : Math.round((passedCourses.length / courses.length) * 100);
      const avgScore = userResults.length
        ? Math.round(
            userResults.reduce(
              (a, r) => a + (r.score / r.total_questions) * 100,
              0,
            ) / userResults.length,
          )
        : null;
      const lastActive = userResults.length
        ? new Date(
            Math.max(...userResults.map((r) => new Date(r.completed_at))),
          ).toLocaleDateString()
        : null;
      return {
        ...user,
        passedCourses: passedCourses.length,
        totalCourses: courses.length,
        progressPct,
        avgScore,
        lastActive,
      };
    });

  // Apply user filter
  const usersForTable = () => {
    if (userFilter === "employees")
      return users.filter((u) => u.role === "employee");
    if (userFilter === "former_employees")
      return users.filter(
        (u) => u.role === "admin" && allResults.some((r) => r.user_id === u.id),
      );
    return users; // all
  };

  const employeeStats = buildEmployeeStats(usersForTable());

  // Course completion rates (based on employees only for accuracy)
  const employees = users.filter((u) => u.role === "employee");
  const courseStats = courses.map((course) => {
    const quizzes = quizMap[course.id] ?? [];
    const completedBy = employees.filter((user) => {
      const userResults = allResults.filter((r) => r.user_id === user.id);
      return (
        quizzes.length > 0 &&
        quizzes.every((q) =>
          userResults.some(
            (r) =>
              r.quiz_id === q.id &&
              Math.round((r.score / r.total_questions) * 100) >= PASS,
          ),
        )
      );
    });
    const pct =
      employees.length === 0
        ? 0
        : Math.round((completedBy.length / employees.length) * 100);
    return {
      ...course,
      completedBy: completedBy.length,
      total: employees.length,
      pct,
    };
  });

  const atRisk = employees.filter((e) => {
    const stats = buildEmployeeStats([e])[0];
    return stats.progressPct < 50;
  }).length;

  const allEmployeeStats = buildEmployeeStats(employees);
  const avgCompletion = allEmployeeStats.length
    ? Math.round(
        allEmployeeStats.reduce((a, e) => a + e.progressPct, 0) /
          allEmployeeStats.length,
      )
    : null;

  if (loading) return <PageLoader />;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Platform-wide overview
            </p>
          </div>
          <Button onClick={() => navigate("/admin/content")}>
            + Create Content
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            ["👥", "Employees", stats?.total_employees ?? 0],
            [
              "📊",
              "Avg Completion",
              avgCompletion !== null ? `${avgCompletion}%` : "—",
            ],
            ["🏆", "Avg Score", stats?.avg_score ? `${stats.avg_score}%` : "—"],
            ["⚠️", "At Risk (< 50%)", atRisk],
          ].map(([visual, label, value]) => (
            <StatCard key={label} label={label} value={value} visual={visual} />
          ))}
        </div>

        {/* Team members table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Team Members</h2>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger className="w-52 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {USER_FILTERS.map((f) => (
                  <SelectItem key={f.value} value={f.value} className="text-xs">
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="col-span-3">Name</span>
                <span className="col-span-2">Courses Done</span>
                <span className="col-span-3">Progress</span>
                <span className="col-span-2">Avg Score</span>
                <span className="col-span-2">Last Active</span>
              </div>
              {employeeStats.length === 0 && (
                <p className="text-sm text-muted-foreground px-4 py-6">
                  No users match this filter.
                </p>
              )}
              {employeeStats.map((emp, i) => (
                <div
                  key={emp.id}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center cursor-pointer hover:bg-muted/30 transition-colors ${i !== 0 ? "border-t" : ""}`}
                  onClick={() => navigate(`/admin/team?user=${emp.id}`)}
                >
                  <div className="col-span-3">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{emp.name}</p>
                      {emp.role === "admin" && (
                        <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                          admin
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{emp.email}</p>
                  </div>
                  <span className="col-span-2 text-sm text-muted-foreground">
                    {emp.passedCourses}/{emp.totalCourses}
                  </span>
                  <div className="col-span-3 space-y-1">
                    <ProgressBar pct={emp.progressPct} />
                    <p className="text-xs text-muted-foreground">
                      {emp.progressPct}%
                    </p>
                  </div>
                  <div className="col-span-2">
                    {emp.avgScore !== null ? (
                      <ScoreText pct={emp.avgScore} className="text-sm" />
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </div>
                  <span className="col-span-2 text-xs text-muted-foreground">
                    {emp.lastActive ?? "—"}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Course completion rates */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold">Course Completion Rate</h2>
          <div className="grid grid-cols-3 gap-4">
            {courseStats.map((course) => (
              <Card key={course.id}>
                <CardContent className="pt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium truncate">
                      {course.title}
                    </p>
                    <ScoreText
                      pct={course.pct}
                      className="text-xs shrink-0 ml-2"
                    />
                  </div>
                  <ProgressBar pct={course.pct} />
                  <p className="text-xs text-muted-foreground">
                    {course.completedBy} of {course.total} employees completed
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
