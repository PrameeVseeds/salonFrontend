import { Camera, Eye, EyeOff, LockKeyhole, Save, UserRound, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { changeCustomerPassword, updateCustomerProfile, updateCustomerProfileImage } from "../../services/customerAuthService";
import type { Customer } from "../../types/customer";
import { getApiErrorMessage } from "../../utils/apiError";
import "./customerProfileModal.css";

interface Props { open: boolean; initialTab: "profile" | "password"; customer: Customer; onUpdated: (customer: Customer) => void; onClose: () => void; }

const CustomerProfileModal = ({ open, initialTab, customer, onUpdated, onClose }: Props) => {
  const [tab, setTab] = useState(initialTab);
  const [form, setForm] = useState({ firstName: customer.firstName, lastName: customer.lastName, phone: customer.phone, email: customer.email });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  if (!open)
    return null;

  const saveProfile = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setMessage(null);
    try {
      let profileImage = customer.profileImage;
      if (image) {
        const result = await updateCustomerProfileImage(image);
        profileImage = result.data.profileImage;
      }
      const { data } = await updateCustomerProfile({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phone: form.phone.trim(),
        email: form.email.trim()
      });
      const updated = { ...data.customer, profileImage };
      onUpdated(updated);
      setImage(null);
      setPreview(null);
      setMessage({ type: "success", text: "Profile updated successfully." });
    }
    catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to update your profile.")
      });
    }
    finally {
      setBusy(false);
    }
  };

  const savePassword = async (event: FormEvent) => {
    event.preventDefault(); setMessage(null);
    if (passwords.newPassword.length < 8)
      return setMessage({
        type: "error",
        text: "New password must contain at least 8 characters."
      });

    if (passwords.newPassword !== passwords.confirmPassword)
      return setMessage({
        type: "error",
        text: "Passwords do not match."
      });
    setBusy(true);
    try {
      const response = await changeCustomerPassword(passwords);
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setMessage({ type: "success", text: response.message });
    }
    catch (error) {
      setMessage({
        type: "error",
        text: getApiErrorMessage(error, "Unable to change your password.")
      });
    }
    finally {
      setBusy(false);
    }
  };

  const chooseImage = (file: File | null) => {
    if (preview)
      URL.revokeObjectURL(preview);
    if (!file) {
      setImage(null); setPreview(null);
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024)
      return setMessage({
        type: "error",
        text: "Choose a JPG, PNG, or WEBP image up to 5 MB."
      });
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setMessage(null);
  };

  return <div className="customer-profile-modal" onMouseDown={(event) => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <section role="dialog" aria-modal="true" aria-labelledby="customer-profile-title">
      <header>
        <div>
          <p>My account</p>
          <h2 id="customer-profile-title">Profile settings</h2>
        </div>
        <button type="button" onClick={onClose} disabled={busy} aria-label="Close">
          <X />
        </button>
      </header>
      <nav>
        <button className={tab === "profile" ? "is-active" : ""} type="button" onClick={() => { setTab("profile"); setMessage(null); }}>
          <UserRound />
          Profile
        </button>
        <button className={tab === "password" ? "is-active" : ""} type="button" onClick={() => { setTab("password"); setMessage(null); }}>
          <LockKeyhole />
          Password
        </button>
      </nav>
      {tab === "profile" ? <form onSubmit={(event) => void saveProfile(event)}>
        <div className="customer-profile-photo">
          <span>{preview || customer.profileImage ?
            <img src={preview ?? customer.profileImage ?? ""} alt="Profile preview" />
            : <UserRound />}
          </span>
          <label>
            <Camera />
            Change photo
            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => chooseImage(event.target.files?.[0] ?? null)} />
          </label>
        </div>
        <div className="customer-profile-grid">
          <label>
            <span>
              First name
            </span>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required />
          </label>
          <label>
            <span>Last name</span>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required />
          </label>
        </div>
        <label>
          <span>Phone number</span>
          <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        </label>
        <label>
          <span>Email address</span>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        {message && <p className={`is-${message.type}`}>{message.text}</p>}
        <button className="customer-profile-save" disabled={busy}>
          <Save /> {busy ? "Saving..." : "Save changes"}
        </button>
      </form> : <form onSubmit={(event) => void savePassword(event)}>
        {[['currentPassword', 'Current password'], ['newPassword', 'New password'],
        ['confirmPassword', 'Confirm new password']].map(([key, label]) =>
          <label key={key}>
            <span>{label}</span>
            <div className="customer-profile-password">
              <LockKeyhole />
              <input type={showPasswords ? "text" : "password"}
                autoComplete={key === "currentPassword" ? "current-password" : "new-password"}
                value={passwords[key as keyof typeof passwords]}
                onChange={(e) => setPasswords({ ...passwords, [key]: e.target.value })} required />
              {key === "currentPassword" && (
                <button type="button" onClick={() => setShowPasswords((value) => !value)} aria-label={showPasswords ? "Hide passwords" : "Show passwords"}>
                  {showPasswords ? <EyeOff /> : <Eye />}
                </button>
              )}
            </div>
          </label>)}
        {message &&
          <p className={`is-${message.type}`}>{message.text}</p>}
        <button className="customer-profile-save" disabled={busy}>
          <LockKeyhole /> {busy ? "Updating..." : "Update password"}
        </button>
      </form>}
    </section>
  </div>;
};

export default CustomerProfileModal;
