import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../layouts/publicLayout";
import { adminRoutes } from "./adminRoutes";
import { superAdminRoutes } from "./superAdminRoutes";

export const appRoutes = createBrowserRouter([
  ...adminRoutes,
  ...superAdminRoutes,
  {
    element: <PublicLayout />,
    children: [
      {
        index: true,
        element: <h2>Home Page</h2>,
      },
    ],
  },
]);
