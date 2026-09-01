import { createBrowserRouter } from "react-router-dom";
import { lazy } from "react";
import { adminRoutes } from "./adminRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import ProtectedCustomer from "../components/customer/ProtectedCustomer";

const CustomerLoginPage = lazy(() => import("../pages/customer/CustomerLoginPage"));
const CustomerRegisterPage = lazy(() => import("../pages/customer/CustomerRegisterPage"));
const CustomerForgotPasswordPage = lazy(() => import("../pages/customer/CustomerForgotPasswordPage"));
const CustomerWelcomePage = lazy(() => import("../pages/customer/CustomerWelcomePage"));
const CustomerDashboardPage = lazy(() => import("../pages/customer/CustomerDashboardPage"));
const CustomerServicesPage = lazy(() => import("../pages/customer/CustomerServicesPage"));
const CustomerGalleryPage = lazy(() => import("../pages/customer/CustomerGalleryPage"));
const CustomerAppointmentsPage = lazy(() => import("../pages/customer/CustomerAppointmentsPage"));

export const appRoutes = createBrowserRouter([
  ...adminRoutes,
  ...superAdminRoutes,
  { path: "/", element: <CustomerWelcomePage /> },
  { path: "/login", element: <CustomerLoginPage /> },
  { path: "/register", element: <CustomerRegisterPage /> },
  { path: "/forgot-password", element: <CustomerForgotPasswordPage /> },
  { path: "/dashboard", element: <ProtectedCustomer><CustomerDashboardPage /></ProtectedCustomer> },
  { path: "/services", element: <ProtectedCustomer><CustomerServicesPage /></ProtectedCustomer> },
  { path: "/gallery", element: <ProtectedCustomer><CustomerGalleryPage /></ProtectedCustomer> },
  { path: "/appointments", element: <ProtectedCustomer><CustomerAppointmentsPage /></ProtectedCustomer> },
  { path: "/book-appointment", element: <ProtectedCustomer><CustomerAppointmentsPage /></ProtectedCustomer> },
]);
