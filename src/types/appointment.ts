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
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  employeeName?: string | null;
  serviceName?: string;
  serviceDurationMinutes?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentListResponseData {
  appointments: Appointment[]
}

export interface AppointmentResponseData {
  appointment: Appointment
}

export interface AppointmentFilters {
  date?: string;
  status?: AppointmentStatus | "";
  search?: string;
}
