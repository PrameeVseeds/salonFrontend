import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getCustomerProfile, logoutCustomer } from "../../services/customerAuthService";
import { hasCustomerToken } from "../../utils/customerToken";

const ProtectedCustomer = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "ready" | "guest">(hasCustomerToken() ? "loading" : "guest");
  useEffect(() => {
    if (!hasCustomerToken())
      return;

    getCustomerProfile().then(() => setState("ready")).catch(() => { logoutCustomer(); setState("guest"); });
  }, []);
  if (state === "guest")
    return <Navigate to={`/login?returnTo=${encodeURIComponent(`${location.pathname}${location.search}`)}`} replace />;

  if (state === "loading")
    return <main className="customer-dashboard-loading">
      <span />
    </main>;
  return children;
};

export default ProtectedCustomer;
