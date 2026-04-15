import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { useCourseProgress } from "../hooks/useCourseProgress";
import { StatusBadge } from "../components/StatusBadge";
import { EmployeeCourseCard } from "../components/EmployeeCourseCard";
import CourseMetaLine from "../components/course/CourseMetaLine";
import PageLoader from "../components/common/PageLoader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const EMPTY = { title: "", description: "" };

export default function Courses() {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user.role === "admin";
  const { courses, loading } = useCourseProgress();

  // Employee filter
  const [filter, setFilter] = useState("all");

  // Admin form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditingId(null);
    setForm(EMPTY);
    setShowForm(true);
  };
  const openEdit = (course, e) => {
    e.stopPropagation();
    setEditingId(course.id);
    setForm({ title: course.title, description: course.description || "" });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) await api.put(`/courses/${editingId}`, form);
      else await api.post("/courses", form);
      setShowForm(false);
      setEditingId(null);
      setForm(EMPTY);
      window.location.reload();
    } catch (error) {
      console.error("Failed to save course", error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm("Delete this course and all its content?")) return;
    await api.delete(`/courses/${id}`);
    window.location.reload();
  };

  if (loading) return <PageLoader />;

  const filtered = isAdmin
    ? courses
    : filter === "all"
      ? courses
      : courses.filter((c) => c.status === filter);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold">
              {isAdmin ? "Manage Courses" : "Courses"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isAdmin
                ? `${courses.length} course${courses.length !== 1 ? "s" : ""}`
                : `${courses.filter((c) => c.isCompleted).length} of ${courses.length} completed`}
            </p>
          </div>
          {isAdmin ? (
            <Button
              onClick={
                showForm && !editingId ? () => setShowForm(false) : openNew
              }
              variant={showForm && !editingId ? "outline" : "default"}
            >
              {showForm && !editingId ? "Cancel" : "+ New Course"}
            </Button>
          ) : (
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Admin create/edit form */}
        {showForm && isAdmin && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base text-left">
                {editingId ? "Edit Course" : "New Course"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="space-y-1">
                  <Label>Title</Label>
                  <Input
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={saving}>
                    {saving ? "Saving…" : editingId ? "Update" : "Create"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingId(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Course grid */}
        <div className="grid grid-cols-3 gap-4">
          {filtered.map((course) =>
            isAdmin ? (
              <Card
                key={course.id}
                className="cursor-pointer hover:border-foreground/20 transition-colors flex flex-col"
                onClick={() => navigate(`/courses/${course.id}`)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-sm leading-snug">
                      {course.title}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="flex flex-col gap-3 flex-1">
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {course.description || "No description."}
                  </p>

                  {/* Lesson + quiz count */}
                  <div className="space-y-1">
                    <CourseMetaLine
                      lessons={course.totalLessons}
                      quizzes={course.totalQuizzes}
                      className="text-xs text-muted-foreground"
                    />
                  </div>

                  {/* Admin: view / edit / delete */}
                  <div
                    className="flex gap-2 mt-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => navigate(`/courses/${course.id}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => openEdit(course, e)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={(e) => handleDelete(course.id, e)}
                    >
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <EmployeeCourseCard
                key={course.id}
                course={course}
                navigate={navigate}
              />
            ),
          )}
        </div>

        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">
            {isAdmin
              ? "No courses yet. Create one above."
              : "No courses match this filter."}
          </p>
        )}
      </div>
    </Layout>
  );
}
