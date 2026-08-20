import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import FormField from "../../components/form/FormField";
import {EyeIcon,EyeOffIcon,LockIcon,SignInIcon,UserIcon} from "../../components/icons/AuthIcons";
import { loginAdmin } from "../../services/adminAuthService";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminLoginPage.css";

const getErrorMessage = (error: unknown) =>
    getApiErrorMessage(error, "Unable to connect to the server. Please try again.");

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [rememberMe, setRememberMe] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState<{
        type: "error" | "success";
        text: string;
    } | null>(null);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setMessage(null);
        setIsSubmitting(true);

        try {
            const result = await loginAdmin(
                { email: email.trim(), password },
                rememberMe,
            );
            setMessage({
                type: "success",
                text: `Welcome back, ${result.data.user.name}.`,
            });
            navigate(result.data.user.role === "super_admin" ? "/super-admin/dashboard" : "/admin/dashboard", { replace: true });
        } catch (error) {
            setMessage({ type: "error", text: getErrorMessage(error) });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="admin-login-page">
            <section className="admin-login-card" aria-labelledby="admin-login-title">
                <div className="admin-login-card_badge">
                    <LockIcon />
                </div>
                <header className="admin-login-card_header">
                    <p className="admin-login-card_eyebrow">Salon management</p>
                    <h1 id="admin-login-title">Admin Login</h1>
                    <p>Enter your credentials to access the admin panel</p>
                </header>

                <form className="admin-login-form" onSubmit={handleSubmit}>
                    <FormField
                        id="admin-email"
                        label="Email"
                        icon={<UserIcon />}
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="Enter your email"
                        autoComplete="email"
                        required
                    />
                    <FormField
                        id="admin-password"
                        label="Password"
                        icon={<LockIcon />}
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="Enter your password"
                        autoComplete="current-password"
                        required
                        endAdornment={
                            <button
                                className="password-toggle"
                                type="button"
                                onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                            </button>
                        }
                    />

                    <label className="remember-option">
                        <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(event) => setRememberMe(event.target.checked)}
                        />
                        <span>Remember me</span>
                    </label>

                    {message && (
                        <p
                            className={`login-message login-message--${message.type}`}
                            role={message.type === "error" ? "alert" : "status"}
                        >
                            {message.text}
                        </p>
                    )}

                    <button
                        className="admin-login-button"
                        type="submit"
                        disabled={isSubmitting}
                    >
                        <SignInIcon />
                        <span>{isSubmitting ? "Signing in…" : "Sign in"}</span>
                    </button>
                </form>

                <p className="admin-login-card_help">
                    Need help?{" "}
                    <a href="mailto:dithmiprameesha@gmail.com">
                        Contact your system administrator
                    </a>
                </p>
            </section>
        </main>
    );
};

export default AdminLoginPage;
