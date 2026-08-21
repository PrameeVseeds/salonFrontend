import { KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import { forgotAdminPassword } from "../../services/adminAuthService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminPasswordPage.css";

const AdminForgotPasswordPage = () => {
  const location = useLocation();
  const email =
    typeof location.state === "object" &&
    location.state !== null &&
    "email" in location.state &&
    typeof location.state.email === "string"
      ? location.state.email.trim()
      : "";
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email)
      return setMessage({
        type: "error",
        text: "Return to login and enter your registered admin email first.",
      });

    setBusy(true);
    setMessage(null);
    try {
      const response = await forgotAdminPassword({ email });
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to request a password reset."),
      });
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="admin-password-page">
      <section>
        <span className="admin-password-icon">
          <KeyRound />
        </span>
        <header>
          <p>Salon management</p>
          <h1>Forgot password?</h1>
          <span>
            We will send a secure reset link to your registered email address.
          </span>
        </header>
        <form onSubmit={(event) => void submit(event)}>
          {email && (
            <p className="admin-password-destination">
              <Mail aria-hidden="true" />
              Reset instructions will be sent to the registered address.
            </p>
          )}
          {message && (
            <p className={`admin-password-message is-${message.type}`}>
              {message.text}
            </p>
          )}
        <button type="submit" disabled={busy || !email}>
            {busy ? "Sending..." : "Send reset link"}
          </button>
        </form>
      <Link to="/admin/login">Back to admin login</Link>
      </section>
    </main>
  );
};
export default AdminForgotPasswordPage;
