import type { ReactNode } from "react";
import {
    CalendarDays,
    LayoutDashboard,
    LogOut,
    Scissors,
    Sparkles,
    UserRoundCog,
    Users,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { logoutAdmin } from "../../services/adminAuthService";
import type { Admin } from "../../types/admin";
import "./dashboard.css";

interface DashboardShellProps {
    user: Admin;
    children: ReactNode;
}

const DashboardShell = ({ user, children }: DashboardShellProps) => {
    const navigate = useNavigate();
    const dashboardPath =
        user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard";
    const initials =
        `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase();

    const handleLogout = () => {
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
                <nav aria-label="Admin navigation">
                    <NavLink to={dashboardPath} end>
                        <LayoutDashboard aria-hidden="true" />
                        Overview
                    </NavLink>
                    <span className="dashboard-nav-label">Workspace</span>
                    <button type="button" disabled>
                        <CalendarDays aria-hidden="true" />
                        Appointments
                    </button>
                    <button type="button" disabled>
                        <Users aria-hidden="true" />
                        Customers
                    </button>
                    <button type="button" disabled>
                        <Sparkles aria-hidden="true" />
                        Services
                    </button>
                    {user.role === "super_admin" && (
                        <button type="button" disabled>
                            <UserRoundCog aria-hidden="true" />
                            Administrators
                        </button>
                    )}
                </nav>
                <div className="dashboard-sidebar__user">
                    <span className="dashboard-avatar">{initials}</span>
                    <div>
                        <strong>
                            {user.firstName} {user.lastName}
                        </strong>
                        <small>
                            {user.role === "super_admin" ? "Super admin" : "Administrator"}
                        </small>
                    </div>
                    <button type="button" onClick={handleLogout} aria-label="Sign out">
                        <LogOut aria-hidden="true" />
                    </button>
                </div>
            </aside>

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
                    <div className="dashboard-topbar__identity">
                        <span className="dashboard-avatar">{initials}</span>
                        <div>
                            <strong>{user.firstName}</strong>
                            <small>{user.email}</small>
                        </div>
                    </div>
                </header>
                <main className="dashboard-content">{children}</main>
            </div>
        </div>
    );
};

export default DashboardShell;
