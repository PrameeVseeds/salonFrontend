import { useState, type ReactNode } from "react";
import {
  CalendarDays,
  CalendarOff,
  CalendarClock,
  Clock3,
  Cog,
  LayoutDashboard,
  LogOut,
  Menu,
  Scissors,
  Settings2,
  Sparkles,
  Tags,
  ListChecks,
  Images,
  UserRoundCog,
  Users,
  UserRoundCheck,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../services/adminAuthService";
import type { Admin } from "../../types/admin";
import NotificationBell from "./notifications/NotificationBell";
import ConfirmDialog from "../common/ConfirmDialog";
import "./dashboard.css";

interface DashboardShellProps {
  user: Admin;
  children: ReactNode;
}

const DashboardShell = ({ user, children }: DashboardShellProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLogoutConfirmationOpen, setIsLogoutConfirmationOpen] =
    useState(false);
  const dashboardPath =
    user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard";
  const initials =
    `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

  const handleLogout = () => {
    setIsLogoutConfirmationOpen(false);
    logoutAdmin();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span>
            <Scissors />
          </span>
          <div>
            <strong>Salon</strong>
            <small>Management</small>
          </div>
        </div>
        <button
          className="dashboard-menu-toggle"
          type="button"
          aria-label={isMenuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={isMenuOpen}
          aria-controls="dashboard-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          {isMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          id="dashboard-navigation"
          className={isMenuOpen ? "is-open" : ""}
          aria-label="Admin navigation"
        >
          <NavLink
            to={dashboardPath}
            end
            title="Overview"
            onClick={() => setIsMenuOpen(false)}
          >
            <LayoutDashboard aria-hidden="true" />
            Overview
          </NavLink>
          <NavLink
            to="/admin/appointments"
            title="Appointments"
            onClick={() => setIsMenuOpen(false)}
          >
            <CalendarDays aria-hidden="true" />
            Appointments
          </NavLink>
          <NavLink
            to="/admin/today-appointments"
            title="Locked daily appointments screen"
            onClick={() => setIsMenuOpen(false)}
          >
            <CalendarClock aria-hidden="true" />
            Today screen
          </NavLink>
          <NavLink
            to="/admin/business-calendar"
            title="Business calendar"
            onClick={() => setIsMenuOpen(false)}
          >
            <CalendarOff aria-hidden="true" />
            Business calendar
          </NavLink>
          <NavLink
            to="/admin/working-hours"
            title="Working hours"
            onClick={() => setIsMenuOpen(false)}
          >
            <Clock3 aria-hidden="true" />
            Working hours
          </NavLink>
          <NavLink
            to="/admin/customers"
            title="Customers"
            onClick={() => setIsMenuOpen(false)}
          >
            <Users aria-hidden="true" />
            Customers
          </NavLink>
          <NavLink
            to="/admin/employees"
            title="Employees"
            onClick={() => setIsMenuOpen(false)}
          >
            <UserRoundCheck aria-hidden="true" />
            Employees
          </NavLink>
          <NavLink
            to="/admin/employee-leaves"
            title="Employee leaves"
            onClick={() => setIsMenuOpen(false)}
          >
            <CalendarClock aria-hidden="true" />
            Employee leaves
          </NavLink>
          <NavLink
            to="/admin/employee-services"
            title="Employee services"
            onClick={() => setIsMenuOpen(false)}
          >
            <ListChecks aria-hidden="true" />
            Employee services
          </NavLink>
          <NavLink
            to="/admin/service-categories"
            title="Service categories"
            onClick={() => setIsMenuOpen(false)}
          >
            <Tags aria-hidden="true" />
            Service categories
          </NavLink>
          <NavLink
            to="/admin/services"
            title="Services"
            onClick={() => setIsMenuOpen(false)}
          >
            <Sparkles aria-hidden="true" />
            Services
          </NavLink>
          <NavLink
            to="/admin/gallery"
            title="Gallery"
            onClick={() => setIsMenuOpen(false)}
          >
            <Images aria-hidden="true" />
            Gallery
          </NavLink>
          {user.role === "super_admin" && (
            <NavLink
              to="/super-admin/admins"
              title="Administrators"
              onClick={() => setIsMenuOpen(false)}
            >
              <UserRoundCog aria-hidden="true" />
              Administrators
            </NavLink>
          )}
          <NavLink
            to="/admin/settings"
            title="Salon settings"
            onClick={() => setIsMenuOpen(false)}
          >
            <Cog aria-hidden="true" />
            Salon settings
          </NavLink>
          <NavLink
            to="/admin/theme-settings"
            title="Theme settings"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings2 aria-hidden="true" />
            Theme settings
          </NavLink>
        </nav>
        <div className="dashboard-sidebar_user">
          <button
            className="dashboard-sidebar_profile"
            type="button"
            onClick={() => navigate("/admin/profile")}
            aria-label="View your profile"
            title="View profile"
          >
            <span className="dashboard-avatar">{initials}</span>
            <div>
              <strong>
                {user.firstName} {user.lastName}
              </strong>
              <small>
                {user.role === "super_admin" ? "Super admin" : "Administrator"}
              </small>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setIsLogoutConfirmationOpen(true)}
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut aria-hidden="true" />
          </button>
        </div>
      </aside>
      {isMenuOpen && (
        <button
          className="dashboard-menu-backdrop"
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      <div className="dashboard-main">
        <header className="dashboard-topbar">
          <div>
            <p>Salon Management System</p>
            <strong>
              {user.role === "super_admin"
                ? "Super Admin Portal"
                : "Admin Portal"}
            </strong>
          </div>
          <div className="dashboard-topbar_actions">
            <NotificationBell />
            <button
              className="dashboard-topbar_identity"
              type="button"
              onClick={() => navigate("/admin/profile")}
              aria-label="View your profile"
              title="View profile"
            >
              <span className="dashboard-avatar">{initials}</span>
              <div>
                <strong>{user.firstName}</strong>
                <small>{user.email}</small>
              </div>
            </button>
          </div>
        </header>
        <main className="dashboard-content">{children}</main>
      </div>
      <ConfirmDialog
        open={isLogoutConfirmationOpen}
        title="Sign out?"
        message="Are you sure you want to sign out of the Salon Management System?"
        confirmLabel="Sign out"
        onConfirm={handleLogout}
        onCancel={() => setIsLogoutConfirmationOpen(false)}
      />
    </div>
  );
};

export default DashboardShell;
