import { useState, type ReactNode } from "react";
import {
    CalendarDays,
    CalendarOff,
    Cog,
    LayoutDashboard,
    LogOut,
    Menu,
    Scissors,
    Settings2,
    Sparkles,
    UserRoundCog,
    Users,
    UserRoundCheck,
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
                    <NavLink to="/admin/business-calendar" title="Business calendar" onClick={() => setIsMenuOpen(false)}>
                        <CalendarOff aria-hidden="true" />
                        Business calendar
                    </NavLink>
                    <button type="button" disabled title="Customers">
                        <Users aria-hidden="true" />
                        Customers
                    </button>
                    <NavLink to="/admin/employees" title="Employees" onClick={() => setIsMenuOpen(false)}>
                        <UserRoundCheck aria-hidden="true" />
                        Employees
                    </NavLink>
                    <NavLink to="/admin/services" title="Services" onClick={() => setIsMenuOpen(false)}>
                        <Sparkles aria-hidden="true" />
                        Services
                    </NavLink>
                    {user.role === "super_admin" && (
                        <NavLink to="/super-admin/admins" title="Administrators" onClick={() => setIsMenuOpen(false)}>
                            <UserRoundCog aria-hidden="true" />
                            Administrators
                        </NavLink>
                    )}
                    <NavLink to="/admin/settings" title="Salon settings" onClick={() => setIsMenuOpen(false)}>
                        <Cog aria-hidden="true" />
                        Salon settings
                    </NavLink>
                    <NavLink to="/admin/theme-settings" title="Theme settings" onClick={() => setIsMenuOpen(false)}>
                        <Settings2 aria-hidden="true" />
                        Theme settings
                    </NavLink>
                </nav>
                <div className="dashboard-sidebar__user">
                    <button
                        className="dashboard-sidebar__profile"
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
