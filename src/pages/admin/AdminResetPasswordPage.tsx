import { KeyRound, LockKeyhole } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { resetOwnAdminPassword } from "../../services/adminAuthService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminPasswordPage.css";

const AdminResetPasswordPage = () => {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(
    token
      ? null
      : { type: "error", text: "The reset link is missing or invalid." },
  );

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (newPassword.length < 8)
      return setMessage({
        type: "error",
        text: "Password must contain at least 8 characters.",
      });

    if (newPassword !== confirmPassword)
      return setMessage({ type: "error", text: "Passwords do not match." });
    
    setBusy(true);
    setMessage(null);
    try {
      const response = await resetOwnAdminPassword({
        token,
        newPassword,
        confirmPassword,
      });
      setMessage({ type: "success", text: response.message });
    } catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to reset password."),
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
          <h1>Reset password</h1>
          <span>Choose a new password for your admin account.</span>
        </header>
        <form onSubmit={(event) => void submit(event)}>
          <label>
            <span>New password</span>
            <div>
              <LockKeyhole />
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
          </label>
          <label>
            <span>Confirm password</span>
            <div>
              <LockKeyhole />
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                autoComplete="new-password"
              />
            </div>
          </label>
          {message && (
            <p className={`admin-password-message is-${message.type}`}>
              {message.text}
            </p>
          )}
          <button disabled={busy || !token}>
            {busy ? "Resetting..." : "Reset password"}
          </button>
        </form>
        <Link to="/admin/login">Back to admin login</Link>
      </section>
    </main>
  );
};
export default AdminResetPasswordPage;
