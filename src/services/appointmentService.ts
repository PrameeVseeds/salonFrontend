import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import { customerAxiosClient } from "../api/customerAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  AppointmentListResponseData,
  AppointmentResponseData,
  AppointmentFilters,
  CreateAdminAppointmentInput,
  CreateCustomerAppointmentInput,
} from "../types/appointment";

const ENDPOINT = "/appointments";

export const getCustomerAppointments = async (): Promise<ApiResponse<AppointmentListResponseData>> =>
  (await customerAxiosClient.get<ApiResponse<AppointmentListResponseData>>(`${ENDPOINT}/my`)).data;

export const createCustomerAppointment = async (input: CreateCustomerAppointmentInput): Promise<ApiResponse<AppointmentResponseData>> =>
  (await customerAxiosClient.post<ApiResponse<AppointmentResponseData>>(ENDPOINT, input)).data;

export const createAdminAppointment = async (input: CreateAdminAppointmentInput): Promise<ApiResponse<AppointmentResponseData>> =>
  (await adminAxiosClient.post<ApiResponse<AppointmentResponseData>>(`${ENDPOINT}/admin`, input)).data;

export const cancelCustomerAppointment = async (id: number, reason: string): Promise<ApiResponse<AppointmentResponseData>> =>
  (await customerAxiosClient.patch<ApiResponse<AppointmentResponseData>>(`${ENDPOINT}/my/${id}/cancel`, { reason })).data;

export const getAvailableAppointmentSlots = async (serviceIds: number | number[], employeeId: number | null, date: string, subServiceIds: Array<number | null> = []): Promise<
  {
     slots: string[]; 
     message: string | null; 
     slotDetails: Record<string, 
     { 
      serviceLimit: number; 
      bookedCount: number; 
      availableEmployees: number; 
      remainingCapacity: number; 
      limitingReason: "service_capacity" | "employee_availability" | "both" | null 
    }>
   }
> => {
  const selectedServiceIds = Array.isArray(serviceIds) ? serviceIds : [serviceIds];
  const response = await customerAxiosClient.get<ApiResponse<{
    availableSlots?: string[]; slots?: string[];
    slotDetails?: Record<string, { 
      serviceLimit: number; 
      bookedCount: number; 
      availableEmployees: number; 
      remainingCapacity: number; 
      limitingReason: "service_capacity" | "employee_availability" | "both" | null 
    }>;
    availabilityMessage?: string | null
  }>>(`${ENDPOINT}/available-slots`, {
    params: { serviceIds: selectedServiceIds.join(","), ...(subServiceIds.length ? { subServiceIds: subServiceIds.map((id) => id ?? "").join(",") } : {}), ...(employeeId === null ? {} : { employeeId }), date },
  });
  return {
    slots: response.data.data.availableSlots ?? response.data.data.slots ?? [],
    message: response.data.data.availabilityMessage ?? null,
    slotDetails: response.data.data.slotDetails ?? {},
  };
};

export const getAvailableAdminAppointmentSlots = async (
  serviceId: number,
  employeeId: number | null,
  date: string,
): Promise<string[]> => {
  // Slot availability is public; using the admin client here sends an admin JWT
  // to the customer-only endpoint and results in a 403 response.
  const response = await axiosClient.get<ApiResponse<{ availableSlots?: string[]; slots?: string[] }>>(
    `${ENDPOINT}/available-slots`,
    { params: { serviceIds: String(serviceId), ...(employeeId === null ? {} : { employeeId }), date } },
  );
  return response.data.data.availableSlots ?? response.data.data.slots ?? [];
};

export const getAppointments = async (filters: AppointmentFilters = {}): Promise<ApiResponse<AppointmentListResponseData>> =>
  (
    await adminAxiosClient.get<ApiResponse<AppointmentListResponseData>>(
      ENDPOINT,
      { params: filters },
    )
  ).data;

export const startAppointment = async (id: number,): Promise<ApiResponse<AppointmentResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<AppointmentResponseData>>(
      `${ENDPOINT}/${id}/start`,
    )
  ).data;

export const completeAppointment = async (id: number,): Promise<ApiResponse<AppointmentResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<AppointmentResponseData>>(
      `${ENDPOINT}/${id}/complete`,
    )
  ).data;

export const assignAppointmentEmployee = async (id: number, employeeId: number, serviceId?: number): Promise<ApiResponse<AppointmentResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<AppointmentResponseData>>(
      `${ENDPOINT}/${id}/employee`,
      { employeeId, ...(serviceId ? { serviceId } : {}) },
    )
  ).data;

export const getAvailableAppointmentEmployees = async (id: number, serviceId?: number): Promise<ApiResponse<{ employeeIds: number[] }>> =>
  (
    await adminAxiosClient.get<ApiResponse<{ employeeIds: number[] }>>(
      `${ENDPOINT}/${id}/available-employees`,
      { params: serviceId ? { serviceId } : undefined },
    )
  ).data;

export const cancelAppointment = async (id: number, reason: string): Promise<ApiResponse<AppointmentResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<AppointmentResponseData>>(
      `${ENDPOINT}/${id}/cancel`,
      { reason },
    )
  ).data;
