import type { RouteObject } from "react-router-dom";
import ProtectedDashboard from "../components/admin/ProtectedDashboard";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import AdminLoginPage from "../pages/admin/AdminLoginPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import EmployeeLeaveManagementPage from "../pages/admin/EmployeeLeaveManagementPage";
import EmployeeManagementPage from "../pages/admin/EmployeeManagementPage";
import EmployeeServiceAssignmentPage from "../pages/admin/EmployeeServiceAssignmentPage";
import SalonSettingsPage from "../pages/admin/SalonSettingsPage";
import ScheduleSettingsPage from "../pages/admin/ScheduleSettingsPage";
import ServiceManagementPage from "../pages/admin/ServiceManagementPage";
import ThemeSettingsPage from "../pages/admin/ThemeSettingsPage";
import WorkingHoursPage from "../pages/admin/WorkingHoursPage";
import GalleryManagementPage from "../pages/admin/GalleryManagementPage";
import type { AdminRole } from "../types/admin";
import AdminForgotPasswordPage from "../pages/admin/AdminForgotPasswordPage";
import AdminResetPasswordPage from "../pages/admin/AdminResetPasswordPage";
import AppointmentManagementPage from "../pages/admin/AppointmentManagementPage";
import CustomerManagementPage from "../pages/admin/CustomerManagementPage";
import TodayAppointmentsPage from "../pages/admin/TodayAppointmentsPage";

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
