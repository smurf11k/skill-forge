export const ROUTES = {
  login: "/login",
  acceptInvite: "/accept-invite",

  employee: {
    dashboard: "/",
    courses: "/courses",
    courseView: "/courses/:id",
    results: "/results",
  },

  admin: {
    dashboard: "/admin",
    team: "/admin/team",
    users: "/admin/users",
    content: "/admin/content",
    courseView: "/admin/courses/:id",
    assignments: "/admin/assignments",
  },
};

export const EMPLOYEE_NAV_LINKS = [
  [ROUTES.employee.dashboard, "Dashboard"],
  [ROUTES.employee.courses, "Courses"],
  [ROUTES.employee.results, "My Progress"],
];

export const ADMIN_NAV_LINKS = [
  [ROUTES.admin.dashboard, "Dashboard"],
  [ROUTES.admin.team, "Team Progress"],
  [ROUTES.admin.users, "Users & Roles"],
  [ROUTES.admin.content, "Manage Content"],
  [ROUTES.admin.assignments, "Assignments"],
];

export function getHomeRouteByRole(role) {
  return role === "admin" ? ROUTES.admin.dashboard : ROUTES.employee.dashboard;
}
