import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/publicLayout";
import AdminLoginPage from "../pages/admin/AdminLoginPage";

export const appRoutes = createBrowserRouter([
    {
        path: "/admin/login",
        element: <AdminLoginPage />,
    },
    {
        element: <PublicLayout />,
        children: [
            {
                index: true,
                element: <h2>Home Page</h2>
            }
        ]
    }
]);