import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { getCustomerProfile, logoutCustomer } from "../../services/customerAuthService";
import { hasCustomerToken } from "../../utils/customerToken";

const ProtectedCustomer = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<"loading" | "ready" | "guest">(hasCustomerToken() ? "loading" : "guest");
  useEffect(() => {
    if (!hasCustomerToken())
      return;

    getCustomerProfile().then(() => setState("ready")).catch(() => { logoutCustomer(); setState("guest"); });
  }, []);
  if (state === "guest")
    return <Navigate to="/login" replace />;

  if (state === "loading")
    return <main className="customer-dashboard-loading">
      <span />
    </main>;
  return children;
};

export default ProtectedCustomer;
