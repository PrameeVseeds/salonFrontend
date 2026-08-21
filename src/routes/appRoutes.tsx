import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import CustomerLoginPage from "../pages/customer/CustomerLoginPage";
import CustomerRegisterPage from "../pages/customer/CustomerRegisterPage";
import CustomerForgotPasswordPage from "../pages/customer/CustomerForgotPasswordPage";

export const appRoutes = createBrowserRouter([
  ...adminRoutes,
  ...superAdminRoutes,
  { path: "/", element: <CustomerLoginPage /> },
  { path: "/register", element: <CustomerRegisterPage /> },
  { path: "/forgot-password", element: <CustomerForgotPasswordPage /> },
]);
