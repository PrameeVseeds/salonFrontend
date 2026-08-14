import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/publicLayout";

export const appRoutes = createBrowserRouter([
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