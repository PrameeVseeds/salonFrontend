import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  AppointmentListResponseData,
  AppointmentResponseData,
} from "../types/appointment";

const ENDPOINT = "/appointments";

export const getAppointments = async (): Promise<ApiResponse<AppointmentListResponseData>> =>
  (
    await adminAxiosClient.get<ApiResponse<AppointmentListResponseData>>(
      ENDPOINT,
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
