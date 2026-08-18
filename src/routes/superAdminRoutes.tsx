import type { RouteObject } from "react-router-dom";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";
import AdminManagementPage from "../pages/admin/AdminManagementPage";
import SalonSettingsPage from "../pages/admin/SalonSettingsPage";
import SuperAdminDashboardPage from "../pages/admin/SuperAdminDashboardPage";
import ThemeSettingsPage from "../pages/admin/ThemeSettingsPage";

export const superAdminRoutes: RouteObject[] = [
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
];
