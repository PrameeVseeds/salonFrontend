import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";

const AdminManagementPage = lazy(() => import("../pages/admin/AdminManagementPage"));
const SalonSettingsPage = lazy(() => import("../pages/admin/SalonSettingsPage"));
const SuperAdminDashboardPage = lazy(() => import("../pages/admin/SuperAdminDashboardPage"));
const ThemeSettingsPage = lazy(() => import("../pages/admin/ThemeSettingsPage"));

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
