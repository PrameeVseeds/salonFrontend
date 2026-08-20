import { Asterisk, CalendarDays, KeyRound, Mail, Pencil, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { useState, type FormEvent } from "react";
import { changeAdminPassword, updateAdminProfile } from "../../services/adminAuthService";
import type { Admin } from "../../types/admin";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminProfilePage.css";
import "./adminProfileEdit.css";

interface AdminProfilePageProps {
    user: Admin;
}

const AdminProfilePage = ({ user }: AdminProfilePageProps) => {
    const [profile, setProfile] = useState(user);
    const [isEditing, setIsEditing] = useState(false);
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [email, setEmail] = useState(user.email);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const initials = `${profile.firstName[0] ?? ""}${profile.lastName[0] ?? ""}`.toUpperCase();

    const cancelEditing = () => {
        setFirstName(profile.firstName);
        setLastName(profile.lastName);
        setEmail(profile.email);
        setError(null);
        setIsEditing(false);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);
        setSuccess(null);

        if (!firstName.trim() || !lastName.trim() || !email.trim()) {
            setError("First name, last name, and email address are required.");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            setError("Enter a valid email address.");
            return;
        }

        setIsSaving(true);
        try {
            const { data } = await updateAdminProfile({ firstName: firstName.trim(), lastName: lastName.trim(), email: email.trim() });
            setProfile(data.user);
            setFirstName(data.user.firstName);
            setLastName(data.user.lastName);
            setEmail(data.user.email);
            setSuccess("Your profile was updated successfully.");
            setIsEditing(false);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Unable to update your profile."));
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault(); setError(null); setSuccess(null);
        if (!currentPassword || newPassword.length < 8 || newPassword !== confirmPassword) {
            setError(!currentPassword ? "Current password is required." :
                newPassword.length < 8 ? "New password must contain at least 8 characters." :
                    "New passwords do not match.");
            return;
        }
        setIsChangingPassword(true);
        try {
            const response = await changeAdminPassword({ currentPassword, newPassword, confirmPassword });
            setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); setSuccess(response.message);
        } catch (requestError) {
            setError(getApiErrorMessage(requestError, "Unable to change your password."));
        }
        finally {
            setIsChangingPassword(false);
        }
    };

    return (
        <div className="admin-profile-page">
            <header className="admin-profile-heading">
                <div>
                    <p className="dashboard-eyebrow">Your account</p>
                    <h1>My profile</h1>
                    <p>View and maintain your personal account details.</p>
                </div>
                {!isEditing && <button type="button" onClick={() => { setSuccess(null); setIsEditing(true); }}>
                    <Pencil aria-hidden="true" />
                    Edit profile
                </button>}
            </header>

            {success && <p className="admin-profile-message is-success" role="status">{success}</p>}
            {error && <p className="admin-profile-message is-error" role="alert">{error}</p>}

            <section className="admin-profile-card" aria-labelledby="profile-name">
                <div className="admin-profile-card_summary">
                    <span className="admin-profile-avatar">{initials}</span>
                    <div>
                        <h2 id="profile-name">{profile.firstName} {profile.lastName}</h2>
                        <p>{profile.email}</p>
                        <span className={`admin-profile-status ${profile.isActive ? "is-active" : "is-inactive"}`}>
                            {profile.isActive ? "Active account" : "Inactive account"}
                        </span>
                    </div>
                </div>

                {isEditing ? (
                    <form className="admin-profile-form" onSubmit={handleSubmit} noValidate>
                        <label>
                            <span>
                                First name
                                <Asterisk aria-hidden="true" />
                            </span>
                            <input value={firstName}
                                onChange={(event) => setFirstName(event.target.value)}
                                autoComplete="given-name" />
                        </label>
                        <label>
                            <span>
                                Last name
                                <Asterisk aria-hidden="true" />
                            </span>
                            <input value={lastName} onChange={(event) => setLastName(event.target.value)}
                                autoComplete="family-name" />
                        </label>
                        <label className="is-wide">
                            <span>
                                Email address
                                <Asterisk aria-hidden="true" />
                            </span>
                            <input type="email" value={email}
                                onChange={(event) => setEmail(event.target.value)}
                                autoComplete="email" />
                        </label>
                        <footer>
                            <button type="button" className="is-secondary" onClick={cancelEditing} disabled={isSaving}>
                                <X />
                                Cancel
                            </button>
                            <button type="submit" className="is-primary"
                                disabled={isSaving}>
                                <Save />
                                {isSaving ? "Saving..." : "Save changes"}
                            </button>
                        </footer>
                    </form>
                ) : (
                    <dl className="admin-profile-details">
                        <div>
                            <dt>
                                <UserRound aria-hidden="true" />
                                Full name
                            </dt>
                            <dd>{profile.firstName} {profile.lastName}</dd>
                        </div>
                        <div>
                            <dt>
                                <Mail aria-hidden="true" />
                                Email address
                            </dt>
                            <dd>{profile.email}</dd>
                        </div>
                        <div>
                            <dt>
                                <ShieldCheck aria-hidden="true" />
                                Access role
                            </dt>
                            <dd>{profile.role === "super_admin" ? "Super administrator" : "Administrator"}</dd>
                        </div>
                        <div>
                            <dt>
                                <CalendarDays aria-hidden="true" />
                                Member since
                            </dt>
                            <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
                        </div>
                    </dl>
                )}
            </section>
            <section className="admin-profile-card admin-password-change" aria-labelledby="change-password-title">
                <div className="admin-password-change-heading"><KeyRound /><div><h2 id="change-password-title">Change password</h2><p>Confirm your current password before choosing a new one.</p></div></div>
                <form onSubmit={(event) => void handlePasswordChange(event)}>
                    <label><span>Current password</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} autoComplete="current-password" /></label>
                    <label><span>New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" /></label>
                    <label><span>Confirm new password</span><input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} autoComplete="new-password" /></label>
                    <button type="submit" disabled={isChangingPassword}><KeyRound />{isChangingPassword ? "Changing..." : "Change password"}</button>
                </form>
            </section>
        </div>
    );
};

export default AdminProfilePage;
