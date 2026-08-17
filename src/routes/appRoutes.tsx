import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/publicLayout";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import SuperAdminDashboardPage from "../pages/admin/SuperAdminDashboardPage";
import AdminManagementPage from "../pages/admin/AdminManagementPage";

export const appRoutes = createBrowserRouter([
  {
    path: "/admin/login",
    element: <AdminLoginPage />,
  },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedDashboard allowedRole="admin">
        {(user) => <AdminDashboardPage user={user} />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/super-admin/dashboard",
    element: (
      <ProtectedDashboard allowedRole="super_admin">
        {(user) => <SuperAdminDashboardPage user={user} />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/super-admin/admins",
    element: (
      <ProtectedDashboard allowedRole="super_admin">
        {() => <AdminManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <h2>Home Page</h2>,
      },
    ],
  },
]);
