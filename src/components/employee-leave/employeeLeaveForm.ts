import type {
  EmployeeLeave,
  EmployeeLeaveFormValues,
  SaveEmployeeLeaveInput,
} from "../../types/employeeLeave";

export type EmployeeLeaveFormField =
  | "employeeId"
  | "leaveType"
  | "leaveDate"
  | "startTime"
  | "endTime";

export const LEAVE_TYPES = [
  "Annual leave",
  "Medical leave",
  "Casual leave",
  "Unpaid leave",
  "Other",
] as const;

export const EMPTY_LEAVE_FORM: EmployeeLeaveFormValues = {
  employeeId: "",
  leaveType: "",
  leaveDate: "",
  startTime: "00:00",
  endTime: "23:59",
  reason: "",
  status: "pending",
};

export const leaveToFormValues = (leave: EmployeeLeave): EmployeeLeaveFormValues => ({
  employeeId: String(leave.employeeId),
  leaveType: leave.leaveType,
  leaveDate: leave.leaveDate.slice(0, 10),
  startTime: leave.startTime.slice(0, 5),
  endTime: leave.endTime.slice(0, 5),
  reason: leave.reason ?? "",
  status: leave.status,
});

export const validateLeaveForm = (values: EmployeeLeaveFormValues) => ({
  employeeId: values.employeeId ? undefined : "Employee is required.",
  leaveType: values.leaveType.trim() ? undefined : "Leave type is required.",
  leaveDate: values.leaveDate ? undefined : "Leave date is required.",
  startTime: values.startTime ? undefined : "Start time is required.",
  endTime: !values.endTime
    ? "End time is required."
    : values.startTime && values.endTime <= values.startTime
      ? "End time must be later than start time."
      : undefined,
} satisfies Partial<Record<EmployeeLeaveFormField, string | undefined>>);

export const toSaveLeaveInput = (
  values: EmployeeLeaveFormValues,
): SaveEmployeeLeaveInput => ({
  ...values,
  employeeId: Number(values.employeeId),
  leaveType: values.leaveType.trim(),
  reason: values.reason.trim() || null,
});
