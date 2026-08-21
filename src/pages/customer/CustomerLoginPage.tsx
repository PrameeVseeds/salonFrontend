import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerAuthShell from "../../components/customer/CustomerAuthShell";
import { loginCustomer } from "../../services/customerAuthService";
import { getApiErrorMessage } from "../../utils/apiError";

const CustomerLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await loginCustomer({ email: email.trim(), password });
      navigate("/", { replace: true });

    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Unable to sign in."));

    } finally {
      setBusy(false);
    }
  };

  return (
    <CustomerAuthShell
      eyebrow="Welcome back"
      title="Sign in to your account"
      description="Manage appointments and keep your salon visits in one place."
    >
      <form
        className="customer-auth_form"
        onSubmit={(event) => void submit(event)}
      >
        <label>
          <span>Email address</span>
          <div className="customer-auth_input">
            <Mail />
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
        </label>
        <label>
          <span>Password</span>
          <div className="customer-auth_input">
            <LockKeyhole />
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </label>
        <div className="customer-auth_form-row">
          <span />
          <Link to="/forgot-password" state={{ email: email.trim() }}>
            Forgot password?
          </Link>
        </div>
        {error && (
          <p className="customer-auth_message is-error" role="alert">
            {error}
          </p>
        )}
        <button className="customer-auth_primary" disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
      <p className="customer-auth_switch">
        New to Salon? 
        <Link to="/register">Create an account</Link>
      </p>
    </CustomerAuthShell>
  );
};

export default CustomerLoginPage;
