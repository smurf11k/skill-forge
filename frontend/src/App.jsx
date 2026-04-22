import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import CourseView from "./pages/CourseView";
import AdminCourseView from "./pages/AdminCourseView";
import Results from "./pages/Results";
import AdminDashboard from "./pages/AdminDashboard";
import AdminTeamProgress from "./pages/AdminTeamProgress";
import AdminUsers from "./pages/AdminUsers";
import AdminContent from "./pages/AdminContent";
import AdminAssignments from "./pages/AdminAssignments";
import AcceptInvite from "./pages/AcceptInvite";
import { getToken, getUser } from "./api/auth";
import { ROUTES } from "./constants/routes";

function Protected({ children }) {
  return getToken() ? children : <Navigate to={ROUTES.login} replace />;
}

function EmployeeOnly({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to={ROUTES.login} replace />;
  if (user?.role === "admin") return <Navigate to={ROUTES.admin.dashboard} replace />;

  return children;
}

function AdminOnly({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to={ROUTES.login} replace />;
  if (user?.role !== "admin") return <Navigate to={ROUTES.employee.dashboard} replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<Login />} />

        <Route path={ROUTES.acceptInvite} element={<AcceptInvite />} />

        {/* Employee routes */}
        <Route
          path={ROUTES.employee.dashboard}
          element={
            <EmployeeOnly>
              <Dashboard />
            </EmployeeOnly>
          }
        />
        <Route
          path={ROUTES.employee.courses}
          element={
            <EmployeeOnly>
              <Courses />
            </EmployeeOnly>
          }
        />
        <Route
          path={ROUTES.employee.courseView}
          element={
            <EmployeeOnly>
              <CourseView />
            </EmployeeOnly>
          }
        />
        <Route
          path={ROUTES.employee.results}
          element={
            <EmployeeOnly>
              <Results />
            </EmployeeOnly>
          }
        />

        {/* Admin routes */}
        <Route
          path={ROUTES.admin.dashboard}
          element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          }
        />
        <Route
          path={ROUTES.admin.team}
          element={
            <AdminOnly>
              <AdminTeamProgress />
            </AdminOnly>
          }
        />
        <Route
          path={ROUTES.admin.users}
          element={
            <AdminOnly>
              <AdminUsers />
            </AdminOnly>
          }
        />
        <Route
          path={ROUTES.admin.content}
          element={
            <AdminOnly>
              <AdminContent />
            </AdminOnly>
          }
        />
        <Route
          path={ROUTES.admin.courseView}
          element={
            <AdminOnly>
              <AdminCourseView />
            </AdminOnly>
          }
        />
        <Route
          path={ROUTES.admin.assignments}
          element={
            <AdminOnly>
              <AdminAssignments />
            </AdminOnly>
          }
        />

        <Route path="*" element={<Navigate to={ROUTES.employee.dashboard} replace />} />
      </Routes>
    </BrowserRouter>
  );
}
