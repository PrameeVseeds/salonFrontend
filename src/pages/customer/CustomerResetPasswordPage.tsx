import { LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CustomerAuthShell from "../../components/customer/CustomerAuthShell";
import { resetCustomerPassword } from "../../services/customerAuthService";
import { getApiErrorMessage } from "../../utils/apiError";

const CustomerResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(
    token ? null : { type: "error", text: "The reset link is missing or invalid." },
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8) {
      setMessage({ type: "error", text: "Password must contain at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "Passwords do not match." });
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      const response = await resetCustomerPassword({ token, newPassword, confirmPassword });
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({ type: "error", text: getApiErrorMessage(error, "Unable to reset password.") });
    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomerAuthShell
      eyebrow="Account recovery"
      title="Reset your password"
      description="Choose a new password for your customer account."
    >
      <form className="customer-auth_form" onSubmit={(event) => void submit(event)}>
        <label>
          <span>New password</span>
          <div className="customer-auth_input">
            <LockKeyhole aria-hidden="true" />
            <input type="password" autoComplete="new-password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} required minLength={8} />
          </div>
        </label>
        <label>
          <span>Confirm new password</span>
          <div className="customer-auth_input">
            <LockKeyhole aria-hidden="true" />
            <input type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} />
          </div>
        </label>
        {message && <p className={`customer-auth_message is-${message.type}`} role={message.type === "error" ? "alert" : "status"}>{message.text}</p>}
        <button className="customer-auth_primary" disabled={busy || !token}>{busy ? "Resetting..." : "Reset password"}</button>
      </form>
      <p className="customer-auth_switch"><Link to="/login">Back to sign in</Link></p>
    </CustomerAuthShell>
  );
};

export default CustomerResetPasswordPage;
