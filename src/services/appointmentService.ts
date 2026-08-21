import { adminAxiosClient } from "../api/adminAxiosClient";
import { customerAxiosClient } from "../api/customerAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  AppointmentListResponseData,
  AppointmentResponseData,
  AppointmentFilters,
} from "../types/appointment";

const ENDPOINT = "/appointments";

export const getCustomerAppointments = async (): Promise<ApiResponse<AppointmentListResponseData>> =>
  (await customerAxiosClient.get<ApiResponse<AppointmentListResponseData>>(ENDPOINT)).data;

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

export const cancelAppointment = async (id: number, reason: string): Promise<ApiResponse<AppointmentResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<AppointmentResponseData>>(
      `${ENDPOINT}/${id}/cancel`,
      { reason },
    )
  ).data;
