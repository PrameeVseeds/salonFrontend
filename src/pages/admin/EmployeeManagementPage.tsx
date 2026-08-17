import {
  Camera,
  Pencil,
  Plus,
  Power,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import RequiredLabel from "../../components/form/RequiredLabel";
import { useEffect, useState, type FormEvent } from "react";
import {
  deleteEmployee,
  getEmployees,
  registerEmployee,
  updateEmployee,
  updateEmployeeStatus,
  uploadEmployeeProfileImage,
} from "../../services/employeeService";
import type { Employee } from "../../types/employee";
import { getApiErrorMessage } from "../../utils/apiError";
import { markFieldsTouched } from "../../utils/form";
import "./employeeManagementPage.css";

type Field = "firstName" | "lastName" | "phone" | "email";
const fields: Field[] = ["firstName", "lastName", "phone", "email"];

const EmployeeManagementPage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Employee | null>(null);
  const [open, setOpen] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getEmployees()
      .then(({ data }) => setEmployees(data.employees))
      .catch((e) => setError(getApiErrorMessage(e)));
  }, []);
  const errors: Partial<Record<Field, string>> = {
    firstName: firstName.trim() ? undefined : "First name is required.",
    lastName: lastName.trim() ? undefined : "Last name is required.",
    phone: phone.trim() ? undefined : "Phone number is required.",
    email: !email.trim()
      ? "Email address is required."
      : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        ? "Enter a valid email address."
        : undefined,
  };
  const visible = employees.filter((employee) =>
    `${employee.firstName} ${employee.lastName} ${employee.email} ${employee.phone}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const reset = () => {
    setFirstName("");
    setLastName("");
    setPhone("");
    setEmail("");
    setImage(null);
    setPreview("");
    setTouched({});
    setError(null);
  };
  const create = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };
  const edit = (employee: Employee) => {
    setEditing(employee);
    setFirstName(employee.firstName);
    setLastName(employee.lastName);
    setPhone(employee.phone);
    setEmail(employee.email);
    setImage(null);
    setPreview(employee.profileImage ?? "");
    setTouched({});
    setError(null);
    setOpen(true);
  };
  const close = () => {
    if (!busy) {
      setOpen(false);
      setEditing(null);
      reset();
    }
  };
  const touch = (field: Field) =>
    setTouched((current) => ({ ...current, [field]: true }));
  const chooseImage = (file: File | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Choose a JPG, PNG, or WEBP image.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Employee photo must be 5 MB or smaller.");
      return;
    }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setError(null);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(markFieldsTouched(fields));
    if (fields.some((field) => errors[field])) return;
    setBusy(true);
    setError(null);
    try {
      const input = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        email: email.trim(),
      };
      const response = editing
        ? await updateEmployee(editing.id, input)
        : await registerEmployee(input);
      let saved = response.data.employee;
      if (image) {
        const uploaded = await uploadEmployeeProfileImage(saved.id, image);
        saved = { ...saved, profileImage: uploaded.data.profileImage };
      }
      setEmployees((current) =>
        editing
          ? current.map((item) => (item.id === saved.id ? saved : item))
          : [saved, ...current],
      );
      setOpen(false);
      setEditing(null);
      reset();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setBusy(false);
    }
  };
  const toggle = async (employee: Employee) => {
    try {
      const { data } = await updateEmployeeStatus(
        employee.id,
        !employee.isActive,
      );
      setEmployees((current) =>
        current.map((item) => (item.id === employee.id ? data.employee : item)),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };
  const remove = async (employee: Employee) => {
    if (!window.confirm(`Delete ${employee.firstName} ${employee.lastName}?`))
      return;
    try {
      await deleteEmployee(employee.id);
      setEmployees((current) =>
        current.filter((item) => item.id !== employee.id),
      );
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };

  return (
    <div className="employee-page">
      <header className="employee-page__heading">
        <div>
          <p className="dashboard-eyebrow">Team management</p>
          <h1>Employees</h1>
          <p>Manage employee profiles, contact details, and account access.</p>
        </div>
        <button onClick={create}>
          <Plus />
          Add employee
        </button>
      </header>
      <section className="employee-panel">
        <header>
          <div>
            <h2>Salon employees</h2>
            <p>
              {employees.length} employee{employees.length === 1 ? "" : "s"}
            </p>
          </div>
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search employees"
              aria-label="Search employees"
            />
          </label>
        </header>
        {error && !open && (
          <p className="employee-message" role="alert">
            {error}
          </p>
        )}
        <div className="employee-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((employee) => (
                <tr key={employee.id}>
                  <td>
                    <div className="employee-person">
                      {employee.profileImage ? (
                        <img src={employee.profileImage} alt="" />
                      ) : (
                        <span>
                          {employee.firstName[0]}
                          {employee.lastName[0]}
                        </span>
                      )}
                      <div>
                        <strong>
                          {employee.firstName} {employee.lastName}
                        </strong>
                        <small>{employee.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>{employee.phone}</td>
                  <td>
                    <span
                      className={
                        employee.isActive ? "is-active" : "is-inactive"
                      }
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td>{new Date(employee.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div className="employee-actions">
                      <button
                        onClick={() => edit(employee)}
                        title="Edit employee"
                      >
                        <Pencil />
                      </button>
                      <button
                        onClick={() => void toggle(employee)}
                        title={employee.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power />
                      </button>
                      <button
                        className="is-delete"
                        onClick={() => void remove(employee)}
                        title="Delete employee"
                      >
                        <Trash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <p className="employee-empty">No employees found.</p>
          )}
        </div>
      </section>
      {open && (
        <div
          className="employee-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-form-title"
          >
            <header>
              <div>
                <h2 id="employee-form-title">
                  {editing ? "Edit employee" : "Add employee"}
                </h2>
                <p>Required fields are marked below.</p>
              </div>
              <button onClick={close} aria-label="Close">
                <X />
              </button>
            </header>
            <form noValidate onSubmit={(event) => void submit(event)}>
              <label>
                <RequiredLabel className="employee-required-label">First name</RequiredLabel>
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  onBlur={() => touch("firstName")}
                  aria-invalid={Boolean(touched.firstName && errors.firstName)}
                />
                {touched.firstName && errors.firstName && (
                  <small className="employee-field-error">
                    {errors.firstName}
                  </small>
                )}
              </label>
              <label>
                <RequiredLabel className="employee-required-label">Last name</RequiredLabel>
                <input
                  value={lastName}
                  onChange={(event) => setLastName(event.target.value)}
                  onBlur={() => touch("lastName")}
                  aria-invalid={Boolean(touched.lastName && errors.lastName)}
                />
                {touched.lastName && errors.lastName && (
                  <small className="employee-field-error">
                    {errors.lastName}
                  </small>
                )}
              </label>
              <label>
                <RequiredLabel className="employee-required-label">Phone</RequiredLabel>
                <input
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  onBlur={() => touch("phone")}
                  aria-invalid={Boolean(touched.phone && errors.phone)}
                />
                {touched.phone && errors.phone && (
                  <small className="employee-field-error">{errors.phone}</small>
                )}
              </label>
              <label>
                <RequiredLabel className="employee-required-label">Email</RequiredLabel>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onBlur={() => touch("email")}
                  aria-invalid={Boolean(touched.email && errors.email)}
                />
                {touched.email && errors.email && (
                  <small className="employee-field-error">{errors.email}</small>
                )}
              </label>
              <label className="employee-photo">
                <span>
                  Profile photo <small>Optional</small>
                </span>
                <span className="employee-photo__picker">
                  {preview ? (
                    <img src={preview} alt="Employee preview" />
                  ) : (
                    <UserRound />
                  )}
                  <span>
                    {image?.name ??
                      (editing ? "Replace photo" : "Choose photo")}
                  </span>
                  <Camera />
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(event) =>
                      chooseImage(event.target.files?.[0] ?? null)
                    }
                  />
                </span>
                <small>JPG, PNG or WEBP, up to 5 MB</small>
              </label>
              {error && (
                <p className="employee-message" role="alert">
                  {error}
                </p>
              )}
              <footer>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button className="is-primary" disabled={busy}>
                  {busy
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Add employee"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};

export default EmployeeManagementPage;
