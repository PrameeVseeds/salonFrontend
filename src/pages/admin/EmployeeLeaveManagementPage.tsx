import {
  Asterisk,
  CalendarClock,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { getEmployees } from "../../services/employeeService";
import {
  createEmployeeLeave,
  deleteEmployeeLeave,
  getEmployeeLeaves,
  updateEmployeeLeave,
} from "../../services/employeeLeaveService";
import type { Employee } from "../../types/employee";
import type {
  EmployeeLeave,
  EmployeeLeaveStatus,
} from "../../types/employeeLeave";
import { getApiErrorMessage } from "../../utils/apiError";
import { markFieldsTouched } from "../../utils/form";
import "./employeeLeaveManagementPage.css";

type Field = "employee" | "leaveType" | "date" | "start" | "end";
const required: Field[] = ["employee", "leaveType", "date", "start", "end"];
const leaveTypes = [
  "Annual leave",
  "Medical leave",
  "Casual leave",
  "Unpaid leave",
  "Other",
];
const RequiredLabel = ({ children }: { children: string }) => (
  <span className="leave-required">
    {children}
    <Asterisk aria-label="required" />
  </span>
);
const EmployeeLeaveManagementPage = () => {
  const [leaves, setLeaves] = useState<EmployeeLeave[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<EmployeeLeave | null>(null);
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [leaveType, setLeaveType] = useState("");
  const [date, setDate] = useState("");
  const [start, setStart] = useState("00:00");
  const [end, setEnd] = useState("23:59");
  const [reason, setReason] = useState("");
  const [status, setStatus] = useState<EmployeeLeaveStatus>("pending");
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    Promise.all([getEmployeeLeaves(), getEmployees()])
      .then(([leaveResponse, employeeResponse]) => {
        setLeaves(leaveResponse.data.leaves);
        setEmployees(employeeResponse.data.employees);
      })
      .catch((requestError) => setError(getApiErrorMessage(requestError)));
  }, []);
  const employeeName = (id: number) => {
    const employee = employees.find((item) => item.id === id);
    return employee
      ? `${employee.firstName} ${employee.lastName}`
      : `Employee #${id}`;
  };
  const errors: Partial<Record<Field, string>> = {
    employee: employeeId ? undefined : "Employee is required.",
    leaveType: leaveType.trim() ? undefined : "Leave type is required.",
    date: date ? undefined : "Leave date is required.",
    start: start ? undefined : "Start time is required.",
    end: !end
      ? "End time is required."
      : start && end <= start
        ? "End time must be later than start time."
        : undefined,
  };
  const visible = leaves.filter((leave) =>
    `${employeeName(leave.employeeId)} ${leave.leaveType} ${leave.status} ${leave.reason ?? ""}`
      .toLowerCase()
      .includes(query.trim().toLowerCase()),
  );
  const reset = () => {
    setEmployeeId("");
    setLeaveType("");
    setDate("");
    setStart("00:00");
    setEnd("23:59");
    setReason("");
    setStatus("pending");
    setTouched({});
    setError(null);
  };
  const create = () => {
    setEditing(null);
    reset();
    setOpen(true);
  };
  const edit = (leave: EmployeeLeave) => {
    setEditing(leave);
    setEmployeeId(String(leave.employeeId));
    setLeaveType(leave.leaveType);
    setDate(leave.leaveDate.slice(0, 10));
    setStart(leave.startTime.slice(0, 5));
    setEnd(leave.endTime.slice(0, 5));
    setReason(leave.reason ?? "");
    setStatus(leave.status);
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
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(markFieldsTouched(required));
    if (required.some((field) => errors[field])) return;
    setBusy(true);
    setError(null);
    try {
      const input = {
        employeeId: Number(employeeId),
        leaveType: leaveType.trim(),
        leaveDate: date,
        startTime: start,
        endTime: end,
        reason: reason.trim() || null,
        status,
      };
      const response = editing
        ? await updateEmployeeLeave(editing.id, input)
        : await createEmployeeLeave(input);
      const saved = response.data.leave;
      setLeaves((current) =>
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
  const remove = async (leave: EmployeeLeave) => {
    if (!window.confirm(`Delete ${employeeName(leave.employeeId)}'s leave?`))
      return;
    try {
      await deleteEmployeeLeave(leave.id);
      setLeaves((current) => current.filter((item) => item.id !== leave.id));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    }
  };
  return (
    <div className="leave-page">
      <header className="leave-heading">
        <div>
          <p className="dashboard-eyebrow">Team availability</p>
          <h1>Employee leaves</h1>
          <p>Plan employee time off and review approval status.</p>
        </div>
        <button onClick={create}>
          <Plus />
          Add leave
        </button>
      </header>
      <section className="leave-panel">
        <header>
          <div>
            <h2>Leave records</h2>
            <p>
              {leaves.length} record{leaves.length === 1 ? "" : "s"}
            </p>
          </div>
          <label>
            <Search />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search leaves"
              aria-label="Search leaves"
            />
          </label>
        </header>
        {error && !open && <p className="leave-message">{error}</p>}
        <div className="leave-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Employee</th>
                <th>Leave</th>
                <th>Date & time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((leave) => (
                <tr key={leave.id}>
                  <td>
                    <strong>{employeeName(leave.employeeId)}</strong>
                  </td>
                  <td>
                    <strong>{leave.leaveType}</strong>
                    <small>{leave.reason || "No reason provided"}</small>
                  </td>
                  <td>
                    <strong>
                      {new Date(
                        `${leave.leaveDate.slice(0, 10)}T00:00:00`,
                      ).toLocaleDateString()}
                    </strong>
                    <small>
                      {leave.startTime.slice(0, 5)} –{" "}
                      {leave.endTime.slice(0, 5)}
                    </small>
                  </td>
                  <td>
                    <span className={`is-${leave.status}`}>{leave.status}</span>
                  </td>
                  <td>
                    <div className="leave-actions">
                      <button onClick={() => edit(leave)} title="Edit leave">
                        <Pencil />
                      </button>
                      <button
                        className="is-delete"
                        onClick={() => void remove(leave)}
                        title="Delete leave"
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
            <p className="leave-empty">No leave records found.</p>
          )}
        </div>
      </section>
      {open && (
        <div
          className="leave-modal"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section role="dialog" aria-modal="true">
            <header>
              <div>
                <h2>
                  {editing ? "Edit employee leave" : "Add employee leave"}
                </h2>
                <p>Required fields are marked below.</p>
              </div>
              <button onClick={close} aria-label="Close">
                <X />
              </button>
            </header>
            <form noValidate onSubmit={(event) => void submit(event)}>
              <label>
                <RequiredLabel>Employee</RequiredLabel>
                <select
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  onBlur={() => touch("employee")}
                  aria-invalid={Boolean(touched.employee && errors.employee)}
                >
                  <option value="">Select employee</option>
                  {employees
                    .filter(
                      (employee) =>
                        employee.isActive || String(employee.id) === employeeId,
                    )
                    .map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </option>
                    ))}
                </select>
                {touched.employee && errors.employee && (
                  <small>{errors.employee}</small>
                )}
              </label>
              <label>
                <RequiredLabel>Leave type</RequiredLabel>
                <select
                  value={leaveType}
                  onChange={(event) => setLeaveType(event.target.value)}
                  onBlur={() => touch("leaveType")}
                  aria-invalid={Boolean(touched.leaveType && errors.leaveType)}
                >
                  <option value="">Select leave type</option>
                  {editing && leaveType && !leaveTypes.includes(leaveType) && (
                    <option value={leaveType}>{leaveType}</option>
                  )}
                  {leaveTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {touched.leaveType && errors.leaveType && (
                  <small>{errors.leaveType}</small>
                )}
              </label>
              <label>
                <RequiredLabel>Leave date</RequiredLabel>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  onBlur={() => touch("date")}
                  aria-invalid={Boolean(touched.date && errors.date)}
                />
                {touched.date && errors.date && <small>{errors.date}</small>}
              </label>
              <label>
                <span>Status</span>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as EmployeeLeaveStatus)
                  }
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </label>
              <label>
                <RequiredLabel>Start time</RequiredLabel>
                <input
                  type="time"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  onBlur={() => touch("start")}
                  aria-invalid={Boolean(touched.start && errors.start)}
                />
                {touched.start && errors.start && <small>{errors.start}</small>}
              </label>
              <label>
                <RequiredLabel>End time</RequiredLabel>
                <input
                  type="time"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  onBlur={() => touch("end")}
                  aria-invalid={Boolean(touched.end && errors.end)}
                />
                {touched.end && errors.end && <small>{errors.end}</small>}
              </label>
              <label className="is-wide">
                <span>
                  Reason <small>Optional</small>
                </span>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Add a short reason"
                />
              </label>
              {error && <p className="leave-message">{error}</p>}
              <footer>
                <button type="button" onClick={close}>
                  Cancel
                </button>
                <button className="is-primary" disabled={busy}>
                  <CalendarClock />
                  {busy ? "Saving..." : "Save leave"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
    </div>
  );
};
export default EmployeeLeaveManagementPage;
