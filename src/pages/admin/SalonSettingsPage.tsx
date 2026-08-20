import { Asterisk, Building2, Save, Upload } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import {
  getSalonSettings,
  updateSalonLogo,
  updateSalonSettings,
} from "../../services/settingsService";
import type {
  SalonSettings,
  UpdateSalonSettingsInput,
} from "../../types/settings";
import { getApiErrorMessage, hasApiStatus } from "../../utils/apiError";
import { markFieldsTouched } from "../../utils/form";
import "./salonSettingsPage.css";

const defaults: UpdateSalonSettingsInput = {
  salonName: "Salon",
  phone: "",
  email: "admin@salon.com",
  address: "",
  facebookUrl: null,
  instagramUrl: null,
  whatsappNumber: null,
  allowCustomerChooseEmployee: true,
  enableOnlinePayment: false,
  bookingIntervalMinutes: 30,
  appointmentBufferMinutes: 0,
  appointmentGracePeriodMinutes: 15,
};
const getError = (error: unknown) =>
  getApiErrorMessage(error, "Unable to save settings.");

type RequiredSettingField = "salonName" | "phone" | "email" | "address" | "bookingInterval" | "appointmentBuffer" | "appointmentGracePeriod";
const requiredSettingFields: RequiredSettingField[] = ["salonName", "phone", "email", "address", "bookingInterval", "appointmentBuffer", "appointmentGracePeriod"];
const RequiredLabel = ({ children }: { children: string }) => (
  <span className="settings-required-label">{children}<Asterisk aria-label="required" /></span>
);

