import { useState, type ReactNode } from "react";
import {
    CalendarDays,
    CircleUserRound,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    Sparkles,
    UserRoundCog,
    Users,
    X,
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
    const [isMenuOpen, setIsMenuOpen] = useState(false);
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
                <nav id="dashboard-navigation" className={isMenuOpen ? "is-open" : ""} aria-label="Admin navigation">
                    <NavLink to={dashboardPath} end title="Overview" onClick={() => setIsMenuOpen(false)}>
                        <LayoutDashboard aria-hidden="true" />
                        Overview
                    </NavLink>
                    <span className="dashboard-nav-label">Workspace</span>
                    <button type="button" disabled title="Appointments">
                        <CalendarDays aria-hidden="true" />
                        Appointments
                    </button>
                    <button type="button" disabled title="Customers">
                        <Users aria-hidden="true" />
                        Customers
                    </button>
                    <button type="button" disabled title="Services">
                        <Sparkles aria-hidden="true" />
                        Services
                    </button>
                    {user.role === "super_admin" && (
                        <NavLink to="/super-admin/admins" title="Administrators" onClick={() => setIsMenuOpen(false)}>
                            <UserRoundCog aria-hidden="true" />
                            Administrators
                        </NavLink>
                    )}
                    <NavLink to="/admin/profile" title="View profile" onClick={() => setIsMenuOpen(false)}>
                        <CircleUserRound aria-hidden="true" />
                        My profile
                    </NavLink>
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
            {isMenuOpen && <button className="dashboard-menu-backdrop" 
            type="button" aria-label="Close navigation" onClick={() => setIsMenuOpen(false)} />}

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
                    <button className="dashboard-topbar__identity" type="button" 
                    onClick={() => navigate("/admin/profile")} 
                    aria-label="View your profile" title="View profile">
                        <span className="dashboard-avatar">{initials}</span>
                        <div>
                            <strong>{user.firstName}</strong>
                            <small>{user.email}</small>
                        </div>
                    </button>
                </header>
                <main className="dashboard-content">{children}</main>
            </div>
        </div>
    );
};

export default DashboardShell;
