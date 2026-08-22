import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import CustomerAuthShell from "../../components/customer/CustomerAuthShell";
import { forgotCustomerPassword } from "../../services/customerAuthService";
import { getApiErrorMessage } from "../../utils/apiError";

const CustomerForgotPasswordPage = () => {
  const location = useLocation();
  const email = typeof location.state === "object" && location.state !== null && "email" in location.state && typeof location.state.email === "string" ? location.state.email.trim() : "";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email) return;
    setBusy(true); setMessage(null);

    try {
      const response = await forgotCustomerPassword({ email });
      setMessage({ type: "success", text: response.message });
    }
    catch (requestError) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(requestError, "Unable to send reset instructions.")
      });
    }
    finally {
      setBusy(false);
    }
  };

  return <CustomerAuthShell eyebrow="Account recovery"
    title="Forgot your password?"
    description="Enter your registered email and we’ll send you secure reset instructions.">

    <form className="customer-auth_form" onSubmit={(event) => void submit(event)}>
      {message &&
        <p className={`customer-auth_message is-${message.type}`} role="status">{message.text}</p>}
      <button className="customer-auth_primary" disabled={busy || !email}>{busy ? "Sending..." : "Send reset instructions"}</button>
    </form>
    <p className="customer-auth_switch">{email ?
      <Link to="/">Back to sign in</Link> : <>Enter your email on the
        <Link to="/">login page</Link>
        first.</>}</p>
  </CustomerAuthShell>;
};

export default CustomerForgotPasswordPage;
