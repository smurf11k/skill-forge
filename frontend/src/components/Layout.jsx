import { NavLink, useNavigate } from "react-router-dom";
import { clearAuth, getUser } from "../api/auth";
import api from "../api/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();
  const isAdmin = user?.role === "admin";

  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch {}
    clearAuth();
    navigate("/login");
  };

  const employeeLinks = [
    ["/", "Dashboard"],
    ["/courses", "Courses"],
    ["/results", "My Progress"],
  ];

  const adminLinks = [
    ["/admin", "Dashboard"],
    ["/admin/team", "Team Progress"],
    ["/admin/users", "Users"],
    ["/admin/content", "Manage Content"],
    //["/results", "My Progress"],
  ];

  const links = isAdmin ? adminLinks : employeeLinks;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b sticky top-0 z-50 bg-background">
        <div className="px-6 h-14 flex items-center gap-4">
          <span className="font-semibold text-sm">SkillForge</span>
          <Separator orientation="vertical" className="h-4" />
          <nav className="flex gap-1">
            {links.map(([to, label]) => (
              <NavLink
                key={to + label}
                to={to}
                end={to === "/" || to === "/admin"}
                className={({ isActive }) =>
                  `px-3 py-1.5 rounded text-sm transition-colors ${
                    isActive
                      ? "bg-muted font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Badge variant="outline" className="text-xs capitalize">
              {user?.role}
            </Badge>
            <span className="text-sm text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
