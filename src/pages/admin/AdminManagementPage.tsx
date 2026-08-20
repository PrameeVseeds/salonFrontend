import { Asterisk, Eye, EyeOff, LockKeyhole, Mail, Pencil, Plus, Power, Search, ShieldCheck, Trash2, UserPlus, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { createAdmin, deleteAdmin, getAdmins, updateAdmin, updateAdminStatus } from "../../services/adminService";
import type { Admin } from "../../types/admin";
import { getApiErrorMessage } from "../../utils/apiError";
import "./adminManagementPage.css";

const getErrorMessage = (error: unknown) =>
    getApiErrorMessage(error, "Unable to complete the request.");

type AdminFormField = "firstName" | "lastName" | "email" | "password" | "confirmPassword";
type AdminFormErrors = Partial<Record<AdminFormField, string>>;

const AdminManagementPage = () => {
    const [admins, setAdmins] = useState<Admin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [listError, setListError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<AdminFormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [actionAdminId, setActionAdminId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteTarget, setDeleteTarget] = useState<Admin | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const normalizedSearch = searchQuery.trim().toLowerCase();
    const filteredAdmins = admins.filter((admin) => {
        if (!normalizedSearch) return true;
        const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase();
        const status = admin.isActive ? "active" : "inactive";
        return fullName.includes(normalizedSearch)
            || admin.email.toLowerCase().includes(normalizedSearch)
            || status === normalizedSearch;
    });

    useEffect(() => {
        let active = true;
        getAdmins()
            .then(({ data }) => { if (active) setAdmins(data); })
            .catch((error: unknown) => { if (active) setListError(getErrorMessage(error)); })
            .finally(() => { if (active) setIsLoading(false); });
        return () => { active = false; };
    }, []);

    const resetForm = () => {
        setFirstName(""); setLastName(""); setEmail(""); setPassword(""); setConfirmPassword("");
        setShowPassword(false); setFormError(null);
        setFieldErrors({});
    };

    const clearFieldError = (field: AdminFormField) => {
        setFieldErrors((current) => ({ ...current, [field]: undefined }));
    };

    const validateField = (field: AdminFormField, value: string) => {
        const trimmedValue = value.trim();
        let message: string | undefined;

        if (field === "firstName" && !trimmedValue)
            message = "First name is required.";

        if (field === "lastName" && !trimmedValue)
            message = "Last name is required.";

        if (field === "email") {
            if (!trimmedValue)
                message = "Email address is required.";

            else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue))
                message = "Enter a valid email address.";
        }

        if (field === "password" && !editingAdmin) {
            if (!value)
                message = "Password is required.";
            else if (value.length < 8)
                message = "Use at least 8 characters.";
        }

        if (field === "confirmPassword" && !editingAdmin) {
            if (!value)
                message = "Please confirm the password.";
            else if (value !== password)
                message = "Passwords do not match.";
        }

        setFieldErrors((current) => ({ ...current, [field]: message }));
    };

    const closeModal = () => {
        if (isSubmitting) return;
        setIsModalOpen(false);
        setEditingAdmin(null);
        resetForm();
    };

    const openCreateModal = () => {
        setSuccessMessage(null);
        setEditingAdmin(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (admin: Admin) => {
        setSuccessMessage(null);
        setEditingAdmin(admin);
        setFirstName(admin.firstName);
        setLastName(admin.lastName);
        setEmail(admin.email);
        setPassword("");
        setConfirmPassword("");
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setFormError(null);
        const validationErrors: AdminFormErrors = {};

        if (!firstName.trim())
            validationErrors.firstName = "First name is required.";

        if (!lastName.trim())
            validationErrors.lastName = "Last name is required.";

        if (!email.trim())
            validationErrors.email = "Email address is required.";

        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
            validationErrors.email = "Enter a valid email address.";

        if (!editingAdmin && !password)
            validationErrors.password = "Password is required.";

        else if (!editingAdmin && password.length < 8)
            validationErrors.password = "Use at least 8 characters.";

        if (!editingAdmin && !confirmPassword)
            validationErrors.confirmPassword = "Please confirm the password.";

        else if (!editingAdmin && password !== confirmPassword)
            validationErrors.confirmPassword = "Passwords do not match.";
        setFieldErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0)
            return;

        setIsSubmitting(true);
        try {
            let savedAdmin: Admin | null;
            if (editingAdmin) {
                const response = await updateAdmin(editingAdmin.id, {
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(), isActive:
                        editingAdmin.isActive
                });
                savedAdmin = response.data.admin;
            } else {
                const response = await createAdmin({
                    firstName: firstName.trim(),
                    lastName: lastName.trim(),
                    email: email.trim(),
                    password
                });
                savedAdmin = response.data;
            }

            if (!savedAdmin) {
                setFormError("The server did not return the saved account.");
                return;
            }

            setAdmins((current) => editingAdmin ? current.map((admin) =>
                admin.id === savedAdmin.id ? savedAdmin : admin) : [savedAdmin, ...current]);

            setSuccessMessage(`${savedAdmin.firstName} ${savedAdmin.lastName} was ${editingAdmin ? "updated" : "registered"} successfully.`);
            setIsModalOpen(false);
            setEditingAdmin(null);
            resetForm();
        } catch (error) {
            setFormError(getErrorMessage(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusChange = async (admin: Admin) => {
        setActionAdminId(admin.id);
        setListError(null);
        try {
            const { data } = await updateAdminStatus(admin.id, { isActive: !admin.isActive });
            setAdmins((current) => current.map((item) => item.id === admin.id ? data.admin : item));
            setSuccessMessage(`${admin.firstName} ${admin.lastName} was ${admin.isActive ? "deactivated" : "activated"}.`);
        } catch (error) {
            setListError(getErrorMessage(error));
        } finally {
            setActionAdminId(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        setListError(null);
        try {
            await deleteAdmin(deleteTarget.id);
            setAdmins((current) => current.map((admin) => admin.id === deleteTarget.id ? { ...admin, isActive: false } : admin));
            setSuccessMessage(`${deleteTarget.firstName} ${deleteTarget.lastName} was deleted and can no longer sign in.`);
            setDeleteTarget(null);
        } catch (error) {
            setListError(getErrorMessage(error));
            setDeleteTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="admin-management-page">
            <header className="admin-management-heading">
                <div>
                    <p className="dashboard-eyebrow">Administrator access</p>
                    <h1>Administrators</h1>
                    <p>Review registered accounts and provide access to trusted team members.</p>
                </div>

                <button type="button" onClick={openCreateModal}>
                    <Plus aria-hidden="true" />
                    Register admin
                </button>
            </header>

            {successMessage && <p className="admin-management-notice" role="status"><ShieldCheck aria-hidden="true" />{successMessage}</p>}

            <section className="admin-list-panel" aria-labelledby="registered-admins-title">
                <div className="admin-list-panel_header">
                    <div>
                        <h2 id="registered-admins-title">Registered admins</h2>
                        <p>{isLoading ? "Loading accounts..." : `${admins.length} administrator account${admins.length === 1 ? "" : "s"}`}</p>
                    </div>
                    <label className="admin-search">
                        <Search aria-hidden="true" />
                        <input type="search" value={searchQuery}
                            onChange={(event) => setSearchQuery(event.target.value)}
                            placeholder="Search admins" aria-label="Search administrators" />
                    </label>
                </div>

                {listError &&
                    <p className="admin-list-error" role="alert">{listError}
                    </p>}
                {!isLoading && !listError && admins.length === 0 &&
                    <div className="admin-list-empty">
                        <UserRound aria-hidden="true" />
                        <h3>No administrators yet</h3>
                        <p>Register the first administrator to get started.</p>
                    </div>}
                {!isLoading && admins.length >
                    0 && filteredAdmins.length === 0 &&
                    <div className="admin-list-empty">
                        <Search aria-hidden="true" />
                        <h3>No matching administrators</h3>
                        <p>Try a different name, email, or status.</p>
                    </div>}
                {!isLoading && filteredAdmins.length > 0 && (
                    <div className="admin-table-wrap">
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Administrator</th>
                                    <th>Status</th>
                                    <th>Registered</th>
                                    <th className="admin-table_actions-heading">Actions</th>
                                </tr>
                            </thead>
                            <tbody>{filteredAdmins.map((admin) => (
                                <tr key={admin.id}>
                                    <td>
                                        <div className="admin-table_identity">
                                            <div>
                                                <strong>{admin.firstName} {admin.lastName}</strong>
                                                <small>{admin.email}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`admin-list-status ${admin.isActive ? "is-active" : "is-inactive"}`}>
                                            {admin.isActive ? "Active" : "Inactive"}
                                        </span>
                                    </td>
                                    <td>
                                        <time dateTime={admin.createdAt}>
                                            {new Date(admin.createdAt).toLocaleDateString()}
                                        </time>
                                    </td>
                                    <td>
                                        <div className="admin-table_actions">
                                            <button type="button" className="is-edit" onClick={() =>
                                                openEditModal(admin)} aria-label={`Edit ${admin.firstName} ${admin.lastName}`} title="Edit admin">
                                                <Pencil />
                                            </button>
                                            <button type="button" className={admin.isActive ? "is-deactivate" : "is-activate"} onClick={() =>
                                                void handleStatusChange(admin)} disabled={actionAdminId === admin.id} aria-label={`${admin.isActive ? "Deactivate" : "Activate"} 
                                                    ${admin.firstName} ${admin.lastName}`} title={admin.isActive ? "Deactivate admin" : "Activate admin"}>
                                                <Power />
                                            </button>
                                            <button type="button" className="is-delete"
                                                onClick={() => setDeleteTarget(admin)} disabled={!admin.isActive || actionAdminId === admin.id}
                                                aria-label={`Delete ${admin.firstName} ${admin.lastName}`}
                                                title={admin.isActive ? "Delete admin" : "Admin is already deleted"}>
                                                <Trash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}</tbody>
                        </table>
                    </div>
                )}
            </section>

            {isModalOpen && (
                <div className="admin-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal(); }}>
                    <section className="admin-modal_dialog" role="dialog" aria-modal="true" aria-labelledby="register-admin-title">
                        <header>
                            <div>
                                <h2 id="register-admin-title">{editingAdmin ? "Edit administrator" : "Register new admin"}</h2>
                                <p>{editingAdmin ? "Update this administrator's account details." : "The account will be active immediately."}</p>
                            </div>
                            <button type="button" onClick={closeModal} aria-label="Close form">
                                <X />
                            </button>
                        </header>
                        <form className="admin-modal-form" onSubmit={handleSubmit} noValidate>
                            <label>
                                <span>
                                    First name
                                    <Asterisk className="required-icon" aria-hidden="true" />
                                </span>
                                <div>
                                    <UserRound />
                                    <input value={firstName} onChange={(event) => {
                                        setFirstName(event.target.value);
                                        clearFieldError("firstName");
                                    }} onBlur={(event) => validateField("firstName", event.target.value)}
                                        placeholder="First name" autoComplete="given-name" aria-invalid={Boolean(fieldErrors.firstName)}
                                        aria-describedby={fieldErrors.firstName ? "first-name-error" : undefined} />
                                </div>
                                {fieldErrors.firstName &&
                                    <small className="admin-field-error" id="first-name-error">{fieldErrors.firstName}
                                    </small>}
                            </label>
                            <label>
                                <span>
                                    Last name
                                    <Asterisk className="required-icon" aria-hidden="true" />
                                </span>
                                <div>
                                    <UserRound />
                                    <input value={lastName} onChange={(event) => { setLastName(event.target.value); clearFieldError("lastName"); }}
                                        onBlur={(event) => validateField("lastName", event.target.value)}
                                        placeholder="Last name"
                                        autoComplete="family-name" aria-invalid={Boolean(fieldErrors.lastName)}
                                        aria-describedby={fieldErrors.lastName ? "last-name-error" : undefined} />
                                </div>
                                {fieldErrors.lastName && <small className="admin-field-error" id="last-name-error">
                                    {fieldErrors.lastName}
                                </small>}
                            </label>
                            <label className="is-wide">
                                <span>Email address
                                    <Asterisk className="required-icon" aria-hidden="true" />
                                </span>
                                <div>
                                    <Mail />
                                    <input type="email" value={email} onChange={(event) => {
                                        setEmail(event.target.value);
                                        clearFieldError("email");
                                    }}
                                        onBlur={(event) => validateField("email", event.target.value)}
                                        placeholder="admin@salon.com" autoComplete="email"
                                        aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "admin-email-error" : undefined} />
                                </div>
                                {fieldErrors.email &&
                                    <small className="admin-field-error" id="admin-email-error">{fieldErrors.email}
                                    </small>}
                            </label>
                            {!editingAdmin &&
                                <>
                                    <label>
                                        <span>
                                            Password
                                            <Asterisk className="required-icon" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <LockKeyhole />
                                            <input type={showPassword ? "text" : "password"} value={password}
                                                onChange={(event) => { setPassword(event.target.value); clearFieldError("password"); }}
                                                onBlur={(event) => validateField("password", event.target.value)}
                                                placeholder="Minimum 8 characters"
                                                autoComplete="new-password" aria-invalid={Boolean(fieldErrors.password)}
                                                aria-describedby={fieldErrors.password ? "admin-password-error" : undefined} />
                                            <button type="button" onClick={() => setShowPassword((visible) => !visible)}
                                                aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ?
                                                    <EyeOff /> : <Eye />}
                                            </button>
                                        </div>
                                        {fieldErrors.password &&
                                            <small className="admin-field-error" id="admin-password-error">{fieldErrors.password}
                                            </small>}
                                    </label>
                                    <label>
                                        <span>Confirm password <Asterisk className="required-icon" aria-hidden="true" />
                                        </span>
                                        <div>
                                            <LockKeyhole />
                                            <input type={showPassword ? "text" : "password"}
                                                value={confirmPassword}
                                                onChange={(event) => { setConfirmPassword(event.target.value); clearFieldError("confirmPassword"); }}
                                                onBlur={(event) => validateField("confirmPassword", event.target.value)}
                                                placeholder="Repeat password" autoComplete="new-password" aria-invalid={Boolean(fieldErrors.confirmPassword)}
                                                aria-describedby={fieldErrors.confirmPassword ? "confirm-password-error" : undefined} />
                                        </div>{fieldErrors.confirmPassword && <small className="admin-field-error" id="confirm-password-error">
                                            {fieldErrors.confirmPassword}</small>}</label></>}
                            {formError &&
                                <p className="admin-modal-error" role="alert">{formError}</p>}
                            <footer>
                                <button type="button" className="is-secondary"
                                    onClick={closeModal} disabled={isSubmitting}>
                                    Cancel
                                </button>
                                <button type="submit" className="is-primary"
                                    disabled={isSubmitting}>{editingAdmin ?
                                        <Pencil /> : <UserPlus />}
                                    {isSubmitting ? "Saving..." : editingAdmin ? "Save changes" : "Register admin"}
                                </button>
                            </footer>
                        </form>
                    </section>
                </div>
            )}

            {deleteTarget && (
                <div className="admin-modal admin-delete-modal"
                    role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !isDeleting) setDeleteTarget(null); }}>
                    <section className="admin-delete-dialog"
                        role="alertdialog" aria-modal="true"
                        aria-labelledby="delete-admin-title" aria-describedby="delete-admin-description">
                        <span className="admin-delete-dialog_icon"><Trash2 aria-hidden="true" /></span>
                        <h2 id="delete-admin-title">Delete administrator?</h2>
                        <p id="delete-admin-description">
                            <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>
                            will lose access to the admin portal. Their account will be marked inactive.</p>
                        <div>
                            <button type="button" className="is-secondary"
                                onClick={() => setDeleteTarget(null)} disabled={isDeleting}>
                                Cancel
                            </button>
                            <button type="button" className="is-danger"
                                onClick={() => void handleDelete()} disabled={isDeleting}>
                                <Trash2 />
                                {isDeleting ? "Deleting..." : "Delete admin"}
                            </button>
                        </div>
                    </section>
                </div>
            )}
        </div>
    );
};

export default AdminManagementPage;
