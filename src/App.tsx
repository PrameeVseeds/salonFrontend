import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { usePublicTheme } from "./hooks/usePublicTheme";
import { appRoutes } from "./routes/appRoutes";
import PwaLifecycle from "./components/pwa/PwaLifecycle";

const pageTitles: Record<string, string> = {
    "/": "Welcome",
    "/login": "Customer Login",
    "/register": "Create Account",
    "/forgot-password": "Forgot Password",
    "/dashboard": "Home",
    "/services": "Services",
    "/gallery": "Gallery",
    "/appointments": "Appointments",
    "/book-appointment": "Book Appointment",
    "/admin/login": "Admin Login",
    "/admin/forgot-password": "Admin Forgot Password",
    "/admin/reset-password": "Admin Reset Password",
    "/admin/dashboard": "Admin Dashboard",
    "/admin/profile": "Admin Profile",
    "/admin/appointments": "Appointment Management",
    "/admin/today-appointments": "Today's Appointments",
    "/admin/customers": "Customer Management",
    "/admin/gallery": "Gallery Management",
    "/admin/services": "Service Management",
    "/admin/service-categories": "Service Categories",
    "/admin/employee-services": "Employee Service Assignments",
    "/admin/working-hours": "Working Hours",
    "/admin/employee-leaves": "Employee Leaves",
    "/admin/business-calendar": "Business Calendar",
    "/admin/employees": "Employee Management",
    "/admin/theme-settings": "Theme Settings",
    "/admin/settings": "Salon Settings",
    "/super-admin/dashboard": "Super Admin Dashboard",
    "/super-admin/admins": "Admin Management",
    "/super-admin/theme-settings": "Theme Settings",
    "/super-admin/settings": "Salon Settings",
};

const titleForPath = (pathname: string): string => {
    const normalizedPath = pathname === "/"
        ? pathname
        : pathname.replace(/\/+$/, "");
    return pageTitles[normalizedPath] ?? "Salon Management";
};

function App() {
    const { brand, theme } = usePublicTheme();
    const [pathname, setPathname] = useState(appRoutes.state.location.pathname);

    useEffect(() => appRoutes.subscribe((state) => setPathname(state.location.pathname)), []);

    useEffect(() => {
        const salonName = brand.salonName.trim() || "Salon";
        document.title = `${titleForPath(pathname)} | ${salonName}`;

        let favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
        if (!favicon) {
            favicon = document.createElement("link");
            favicon.rel = "icon";
            document.head.appendChild(favicon);
        }
        favicon.href = brand.logoUrl || "/pwa-icon-192.png";

        const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
        if (themeColor) themeColor.content = theme.secondaryColor;
    }, [brand.logoUrl, brand.salonName, pathname, theme.secondaryColor]);

    return <>
        <Suspense fallback={<div className="route-loading" role="status" aria-label="Loading page"><span /></div>}>
            <RouterProvider router={appRoutes} />
        </Suspense>
        <PwaLifecycle />
    </>;
}

export default App;
