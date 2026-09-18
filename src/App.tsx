import { Suspense, useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { usePublicTheme } from "./hooks/usePublicTheme";
import { appRoutes } from "./routes/appRoutes";
import PwaLifecycle from "./components/pwa/PwaLifecycle";

const pageTitles: Record<string, string> = {
    // "/": "Welcome",
    "/": "Haircuts, Hair Styling & Grooming in Ja-Ela",
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

const pageDescriptions: Record<string, string> = {
    "/":
        "A-Line Salon in Ja-Ela offers professional haircuts, hair styling, beard trimming, hair colouring and facial services.",

    "/services":
        "Explore haircuts, hair styling, beard trimming, hair colouring and facial services available at A-Line Salon in Ja-Ela.",

    "/gallery":
        "View the latest hairstyles, grooming services and salon work from A-Line Salon in Ja-Ela.",

    "/book-appointment":
        "Book your next haircut, hair styling, beard trimming, hair colouring or facial appointment at A-Line Salon in Ja-Ela.",

    "/login":
        "Sign in to your A-Line Salon customer account to manage your appointments and bookings.",

    "/register":
        "Create an A-Line Salon customer account to book and manage your salon appointments.",

    "/appointments":
        "View and manage your appointments with A-Line Salon in Ja-Ela.",

    "/dashboard":
        "Manage your A-Line Salon customer account, bookings and appointments.",
};

const titleForPath = (pathname: string): string => {
    const normalizedPath = pathname === "/"
        ? pathname
        : pathname.replace(/\/+$/, "");
    return pageTitles[normalizedPath] ?? "Salon Management";
};

const descriptionForPath = (pathname: string): string => {
    const normalizedPath = pathname === "/"
        ? pathname
        : pathname.replace(/\/+$/, "");

    return pageDescriptions[normalizedPath]
        ?? "A-Line Salon in Ja-Ela offers professional haircuts, hair styling, beard trimming, hair colouring and facial services.";
};

function App() {
    const { brand, theme } = usePublicTheme();
    const [pathname, setPathname] = useState(appRoutes.state.location.pathname);

    useEffect(() => appRoutes.subscribe((state) => setPathname(state.location.pathname)), []);

    useEffect(() => {
        const salonName = brand.salonName.trim() || "Salon";
        document.title = `${titleForPath(pathname)} | ${salonName}`;

        const description = descriptionForPath(pathname);

        let metaDescription = document.querySelector<HTMLMetaElement>(
            'meta[name="description"]'
        );

        if (!metaDescription) {
            metaDescription = document.createElement("meta");
            metaDescription.name = "description";
            document.head.appendChild(metaDescription);
        }

        metaDescription.content = description;

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
