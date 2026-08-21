import { Eye, EyeOff, LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import CustomerAuthShell from "../../components/customer/CustomerAuthShell";
import { registerCustomer } from "../../services/customerAuthService";
import { getApiErrorMessage } from "../../utils/apiError";

const CustomerRegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: "", lastName: "", phone: "", email: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const update = (name: keyof typeof form, value: string) => setForm((current) => ({ ...current, [name]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }

    setBusy(true);
    try {
      await registerCustomer({
        ...form,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim()
      });
      navigate("/", { replace: true });
    }
    catch (requestError) {
      setError(getApiErrorMessage(
        requestError,
        "Unable to create your account."
      ));
    }
    finally {
      setBusy(false);
    }
  };

  return <CustomerAuthShell eyebrow="Join Salon"
    title="Create your account"
    description="A few details and you’ll be ready to book your next visit.">
    <form className="customer-auth_form" onSubmit={(event) => void submit(event)}>
      <div className="customer-auth_grid">
        <label>
          <span>First name</span>
          <div className="customer-auth_input">
            <UserRound />
            <input autoComplete="given-name" value={form.firstName}
              onChange={(e) => update("firstName", e.target.value)} required />
          </div>
        </label>
        <label>
          <span>Last name</span>
          <div className="customer-auth_input">
            <UserRound />
            <input autoComplete="family-name" value={form.lastName}
              onChange={(e) => update("lastName", e.target.value)} required />
          </div>
        </label>
      </div>
      <label>
        <span>Phone number</span>
        <div className="customer-auth_input">
          <Phone />
          <input type="tel" autoComplete="tel" value={form.phone}
            onChange={(e) => update("phone", e.target.value)} placeholder="Your contact number" required />
        </div>
      </label>
      <label>
        <span>Email address</span>
        <div className="customer-auth_input">
          <Mail />
          <input type="email" autoComplete="email" value={form.email}
            onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" required />
        </div>
      </label>
      <label>
        <span>Password</span>
        <div className="customer-auth_input">
          <LockKeyhole />
          <input type={showPassword ? "text" : "password"} minLength={8}
            autoComplete="new-password" value={form.password} onChange={(e) => update("password", e.target.value)} required />
          <button type="button" onClick={() =>
            setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>
            {showPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </label>
      <label>
        <span>Confirm password</span>
        <div className="customer-auth_input">
          <LockKeyhole />
          <input type={showConfirmPassword ? "text" : "password"} minLength={8}
            autoComplete="new-password" value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} required />
          <button type="button" onClick={() =>
            setShowConfirmPassword((value) => !value)} aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}>
            {showConfirmPassword ? <EyeOff /> : <Eye />}
          </button>
        </div>
      </label>
      {error &&
        <p className="customer-auth_message is-error" role="alert">{error}</p>}
      <button className="customer-auth_primary" disabled={busy}>{busy ? "Creating account..." : "Create account"}</button>
    </form>
    <p className="customer-auth_switch">Already have an account? <Link to="/">Sign in</Link></p>
  </CustomerAuthShell>;
};

export default CustomerRegisterPage;
