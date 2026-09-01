import type { RouteObject } from "react-router-dom";
import { lazy } from "react";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";
import type { AdminRole } from "../types/admin";

const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage"));
const AdminProfilePage = lazy(() => import("../pages/admin/AdminProfilePage"));
const EmployeeLeaveManagementPage = lazy(() => import("../pages/admin/EmployeeLeaveManagementPage"));
const EmployeeManagementPage = lazy(() => import("../pages/admin/EmployeeManagementPage"));
const EmployeeServiceAssignmentPage = lazy(() => import("../pages/admin/EmployeeServiceAssignmentPage"));
const SalonSettingsPage = lazy(() => import("../pages/admin/SalonSettingsPage"));
const ScheduleSettingsPage = lazy(() => import("../pages/admin/ScheduleSettingsPage"));
const ServiceManagementPage = lazy(() => import("../pages/admin/ServiceManagementPage"));
const ThemeSettingsPage = lazy(() => import("../pages/admin/ThemeSettingsPage"));
const WorkingHoursPage = lazy(() => import("../pages/admin/WorkingHoursPage"));
const GalleryManagementPage = lazy(() => import("../pages/admin/GalleryManagementPage"));
const AdminForgotPasswordPage = lazy(() => import("../pages/admin/AdminForgotPasswordPage"));
const AdminResetPasswordPage = lazy(() => import("../pages/admin/AdminResetPasswordPage"));
const AppointmentManagementPage = lazy(() => import("../pages/admin/AppointmentManagementPage"));
const CustomerManagementPage = lazy(() => import("../pages/admin/CustomerManagementPage"));
const TodayAppointmentsPage = lazy(() => import("../pages/admin/TodayAppointmentsPage"));

const sharedDashboardRoles: AdminRole[] = ["admin", "super_admin"];

export const adminRoutes: RouteObject[] = [
  { path: "/admin/login", element: <AdminLoginPage /> },
  { path: "/admin/forgot-password", element: <AdminForgotPasswordPage /> },
  { path: "/admin/reset-password", element: <AdminResetPasswordPage /> },
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedDashboard allowedRole="admin">
        {(user) => <AdminDashboardPage user={user} />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/profile",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {(user) => <AdminProfilePage user={user} />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/appointments",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <AppointmentManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/today-appointments",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles} withShell={false}>
        {() => <TodayAppointmentsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/customers",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <CustomerManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/gallery",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <GalleryManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/services",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <ServiceManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/employee-services",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <EmployeeServiceAssignmentPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/working-hours",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <WorkingHoursPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/employee-leaves",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <EmployeeLeaveManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/business-calendar",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <ScheduleSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/employees",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <EmployeeManagementPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/theme-settings",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <ThemeSettingsPage />}
      </ProtectedDashboard>
    ),
  },
  {
    path: "/admin/settings",
    element: (
      <ProtectedDashboard allowedRole={sharedDashboardRoles}>
        {() => <SalonSettingsPage />}
      </ProtectedDashboard>
    ),
  },
];
