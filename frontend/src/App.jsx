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
import AcceptInvite from "./pages/AcceptInvite";
import { getToken, getUser } from "./api/auth";

function Protected({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function EmployeeOnly({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

function AdminOnly({ children }) {
  const token = getToken();
  const user = getUser();

  if (!token) return <Navigate to="/login" replace />;
  if (user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/accept-invite" element={<AcceptInvite />} />

        {/* Employee routes */}
        <Route
          path="/"
          element={
            <EmployeeOnly>
              <Dashboard />
            </EmployeeOnly>
          }
        />
        <Route
          path="/courses"
          element={
            <EmployeeOnly>
              <Courses />
            </EmployeeOnly>
          }
        />
        <Route
          path="/courses/:id"
          element={
            <EmployeeOnly>
              <CourseView />
            </EmployeeOnly>
          }
        />
        <Route
          path="/results"
          element={
            <EmployeeOnly>
              <Results />
            </EmployeeOnly>
          }
        />

        {/* Admin routes */}
        <Route
          path="/admin"
          element={
            <AdminOnly>
              <AdminDashboard />
            </AdminOnly>
          }
        />
        <Route
          path="/admin/team"
          element={
            <AdminOnly>
              <AdminTeamProgress />
            </AdminOnly>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminOnly>
              <AdminUsers />
            </AdminOnly>
          }
        />
        <Route
          path="/admin/content"
          element={
            <AdminOnly>
              <AdminContent />
            </AdminOnly>
          }
        />
        <Route
          path="/admin/courses/:id"
          element={
            <AdminOnly>
              <AdminCourseView />
            </AdminOnly>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
