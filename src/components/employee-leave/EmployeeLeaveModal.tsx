import { Asterisk, CalendarClock, X } from "lucide-react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import type { Employee } from "../../types/employee";
import type {
  EmployeeLeave,
  EmployeeLeaveFormValues,
  EmployeeLeaveStatus,
} from "../../types/employeeLeave";
import {
  LEAVE_TYPES,
  validateLeaveForm,
  type EmployeeLeaveFormField,
} from "./employeeLeaveForm";

interface Props {
  editing: EmployeeLeave | null;
  employees: Employee[];
  values: EmployeeLeaveFormValues;
  touched: Partial<Record<EmployeeLeaveFormField, boolean>>;
  busy: boolean;
  error: string | null;
  onChange: Dispatch<SetStateAction<EmployeeLeaveFormValues>>;
  onTouch: (field: EmployeeLeaveFormField) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent) => void;
}

const RequiredLabel = ({ children }: { children: string }) => (
  <span className="leave-required">
    {children}
    <Asterisk aria-label="required" />
  </span>
);

const EmployeeLeaveModal = ({
  editing,
  employees,
  values,
  touched,
  busy,
  error,
  onChange,
  onTouch,
  onClose,
  onSubmit,
}: Props) => {
  const errors = validateLeaveForm(values);
  const update = <K extends keyof EmployeeLeaveFormValues>(
    field: K,
    value: EmployeeLeaveFormValues[K],
  ) => onChange((current) => ({ ...current, [field]: value }));
  const validation = (field: EmployeeLeaveFormField) =>
    touched[field] && errors[field] ? <small>{errors[field]}</small> : null;
  return (
    <div
      className="leave-modal"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="leave-dialog-title"
      >
        <header>
          <div>
            <h2 id="leave-dialog-title">
              {editing ? "Edit employee leave" : "Add employee leave"}
            </h2>
            <p>Required fields are marked below.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close">
            <X />
          </button>
        </header>
        <form noValidate onSubmit={onSubmit}>
          <label>
            <RequiredLabel>Employee</RequiredLabel>
            <select
              value={values.employeeId}
              onChange={(event) => update("employeeId", event.target.value)}
              onBlur={() => onTouch("employeeId")}
              aria-invalid={Boolean(touched.employeeId && errors.employeeId)}
            >
              <option value="">Select employee</option>
              {employees
                .filter(
                  (employee) =>
                    employee.isActive ||
                    String(employee.id) === values.employeeId,
                )
                .map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
            </select>
            {validation("employeeId")}
          </label>
          <label>
            <RequiredLabel>Leave type</RequiredLabel>
            <select
              value={values.leaveType}
              onChange={(event) => update("leaveType", event.target.value)}
              onBlur={() => onTouch("leaveType")}
              aria-invalid={Boolean(touched.leaveType && errors.leaveType)}
            >
              <option value="">Select leave type</option>
              {editing &&
                values.leaveType &&
                !LEAVE_TYPES.includes(
                  values.leaveType as (typeof LEAVE_TYPES)[number],
                ) && (
                  <option value={values.leaveType}>{values.leaveType}</option>
                )}
              {LEAVE_TYPES.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
            {validation("leaveType")}
          </label>
          <label>
            <RequiredLabel>Leave date</RequiredLabel>
            <input
              type="date"
              value={values.leaveDate}
              onChange={(event) => update("leaveDate", event.target.value)}
              onBlur={() => onTouch("leaveDate")}
              aria-invalid={Boolean(touched.leaveDate && errors.leaveDate)}
            />
            {validation("leaveDate")}
          </label>
          <label>
            <span>Status</span>
            <select
              value={values.status}
              onChange={(event) =>
                update("status", event.target.value as EmployeeLeaveStatus)
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
              value={values.startTime}
              onChange={(event) => update("startTime", event.target.value)}
              onBlur={() => onTouch("startTime")}
              aria-invalid={Boolean(touched.startTime && errors.startTime)}
            />
            {validation("startTime")}
          </label>
          <label>
            <RequiredLabel>End time</RequiredLabel>
            <input
              type="time"
              value={values.endTime}
              onChange={(event) => update("endTime", event.target.value)}
              onBlur={() => onTouch("endTime")}
              aria-invalid={Boolean(touched.endTime && errors.endTime)}
            />
            {validation("endTime")}
          </label>
          <label className="is-wide">
            <span>
              Reason <small>Optional</small>
            </span>
            <textarea
              value={values.reason}
              onChange={(event) => update("reason", event.target.value)}
              placeholder="Add a short reason"
            />
          </label>
          {error && (
            <p className="leave-message" role="alert">
              {error}
            </p>
          )}
          <footer>
            <button type="button" onClick={onClose}>
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
  );
};

export default EmployeeLeaveModal;
