import { useEffect, useMemo, useState } from "react";
import Layout from "../components/Layout";
import api, { getUser } from "../api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function TabButton({ active, onClick, children, count }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-md text-sm transition-colors border ${
        active
          ? "bg-muted text-foreground border-border font-medium"
          : "text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/50"
      }`}
    >
      <span>{children}</span>
      {typeof count === "number" && (
        <span className="ml-2 text-xs text-muted-foreground">({count})</span>
      )}
    </button>
  );
}

export default function AdminUsers() {
  const currentUser = getUser();

  const [users, setUsers] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("active");
  const [saving, setSaving] = useState(null);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteSaving, setInviteSaving] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "employee",
  });

  const load = async () => {
    setLoading(true);
    try {
      const [usersRes, invitesRes] = await Promise.allSettled([
        api.get("/users"),
        api.get("/invites"),
      ]);

      if (usersRes.status === "fulfilled") {
        setUsers(usersRes.value.data);
      } else {
        setUsers([]);
      }

      if (invitesRes.status === "fulfilled") {
        setInvites(invitesRes.value.data);
      } else {
        setInvites([]);
      }

      if (usersRes.status === "rejected") {
        throw usersRes.reason;
      }

      if (invitesRes.status === "rejected") {
        alert(
          invitesRes.reason?.response?.data?.error ||
            "Active users loaded, but pending invites could not be fetched.",
        );
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

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

  const handleInvite = async () => {
    setInviteSaving(true);
    try {
      const { data } = await api.post("/invites", inviteForm);

      setInvites((prev) => [data.invite, ...prev]);
      setInviteForm({
        email: "",
        role: "employee",
      });
      setShowInviteForm(false);
      setActiveTab("pending");
    } catch (err) {
      alert(err.response?.data?.error || "Failed to send invite");
    } finally {
      setInviteSaving(false);
    }
  };

  const handleResend = async (inviteId) => {
    setSaving(`invite-resend-${inviteId}`);
    try {
      const { data } = await api.post(`/invites/${inviteId}/resend`);

      setInvites((prev) =>
        prev.map((invite) =>
          invite.id === inviteId
            ? { ...invite, expires_at: data.expires_at }
            : invite,
        ),
      );

      if (!data.email_sent) {
        alert("Invite was refreshed, but email could not be sent.");
      }
    } catch (err) {
      alert(err.response?.data?.error || "Failed to resend invite");
    } finally {
      setSaving(null);
    }
  };

  const handleRevoke = async (inviteId, email) => {
    if (!confirm(`Revoke invite for ${email}?`)) return;

    setSaving(`invite-revoke-${inviteId}`);
    try {
      await api.delete(`/invites/${inviteId}`);
      setInvites((prev) => prev.filter((invite) => invite.id !== inviteId));
    } catch (err) {
      alert(err.response?.data?.error || "Failed to revoke invite");
    } finally {
      setSaving(null);
    }
  };

  const employees = useMemo(
    () =>
      [...users]
        .filter((u) => u.role === "employee")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );
  const admins = useMemo(
    () =>
      [...users]
        .filter((u) => u.role === "admin")
        .sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  const sortedUsers = useMemo(
    () => [...users].sort((a, b) => a.name.localeCompare(b.name)),
    [users],
  );

  if (loading) {
    return (
      <Layout>
        <div className="p-8 text-muted-foreground">Loading…</div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">Users & Roles</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {users.length} total · {employees.length} employee
              {employees.length !== 1 ? "s" : ""} · {admins.length} admin
              {admins.length !== 1 ? "s" : ""}
            </p>
          </div>

          <Button onClick={() => setShowInviteForm((prev) => !prev)}>
            {showInviteForm ? "Close Invite Form" : "+ Invite User"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <TabButton
            active={activeTab === "active"}
            onClick={() => setActiveTab("active")}
            count={users.length}
          >
            Active Users
          </TabButton>
          <TabButton
            active={activeTab === "pending"}
            onClick={() => setActiveTab("pending")}
            count={invites.length}
          >
            Pending Invites
          </TabButton>
        </div>

        {showInviteForm && (
          <Card>
            <CardContent className="pt-2 space-y-4">
              <div>
                <h2 className="text-lg font-semibold">Invite New User</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Create a pending invite and optionally send the email now.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1 md:col-span-2">
                  <Label>Email address</Label>
                  <Input
                    type="email"
                    value={inviteForm.email}
                    onChange={(e) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                      }))
                    }
                    placeholder="new.user@skillforge.com"
                  />
                </div>

                <div className="space-y-1">
                  <Label>Role</Label>
                  <Select
                    value={inviteForm.role}
                    onValueChange={(value) =>
                      setInviteForm((prev) => ({
                        ...prev,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="employee">Employee</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleInvite} disabled={inviteSaving}>
                  {inviteSaving ? "Sending…" : "Send Invite"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowInviteForm(false);
                    setInviteForm({
                      email: "",
                      role: "employee",
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === "active" && (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="col-span-3">Name</span>
                <span className="col-span-3">Email</span>
                <span className="col-span-2">Role</span>
                <span className="col-span-2">Joined</span>
                <span className="col-span-2">Actions</span>
              </div>

              {users.length === 0 && (
                <p className="text-sm text-muted-foreground px-4 py-6">
                  No users found.
                </p>
              )}

              {sortedUsers.map((user, i) => {
                const isSelf = user.id === currentUser.id;

                return (
                  <div
                    key={user.id}
                    className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${
                      i !== 0 ? "border-t" : ""
                    }`}
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
                          <SelectTrigger className="h-8 text-xs w-28">
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
                          variant="destructive"
                          size="sm"
                          className="h-8 rounded-[var(--radius)] px-3 text-xs"
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
        )}

        {activeTab === "pending" && (
          <Card>
            <CardContent className="p-0">
              <div className="grid grid-cols-12 gap-3 px-4 py-2 border-b text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <span className="col-span-4">Email</span>
                <span className="col-span-2">Role</span>
                <span className="col-span-2">Invited By</span>
                <span className="col-span-2">Expires</span>
                <span className="col-span-2">Actions</span>
              </div>

              {invites.length === 0 && (
                <p className="text-sm text-muted-foreground px-4 py-6">
                  No pending invites.
                </p>
              )}

              {invites.map((invite, i) => (
                <div
                  key={invite.id}
                  className={`grid grid-cols-12 gap-3 px-4 py-3 items-center ${
                    i !== 0 ? "border-t" : ""
                  }`}
                >
                  <div className="col-span-4">
                    <p className="text-sm font-medium">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Sent {new Date(invite.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Badge variant="outline" className="capitalize">
                      {invite.role}
                    </Badge>
                  </div>

                  <span className="col-span-2 text-sm text-muted-foreground">
                    {invite.invited_by_name}
                  </span>

                  <span className="col-span-2 text-xs text-muted-foreground">
                    {new Date(invite.expires_at).toLocaleDateString()}
                  </span>

                  <div className="col-span-2 flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      disabled={saving === `invite-resend-${invite.id}`}
                      onClick={() => handleResend(invite.id)}
                    >
                      Resend
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive text-xs h-8"
                      disabled={saving === `invite-revoke-${invite.id}`}
                      onClick={() => handleRevoke(invite.id, invite.email)}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
