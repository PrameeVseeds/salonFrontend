import { createBrowserRouter } from "react-router-dom";
import { adminRoutes } from "./adminRoutes";
import { superAdminRoutes } from "./superAdminRoutes";
import CustomerLoginPage from "../pages/customer/CustomerLoginPage";
import CustomerRegisterPage from "../pages/customer/CustomerRegisterPage";
import CustomerForgotPasswordPage from "../pages/customer/CustomerForgotPasswordPage";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import ProtectedCustomer from "../components/customer/ProtectedCustomer";
import CustomerServicesPage from "../pages/customer/CustomerServicesPage";
import CustomerGalleryPage from "../pages/customer/CustomerGalleryPage";
import CustomerAppointmentsPage from "../pages/customer/CustomerAppointmentsPage";

export const appRoutes = createBrowserRouter([
  ...adminRoutes,
  ...superAdminRoutes,
  { path: "/", element: <CustomerLoginPage /> },
  { path: "/register", element: <CustomerRegisterPage /> },
  { path: "/forgot-password", element: <CustomerForgotPasswordPage /> },
  { path: "/dashboard", element: <ProtectedCustomer><CustomerDashboardPage /></ProtectedCustomer> },
  { path: "/services", element: <ProtectedCustomer><CustomerServicesPage /></ProtectedCustomer> },
  { path: "/gallery", element: <ProtectedCustomer><CustomerGalleryPage /></ProtectedCustomer> },
  { path: "/appointments", element: <ProtectedCustomer><CustomerAppointmentsPage /></ProtectedCustomer> },
  { path: "/book-appointment", element: <ProtectedCustomer><CustomerAppointmentsPage /></ProtectedCustomer> },
]);
