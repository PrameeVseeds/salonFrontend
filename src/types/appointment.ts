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
  services?: Array<{
    serviceId: number;
    subServiceId?: number | null;
    serviceName: string;
    employeeId: number | null;
    employeeName: string | null;
    durationMinutes: number;
    startTime: string;
    endTime: string;
    price: number;
  }>;
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

export interface CreateCustomerAppointmentInput {
  serviceId: number;
  serviceIds: number[];
  subServiceIds?: Array<number | null>;
  employeeId: number | null;
  appointmentDate: string;
  startTime: string;
  notes: string | null;
}
