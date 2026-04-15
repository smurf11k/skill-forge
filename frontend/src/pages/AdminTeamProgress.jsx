import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/auth";
import { ScoreText, StatusBadge } from "../components/common/StatusBadge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const USER_FILTERS = [
  { value: "employees", label: "Employees only" },
  { value: "former_employees", label: "Former employees (now admin)" },
  { value: "all", label: "All users" },
];

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

export default function AdminTeamProgress() {
  const [searchParams] = useSearchParams();
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allResults, setAllResults] = useState([]);
  const [lessonProgress, setLessonProgress] = useState([]);
  const [quizMap, setQuizMap] = useState({});
  const [lessonMap, setLessonMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [userFilter, setUserFilter] = useState("employees");
  const [filterUser, setFilterUser] = useState(
    searchParams.get("user") ?? "all",
  );
  const [filterCourse, setFilterCourse] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      api.get("/users"),
      api.get("/courses"),
      api.get("/admin/team-progress"),
    ])
      .then(async ([u, c, r]) => {
        setUsers(u.data);
        setCourses(c.data);
        setAllResults(r.data.results);
        setLessonProgress(r.data.lesson_progress);

        const qMap = {};
        const lMap = {};
        await Promise.all(
          c.data.map(async (course) => {
            const [quizzes, lessons] = await Promise.all([
              api.get(`/courses/${course.id}/quizzes`),
              api.get(`/courses/${course.id}/lessons`),
            ]);
            qMap[course.id] = quizzes.data;
            lMap[course.id] = lessons.data;
          }),
        );
        setQuizMap(qMap);
        setLessonMap(lMap);
      })
      .finally(() => setLoading(false));
  }, []);

  const PASS = 80;

  const roleFilteredUsers = () => {
    if (userFilter === "employees")
      return users.filter((u) => u.role === "employee");
    if (userFilter === "former_employees")
      return users.filter(
        (u) => u.role === "admin" && allResults.some((r) => r.user_id === u.id),
      );
    return users;
  };

  const visibleUsers =
    filterUser === "all"
      ? roleFilteredUsers()
      : roleFilteredUsers().filter((u) => String(u.id) === filterUser);

  const visibleCourses =
    filterCourse === "all"
      ? courses
      : courses.filter((c) => String(c.id) === filterCourse);

  const rows = [];
  for (const user of visibleUsers) {
    const userResults = allResults.filter((r) => r.user_id === user.id);
    for (const course of visibleCourses) {
      const quizzes = quizMap[course.id] ?? [];
      const lessons = lessonMap[course.id] ?? [];
      const passed = quizzes.filter((q) =>
        userResults.some(
          (r) =>
            r.quiz_id === q.id &&
            Math.round((r.score / r.total_questions) * 100) >= PASS,
        ),
      );

      const lpEntry = lessonProgress.find(
        (lp) => lp.user_id === user.id && lp.course_id === course.id,
      );
      const completedLessons = lpEntry ? Number(lpEntry.completed_count) : 0;
      const totalLessons = lessons.length;

      const courseResults = userResults.filter(
        (r) => r.course_id === course.id,
      );
      const avgScore = courseResults.length
        ? Math.round(
            courseResults.reduce(
              (a, r) => a + (r.score / r.total_questions) * 100,
              0,
            ) / courseResults.length,
          )
        : null;
      const lastQuiz = courseResults.length
        ? new Date(
            Math.max(...courseResults.map((r) => new Date(r.completed_at))),
          ).toLocaleDateString()
        : null;
      const isCompleted =
        quizzes.length > 0 &&
        passed.length === quizzes.length &&
        completedLessons === totalLessons;
      const isStarted = courseResults.length > 0 || completedLessons > 0;
      const status = isCompleted
        ? "completed"
        : isStarted
          ? "in_progress"
          : "not_started";

      rows.push({
        user,
        course,
        quizzes,
        lessons,
        passed: passed.length,
        completedLessons,
        totalLessons,
        avgScore,
        lastQuiz,
        status,
      });
    }
  }

  const filteredRows = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return rows;

    return rows.filter((row) =>
      [
        row.user.name,
        row.user.email,
        row.user.role,
        row.course.title,
        row.status,
        row.avgScore ?? "",
        row.lastQuiz ?? "",
      ].some((field) => normalize(field).includes(q)),
    );
  }, [rows, searchTerm]);

  if (loading)
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Team Progress</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Per-employee, per-course breakdown
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            value={userFilter}
            onValueChange={(v) => {
              setUserFilter(v);
              setFilterUser("all");
            }}
          >
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

          <Select value={filterUser} onValueChange={setFilterUser}>
            <SelectTrigger className="w-40 h-8 text-xs">
              <SelectValue placeholder="All people" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All people
              </SelectItem>
              {roleFilteredUsers().map((u) => (
                <SelectItem key={u.id} value={String(u.id)} className="text-xs">
                  {u.name}
                  {u.role === "admin" ? " (admin)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCourse} onValueChange={setFilterCourse}>
            <SelectTrigger className="w-48 h-8 text-xs">
              <SelectValue asChild>
                <span className="truncate block max-w-full">
                  {filterCourse === "all"
                    ? "All Courses"
                    : courses.find((c) => String(c.id) === filterCourse)?.title}
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                All courses
              </SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)} className="text-xs">
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search people, courses, status..."
            className="w-64 h-8 text-xs"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="col-span-3">Employee</span>
              <span className="col-span-3">Course</span>
              <span className="col-span-1">Lessons</span>
              <span className="col-span-1">Quizzes</span>
              <span className="col-span-1 text-center">Avg</span>
              <span className="col-span-1">Last Quiz</span>
              <span className="col-span-2 pl-4">Status</span>
            </div>
            {filteredRows.length === 0 && (
              <p className="text-sm text-muted-foreground px-4 py-6">
                No data matches this filter.
              </p>
            )}
            {filteredRows.map((row, i) => (
              <div
                key={`${row.user.id}-${row.course.id}`}
                className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${i !== 0 ? "border-t" : ""}`}
              >
                <div className="col-span-3">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{row.user.name}</p>
                    {row.user.role === "admin" && (
                      <span className="text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded">
                        admin
                      </span>
                    )}
                  </div>
                </div>
                <span className="col-span-3 text-sm">{row.course.title}</span>
                <span className="col-span-1 text-sm text-muted-foreground">
                  {row.completedLessons}/{row.totalLessons}
                </span>
                <span className="col-span-1 text-sm text-muted-foreground">
                  {row.passed}/{row.quizzes.length}
                </span>
                <div className="col-span-1 flex justify-center">
                  {row.avgScore !== null ? (
                    <ScoreText
                      pct={row.avgScore}
                      className="text-sm whitespace-nowrap"
                    />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>
                <span className="col-span-1 text-xs text-muted-foreground">
                  {row.lastQuiz ?? "—"}
                </span>
                <div className="col-span-2 pl-4">
                  <StatusBadge status={row.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
