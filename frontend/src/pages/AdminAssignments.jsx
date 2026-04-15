import { useEffect, useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import Layout from "../components/Layout";
import api from "../api/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

function IconActionButton({
  label,
  onClick,
  disabled = false,
  children,
  className = "",
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          disabled={disabled}
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

function StatusBadge({ assignment }) {
  const status = assignment.deadline_status || assignment.status || "assigned";

  const styles = {
    assigned: "bg-muted text-muted-foreground border-border",
    in_progress: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    completed: "bg-green-500/15 text-green-400 border-green-500/30",
    completed_on_time: "bg-green-500/15 text-green-400 border-green-500/30",
    completed_late: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    overdue: "bg-red-500/15 text-red-400 border-red-500/30",
  };

  const labels = {
    assigned: "Assigned",
    in_progress: "In Progress",
    completed: "Completed",
    completed_on_time: "On Time",
    completed_late: "Late",
    overdue: "Overdue",
  };

  return (
    <span
      className={`inline-flex items-center rounded-md border px-2 py-1 text-[11px] font-medium whitespace-nowrap ${styles[status] || styles.assigned}`}
    >
      {labels[status] || "Assigned"}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) return "—";

  const normalized = value.replace(" ", "T").slice(0, 19);
  const [datePart, timePart] = normalized.split("T");

  if (!datePart || !timePart) {
    return new Date(value).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  const [year, month, day] = datePart.split("-").map(Number);
  const [hours, minutes, seconds = 0] = timePart.split(":").map(Number);
  const localDate = new Date(year, month - 1, day, hours, minutes, seconds);

  const pad = (n) => String(n).padStart(2, "0");
  return `${pad(localDate.getDate())}.${pad(localDate.getMonth() + 1)}.${localDate.getFullYear()}, ${pad(localDate.getHours())}:${pad(localDate.getMinutes())}`;
}

function toDatetimeLocalValue(value) {
  if (!value) return "";
  return value.replace(" ", "T").slice(0, 16);
}

function toApiDateTimeValue(value) {
  if (!value) return null;
  return `${value}:00`;
}

export default function AdminAssignments() {
  const [users, setUsers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [rowSaving, setRowSaving] = useState(null);

  const [filters, setFilters] = useState({
    user_id: "all",
    course_id: "all",
    status: "all",
  });

  const [form, setForm] = useState({
    user_id: "",
    course_id: "",
    due_at: "",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, coursesRes, assignmentsRes] = await Promise.all([
        api.get("/users"),
        api.get("/courses"),
        api.get("/assignments"),
      ]);

      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      const employeeUsers = allUsers.filter((user) => user.role === "employee");

      const allCourses = Array.isArray(coursesRes.data) ? coursesRes.data : [];
      const publishedCourses = allCourses.filter(
        (course) => course.status === "published",
      );

      setUsers(employeeUsers);
      setCourses(publishedCourses);
      setAssignments(
        Array.isArray(assignmentsRes.data) ? assignmentsRes.data : [],
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load assignments page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({
      user_id: "",
      course_id: "",
      due_at: "",
    });
    setEditingId(null);
  };

  const handleSubmit = async () => {
    if (!form.user_id || !form.course_id) {
      alert("Please select both employee and course.");
      return;
    }

    setSaving(true);
    try {
      if (editingId) {
        await api.put(`/assignments/${editingId}`, {
          due_at: toApiDateTimeValue(form.due_at),
        });
      } else {
        await api.post("/assignments", {
          user_ids: [Number(form.user_id)],
          course_id: Number(form.course_id),
          due_at: toApiDateTimeValue(form.due_at),
        });
      }

      await load();
      resetForm();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to save assignment.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (assignment) => {
    setEditingId(assignment.id);
    setForm({
      user_id: String(assignment.user_id),
      course_id: String(assignment.course_id),
      due_at: toDatetimeLocalValue(assignment.due_at),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (assignment) => {
    if (
      !confirm(
        `Remove assignment of "${assignment.course_title}" for ${assignment.user_name}?`,
      )
    ) {
      return;
    }

    setRowSaving(`delete-${assignment.id}`);
    try {
      await api.delete(`/assignments/${assignment.id}`);
      setAssignments((prev) =>
        prev.filter((item) => item.id !== assignment.id),
      );

      if (editingId === assignment.id) {
        resetForm();
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete assignment.");
    } finally {
      setRowSaving(null);
    }
  };

  const filteredAssignments = useMemo(() => {
    return assignments.filter((assignment) => {
      const matchesUser =
        filters.user_id === "all" ||
        String(assignment.user_id) === filters.user_id;

      const matchesCourse =
        filters.course_id === "all" ||
        String(assignment.course_id) === filters.course_id;

      const currentStatus =
        assignment.deadline_status || assignment.status || "assigned";
      const matchesStatus =
        filters.status === "all" || currentStatus === filters.status;

      return matchesUser && matchesCourse && matchesStatus;
    });
  }, [assignments, filters]);

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
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-semibold">Course Assignments</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Assign published courses to employees, set deadlines, and track
                on-time or late completion.
              </p>
            </div>
          </div>

          <Card>
            <CardContent className="pt-2 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">
                  {editingId ? "Edit Assignment" : "New Assignment"}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Pick an employee, select a course, and optionally set a due
                  date.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <Label>Employee</Label>
                  <Select
                    value={form.user_id}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, user_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className="max-h-[min(18rem,var(--radix-select-content-available-height))]"
                    >
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name} — {user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Course</Label>
                  <Select
                    value={form.course_id}
                    onValueChange={(value) =>
                      setForm((prev) => ({ ...prev, course_id: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select course" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className="max-h-[min(18rem,var(--radix-select-content-available-height))]"
                    >
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label>Deadline</Label>
                  <Input
                    type="datetime-local"
                    className="deadline-input [color-scheme:dark] [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    value={form.due_at}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, due_at: e.target.value }))
                    }
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSubmit} disabled={saving}>
                  {saving
                    ? editingId
                      ? "Saving…"
                      : "Assigning…"
                    : editingId
                      ? "Save Changes"
                      : "Assign Course"}
                </Button>

                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  {editingId ? "Cancel Edit" : "Clear"}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-2 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Assignments</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {filteredAssignments.length} shown · {assignments.length}{" "}
                    total
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <Select
                    value={filters.user_id}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, user_id: value }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All employees" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className="max-h-[min(18rem,var(--radix-select-content-available-height))]"
                    >
                      <SelectItem value="all">All employees</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                          {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.course_id}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, course_id: value }))
                    }
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="All courses" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className="max-h-[min(18rem,var(--radix-select-content-available-height))]"
                    >
                      <SelectItem value="all">All courses</SelectItem>
                      {courses.map((course) => (
                        <SelectItem key={course.id} value={String(course.id)}>
                          {course.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      setFilters((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="All statuses" />
                    </SelectTrigger>
                    <SelectContent
                      position="popper"
                      sideOffset={6}
                      className="max-h-[min(18rem,var(--radix-select-content-available-height))]"
                    >
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="completed_on_time">
                        Completed On Time
                      </SelectItem>
                      <SelectItem value="completed_late">
                        Completed Late
                      </SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <div className="grid grid-cols-12 gap-3 px-4 py-3 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  <span className="col-span-2">Employee</span>
                  <span className="col-span-2">Course</span>
                  <span className="col-span-2">Assigned By</span>
                  <span className="col-span-2">Due</span>
                  <span className="col-span-2">Completed</span>
                  <span className="col-span-1 text-center">Status</span>
                  <span className="col-span-1 text-right">Actions</span>
                </div>

                {filteredAssignments.length === 0 && (
                  <p className="px-4 py-6 text-sm text-muted-foreground">
                    No assignments found.
                  </p>
                )}

                {filteredAssignments.map((assignment, index) => (
                  <div
                    key={assignment.id}
                    className={`grid grid-cols-12 gap-3 px-4 py-4 items-center ${
                      index !== 0 ? "border-t" : ""
                    }`}
                  >
                    <div className="col-span-2 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.user_name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {assignment.user_email}
                      </p>
                    </div>

                    <div className="col-span-2 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {assignment.course_title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Assigned {formatDateTime(assignment.created_at)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm">
                        {assignment.assigned_by_name || "—"}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm whitespace-nowrap">
                        {formatDateTime(assignment.due_at)}
                      </p>
                    </div>

                    <div className="col-span-2">
                      <p className="text-sm whitespace-nowrap">
                        {formatDateTime(assignment.completed_at)}
                      </p>
                    </div>

                    <div className="col-span-1 flex justify-center">
                      <StatusBadge assignment={assignment} />
                    </div>

                    <div className="col-span-1 flex justify-end gap-1">
                      <IconActionButton
                        label="Edit assignment"
                        disabled={rowSaving === `delete-${assignment.id}`}
                        onClick={() => startEdit(assignment)}
                      >
                        <Pencil className="h-4 w-4" />
                      </IconActionButton>
                      <IconActionButton
                        label="Delete assignment"
                        className="text-destructive hover:text-destructive"
                        disabled={rowSaving === `delete-${assignment.id}`}
                        onClick={() => handleDelete(assignment)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </IconActionButton>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </TooltipProvider>
  );
}
