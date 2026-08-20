export type AppointmentStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";

export interface Appointment {
  id: number;
  customerId: number;
  employeeId: number | null;
  serviceId: number;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  notes: string | null;
  status: AppointmentStatus;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResponseData {
  appointments: Appointment[]
}

export interface AppointmentResponseData {
  appointment: Appointment
}
