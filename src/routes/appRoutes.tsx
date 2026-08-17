import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/publicLayout";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import SuperAdminDashboardPage from "../pages/admin/SuperAdminDashboardPage";
import AdminManagementPage from "../pages/admin/AdminManagementPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import ServiceManagementPage from "../pages/admin/ServiceManagementPage";
import ThemeSettingsPage from "../pages/admin/ThemeSettingsPage";
import SalonSettingsPage from "../pages/admin/SalonSettingsPage";
import EmployeeManagementPage from "../pages/admin/EmployeeManagementPage";
import ScheduleSettingsPage from "../pages/admin/ScheduleSettingsPage";
import EmployeeLeaveManagementPage from "../pages/admin/EmployeeLeaveManagementPage";

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
    path: "/admin/profile",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {(user) => <AdminProfilePage user={user} />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/services",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <ServiceManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/employee-leaves",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <EmployeeLeaveManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/business-calendar",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <ScheduleSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/employees",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <EmployeeManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/theme-settings",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <ThemeSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedDashboard allowedRole={["admin", "super_admin"]}>
        {() => <SalonSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/super-admin/theme-settings",
    element: (
      <ProtectedDashboard allowedRole="super_admin">
        {() => <ThemeSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/super-admin/settings",
    element: (
      <ProtectedDashboard allowedRole="super_admin">
        {() => <SalonSettingsPage />}
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
