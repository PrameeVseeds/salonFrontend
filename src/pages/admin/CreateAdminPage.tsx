import axios from "axios";
import { Eye, EyeOff, LockKeyhole, Mail, UserPlus, UserRound } from "lucide-react";
import { useState, type FormEvent } from "react";
import { createAdmin } from "../../services/adminService";
import type { Admin } from "../../types/admin";
import "./createAdminPage.css";

const getErrorMessage = (error: unknown): string => {
    if (axios.isAxiosError<{ message?: string }>(error)) {
        return error.response?.data?.message ?? "Unable to create the admin account.";
    }
    return "Something went wrong. Please try again.";
};

const CreateAdminPage = () => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [createdAdmin, setCreatedAdmin] = useState<Admin | null>(null);
    const [error, setError] = useState<string | null>(null);

    const resetForm = () => {
        setFirstName("");
        setLastName("");
        setEmail("");
        setPassword("");
        setConfirmPassword("");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setCreatedAdmin(null);

        if (password.length < 8) {
            setError("Password must contain at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await createAdmin({
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
                password,
            });
            if (!response.data)
                throw new Error("Admin account was not returned by the server.");

            setCreatedAdmin(response.data);
            resetForm();
        } catch (requestError) {
            setError(getErrorMessage(requestError));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="create-admin-page">
            <header className="create-admin-heading">
                <div>
                    <p className="dashboard-eyebrow">
                        Administrator access
                    </p>
                    <h1>Register new admin</h1>
                    <p>Create an account for a trusted member of the salon management team.</p>
                </div>
                <span>
                    <UserPlus aria-hidden="true" />
                </span>
            </header>

            <section className="create-admin-panel" aria-labelledby="admin-details-title">
                <div className="create-admin-panel__header">
                    <h2 id="admin-details-title">Account details</h2>
                    <p>All fields are required. The new account will be active immediately.</p>
                </div>

                <form className="create-admin-form" onSubmit={handleSubmit}>
                    <label>
                        <span>First name</span>
                        <div>
                            <UserRound aria-hidden="true" />
                            <input value={firstName} onChange={(event) => setFirstName(event.target.value)}
                                autoComplete="given-name" placeholder="Enter first name" required />
                        </div>
                    </label>
                    <label>
                        <span>Last name</span>
                        <div>
                            <UserRound aria-hidden="true" />
                            <input value={lastName} onChange={(event) => setLastName(event.target.value)}
                                autoComplete="family-name" placeholder="Enter last name" required />
                        </div>
                    </label>
                    <label className="create-admin-form__wide">
                        <span>Email address</span>
                        <div>
                            <Mail aria-hidden="true" />
                            <input type="email" value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email" placeholder="admin@salon.com" required />
                        </div>
                    </label>
                    <label>
                        <span>Password</span>
                        <div>
                            <LockKeyhole aria-hidden="true" />
                            <input type={showPassword ? "text" : "password"} value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                autoComplete="new-password" placeholder="Minimum 8 characters" minLength={8} required />
                            <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                                aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ?
                                    <EyeOff /> : <Eye />}
                            </button>
                        </div>
                    </label>
                    <label>
                        <span>Confirm password</span>
                        <div>
                            <LockKeyhole aria-hidden="true" />
                            <input type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                                autoComplete="new-password" placeholder="Repeat password" minLength={8} required />
                        </div>
                    </label>

                    {error &&
                        <p className="create-admin-message create-admin-message--error" role="alert">{error}</p>}
                    {createdAdmin &&
                        <p className="create-admin-message create-admin-message--success" role="status">
                            <strong>{createdAdmin.firstName} {createdAdmin.lastName}</strong>
                            was registered successfully as an administrator.
                        </p>}

                    <div className="create-admin-actions">
                        <button type="button" className="create-admin-button create-admin-button--secondary"
                            onClick={resetForm} disabled={isSubmitting}>
                            Clear
                        </button>
                        <button type="submit" className="create-admin-button create-admin-button--primary"
                            disabled={isSubmitting}>
                            <UserPlus aria-hidden="true" />
                            {isSubmitting ? "Creating account..." : "Register admin"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default CreateAdminPage;