const SalonSettingsPage = () => {
  const [settings, setSettings] = useState<SalonSettings | null>(null);
  const [form, setForm] = useState<UpdateSalonSettingsInput>(defaults);
  const [logo, setLogo] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bookingInterval, setBookingInterval] = useState(String(defaults.bookingIntervalMinutes));
  const [appointmentBuffer, setAppointmentBuffer] = useState(String(defaults.appointmentBufferMinutes));
  const [appointmentGracePeriod, setAppointmentGracePeriod] = useState(String(defaults.appointmentGracePeriodMinutes));
  const [touched, setTouched] = useState<Partial<Record<RequiredSettingField, boolean>>>({});
  const apply = (value: SalonSettings) => {
    setSettings(value);
    setForm({
      salonName: value.salonName,
      phone: value.phone,
      email: value.email,
      address: value.address,
      facebookUrl: value.facebookUrl,
      instagramUrl: value.instagramUrl,
      whatsappNumber: value.whatsappNumber,
      allowCustomerChooseEmployee: value.allowCustomerChooseEmployee,
      enableOnlinePayment: value.enableOnlinePayment,
      bookingIntervalMinutes: value.bookingIntervalMinutes,
      appointmentBufferMinutes: value.appointmentBufferMinutes,
      appointmentGracePeriodMinutes: value.appointmentGracePeriodMinutes,
    });
    setBookingInterval(String(value.bookingIntervalMinutes));
    setAppointmentBuffer(String(value.appointmentBufferMinutes));
    setAppointmentGracePeriod(String(value.appointmentGracePeriodMinutes));
  };
  useEffect(() => {
    getSalonSettings()
      .then(({ data }) => apply(data.settings))
      .catch(async (e: unknown) => {
        if (hasApiStatus(e, 404)) {
          try {
            const { data } = await updateSalonSettings(defaults);
            apply(data.settings);
          } catch (initError) {
            setError(getError(initError));
          }
          return;
        }
        setError(getError(e));
      });
  }, []);
  const update = <K extends keyof UpdateSalonSettingsInput>(
    key: K,
    value: UpdateSalonSettingsInput[K],
  ) => setForm((current) => ({ ...current, [key]: value }));
  const touch = (field: RequiredSettingField) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const fieldErrors: Partial<Record<RequiredSettingField, string>> = {
    salonName: !form.salonName.trim() ? "Salon name is required." : undefined,
    phone: !form.phone.trim() ? "Phone number is required." : undefined,
    email: !form.email.trim()
      ? "Email address is required."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
        ? "Enter a valid email address."
        : undefined,
    address: !form.address.trim() ? "Address is required." : undefined,
    bookingInterval: !bookingInterval
      ? "Booking interval is required."
      : !Number.isInteger(Number(bookingInterval)) || Number(bookingInterval) <= 0
        ? "Enter a positive whole number."
        : undefined,
    appointmentBuffer: !appointmentBuffer
      ? "Appointment buffer is required."
      : !Number.isInteger(Number(appointmentBuffer)) || Number(appointmentBuffer) < 0
        ? "Enter zero or a positive whole number."
        : undefined,
    appointmentGracePeriod: !appointmentGracePeriod
      ? "Late arrival grace period is required."
      : !Number.isInteger(Number(appointmentGracePeriod)) || Number(appointmentGracePeriod) < 0
        ? "Enter zero or a positive whole number."
        : undefined,
  };
  const save = async (e: FormEvent) => {
    e.preventDefault();
    setTouched(markFieldsTouched(requiredSettingFields));
    if (requiredSettingFields.some((field) => fieldErrors[field])) {
      setError(null);
      setSuccess(null);
      return;
    }
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      const { data } = await updateSalonSettings({
        ...form,
        bookingIntervalMinutes: Number(bookingInterval),
        appointmentBufferMinutes: Number(appointmentBuffer),
        appointmentGracePeriodMinutes: Number(appointmentGracePeriod),
      });
      apply(data.settings);
      setSuccess("Salon settings updated successfully.");
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  };
  const upload = async () => {
    if (!logo) {
      setError("Choose a logo file first.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { data } = await updateSalonLogo(logo);
      apply(data.settings);
      setLogo(null);
      setSuccess("Salon logo updated successfully.");
    } catch (requestError) {
      setError(getError(requestError));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="salon-settings-page">
      <header>
        <p className="dashboard-eyebrow">Business configuration</p>
        <h1>Salon settings</h1>
        <p>Manage public contact details and booking behaviour.</p>
      </header>
      {error && <p className="settings-message is-error">{error}</p>}
      {success && <p className="settings-message is-success">{success}</p>}
      <div className="settings-layout">
        <form noValidate
          className="settings-card settings-form"
          onSubmit={(e) => void save(e)}
        >
          <div className="settings-card_title">
            <Building2 />
            <div>
              <h2>Business details</h2>
              <p>Required contact and booking information.</p>
            </div>
          </div>
          <label>
            <RequiredLabel>Salon name</RequiredLabel>
            <input
              value={form.salonName}
              onChange={(e) => update("salonName", e.target.value)}
              onBlur={() => touch("salonName")}
              aria-invalid={Boolean(touched.salonName && fieldErrors.salonName)}
            />
            {touched.salonName && fieldErrors.salonName &&
              <small className="settings-field-error">{fieldErrors.salonName}</small>}
          </label>
          <label>
            <RequiredLabel>Phone</RequiredLabel>
            <input
              value={form.phone}
              onChange={(e) => update("phone", e.target.value)}
              onBlur={() => touch("phone")}
              aria-invalid={Boolean(touched.phone && fieldErrors.phone)}
            />
            {touched.phone && fieldErrors.phone &&
              <small className="settings-field-error">{fieldErrors.phone}</small>}
          </label>
          <label>
            <RequiredLabel>Email</RequiredLabel>
            <input
              type="email"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              onBlur={() => touch("email")}
              aria-invalid={Boolean(touched.email && fieldErrors.email)}
            />
            {touched.email && fieldErrors.email &&
              <small className="settings-field-error">{fieldErrors.email}</small>}
          </label>
          <label>
            <span>WhatsApp number</span>
            <input
              value={form.whatsappNumber ?? ""}
              onChange={(e) => update("whatsappNumber", e.target.value || null)}
            />
          </label>
          <label className="is-wide">
            <RequiredLabel>Address</RequiredLabel>
            <textarea
              value={form.address}
              onChange={(e) => update("address", e.target.value)}
              onBlur={() => touch("address")}
              aria-invalid={Boolean(touched.address && fieldErrors.address)}
            />
            {touched.address && fieldErrors.address &&
              <small className="settings-field-error">{fieldErrors.address}</small>}
          </label>
          <label>
            <span>Facebook URL</span>
            <input
              type="url"
              value={form.facebookUrl ?? ""}
              onChange={(e) => update("facebookUrl", e.target.value || null)}
            />
          </label>
          <label>
            <span>Instagram URL</span>
            <input
              type="url"
              value={form.instagramUrl ?? ""}
              onChange={(e) => update("instagramUrl", e.target.value || null)}
            />
          </label>
          <label>
            <RequiredLabel>Booking interval (minutes)</RequiredLabel>
            <input
              type="number"
              min="1"
              step="1"
              value={bookingInterval}
              onChange={(e) => setBookingInterval(e.target.value)}
              onBlur={() => touch("bookingInterval")}
              aria-invalid={Boolean(touched.bookingInterval && fieldErrors.bookingInterval)}
            />
            {touched.bookingInterval && fieldErrors.bookingInterval &&
              <small className="settings-field-error">{fieldErrors.bookingInterval}</small>}
          </label>
          <label>
            <RequiredLabel>Appointment buffer (minutes)</RequiredLabel>
            <input
              type="number"
              min="0"
              step="1"
              value={appointmentBuffer}
              onChange={(e) => setAppointmentBuffer(e.target.value)}
              onBlur={() => touch("appointmentBuffer")}
              aria-invalid={Boolean(touched.appointmentBuffer && fieldErrors.appointmentBuffer)}
            />
            {touched.appointmentBuffer && fieldErrors.appointmentBuffer &&
              <small className="settings-field-error">{fieldErrors.appointmentBuffer}</small>}
          </label>
          <label className="is-wide">
            <RequiredLabel>Late arrival grace period (minutes)</RequiredLabel>
            <input
              type="number"
              min="0"
              step="1"
              value={appointmentGracePeriod}
              onChange={(e) => setAppointmentGracePeriod(e.target.value)}
              onBlur={() => touch("appointmentGracePeriod")}
              aria-invalid={Boolean(touched.appointmentGracePeriod && fieldErrors.appointmentGracePeriod)}
            />
            <span className="settings-field-hint">
              A scheduled appointment is cancelled automatically if it has not started this many minutes after its start time.
            </span>
            {touched.appointmentGracePeriod && fieldErrors.appointmentGracePeriod &&
              <small className="settings-field-error">{fieldErrors.appointmentGracePeriod}</small>}
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={form.allowCustomerChooseEmployee}
              onChange={(e) =>
                update("allowCustomerChooseEmployee", e.target.checked)
              }
            />
            <span>Allow customers to choose an employee</span>
          </label>
          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={form.enableOnlinePayment}
              onChange={(e) => update("enableOnlinePayment", e.target.checked)}
            />
            <span>Enable online payment</span>
          </label>
          <button className="settings-primary is-wide" disabled={busy}>
            <Save />
            {busy ? "Saving..." : "Save settings"}
          </button>
        </form>
        <section className="settings-card settings-logo">
          <div className="settings-card_title">
            <Upload />
            <div>
              <h2>Salon logo</h2>
              <p>JPG, PNG, WEBP, or SVG up to 5 MB.</p>
            </div>
          </div>
          <div className="settings-logo_preview">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="Current salon logo" />
            ) : (
              <Building2 />
            )}
          </div>
          <label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,image/svg+xml"
              onChange={(e) => setLogo(e.target.files?.[0] ?? null)}
            />
            <span>{logo ? logo.name : "Choose logo"}</span>
          </label>
          <button
            className="settings-primary"
            onClick={() => void upload()}
            disabled={busy}
          >
            <Upload />
            {busy ? "Uploading..." : "Upload logo"}
          </button>
        </section>
      </div>
    </div>
  );
};
export default SalonSettingsPage;
