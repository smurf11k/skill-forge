import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const normalize = (value) =>
  String(value ?? "")
    .toLowerCase()
    .trim();

export default function AdminUsers() {
  const currentUser = getUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const load = () =>
    api
      .get("/users")
      .then((r) => setUsers(r.data))
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setSaving(userId);
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      );
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update role");
    } finally {
      setSaving(null);
    }
  };

  const handleDelete = async (userId, name) => {
    if (!confirm(`Delete user ${name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/users/${userId}`);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const filteredUsers = useMemo(() => {
    const q = normalize(searchTerm);
    if (!q) return users;

    return users.filter((user) =>
      [user.name, user.email, user.role].some((field) =>
        normalize(field).includes(q),
      ),
    );
  }, [users, searchTerm]);

  if (loading)
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );

  const employees = filteredUsers.filter((u) => u.role === "employee");
  const admins = filteredUsers.filter((u) => u.role === "admin");

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Users & Roles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {filteredUsers.length} shown · {employees.length} employee
              {employees.length !== 1 ? "s" : ""} · {admins.length} admin
              {admins.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-64"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
              <span className="col-span-3">Name</span>
              <span className="col-span-3">Email</span>
              <span className="col-span-2">Role</span>
              <span className="col-span-2">Joined</span>
              <span className="col-span-2">Actions</span>
            </div>

            {filteredUsers.length === 0 && (
              <p className="text-sm text-muted-foreground px-4 py-6">
                No users found.
              </p>
            )}

            {filteredUsers.map((user, i) => {
              const isSelf = user.id === currentUser.id;
              return (
                <div
                  key={user.id}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${i !== 0 ? "border-t" : ""}`}
                >
                  <div className="col-span-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    {isSelf && (
                      <span className="text-xs text-muted-foreground">
                        (you)
                      </span>
                    )}
                  </div>

                  <span className="col-span-3 text-sm text-muted-foreground truncate">
                    {user.email}
                  </span>

                  <div className="col-span-2">
                    {isSelf ? (
                      <Badge variant="outline" className="text-xs capitalize">
                        {user.role}
                      </Badge>
                    ) : (
                      <Select
                        value={user.role}
                        onValueChange={(v) => handleRoleChange(user.id, v)}
                        disabled={saving === user.id}
                      >
                        <SelectTrigger className="h-7 text-xs w-28">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="employee">Employee</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  </div>

                  <span className="col-span-2 text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString()}
                  </span>

                  <div className="col-span-2">
                    {!isSelf && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive text-xs h-7"
                        onClick={() => handleDelete(user.id, user.name)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
