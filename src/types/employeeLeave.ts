export type EmployeeLeaveStatus = "pending" | "approved" | "rejected";
export interface EmployeeLeave {
  id: number;
  employeeId: number;
  leaveType: string;
  leaveDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: EmployeeLeaveStatus;
  createdAt: string;
}
export interface SaveEmployeeLeaveInput {
  employeeId: number;
  leaveType: string;
  leaveDate: string;
  startTime: string;
  endTime: string;
  reason: string | null;
  status: EmployeeLeaveStatus;
}
export interface EmployeeLeaveResponseData {
  leave: EmployeeLeave;
}
export interface EmployeeLeavesResponseData {
  leaves: EmployeeLeave[];
}
