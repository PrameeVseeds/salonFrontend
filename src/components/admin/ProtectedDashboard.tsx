import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getAdminProfile } from "../../services/adminAuthService";
import type { Admin, AdminRole } from "../../types/admin";
import { removeAdminToken } from "../../utils/adminToken";
import { hasApiStatus } from "../../utils/apiError";
import DashboardShell from "./DashboardShell";

interface ProtectedDashboardProps {
    allowedRole: AdminRole | AdminRole[];
    children: (user: Admin) => ReactNode;
}

const ProtectedDashboard = ({
    allowedRole,
    children,
}: ProtectedDashboardProps) => {
    const [user, setUser] = useState<Admin | null>(null);
    const [status, setStatus] = useState<
        "loading" | "ready" | "unauthenticated" | "forbidden" | "error"
    >("loading");

    useEffect(() => {
        let active = true;

        getAdminProfile()
            .then(({ data }) => {
                if (!active) return;
                setUser(data.user);
                const hasAccess = Array.isArray(allowedRole)
                    ? allowedRole.includes(data.user.role)
                    : data.user.role === allowedRole;
                setStatus(hasAccess ? "ready" : "forbidden");
            })
            .catch((error: unknown) => {
                if (!active) return;
                if (hasApiStatus(error, 401)) {
                    removeAdminToken();
                    setStatus("unauthenticated");
                    return;
                }
                setStatus("error");
            });

        return () => {
            active = false;
        };
    }, [allowedRole]);

    if (status === "unauthenticated")
        return <Navigate to="/admin/login" replace />;
    if (status === "forbidden" && user) {
        return (
            <Navigate
                to={
                    user.role === "super_admin"
                        ? "/super-admin/dashboard"
                        : "/admin/dashboard"
                }
                replace
            />
        );
    }
    if (status === "loading")
        return (
            <main className="dashboard-state">
                <div className="dashboard-spinner" />
                <p>Loading your workspace...</p>
            </main>
        );
    if (status === "error" || !user)
        return (
            <main className="dashboard-state">
                <h1>Unable to load dashboard</h1>
                <p>Please refresh the page or try again later.</p>
            </main>
        );

    return <DashboardShell user={user}>{children(user)}</DashboardShell>;
};

export default ProtectedDashboard;
