import { KeyRound, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { forgotAdminPassword } from "../../services/adminAuthService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminPasswordPage.css";

const AdminForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim())
      return setMessage({ type: "error", text: "Email address is required." });

    setBusy(true); setMessage(null);
    try {
      const response = await forgotAdminPassword({ email: email.trim() });
      setMessage({ type: "success", text: response.message });
    }
    catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to request a password reset.")
      });
    }
    finally { setBusy(false); }
  };
  return <main className="admin-password-page">
    <section>
      <span className="admin-password-icon">
        <KeyRound />
      </span>
      <header>
        <p>Salon management</p>
        <h1>Forgot password?</h1>
        <span>Enter your admin email and we will send a secure reset link.</span>
      </header>
      <form onSubmit={(event) => void submit(event)}>
        <label>
          <span>Email address</span>
          <div>
            <Mail />
            <input type="email" value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email" placeholder="admin@salon.com" />
          </div>
        </label>{message &&
          <p className={`admin-password-message is-${message.type}`}>
            {message.text}
          </p>}
        <button disabled={busy}>{busy ? "Sending..." : "Send reset link"}
        </button>
      </form>
      <Link to="/admin/login">Back to admin login</Link>
    </section>
  </main>;
};
export default AdminForgotPasswordPage;
