import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type { ServicesResponseData } from "../types/service";

const employeeServicesEndpoint = (employeeId: number) =>
  `/employees/${employeeId}/services`;

export const getAssignedEmployeeServices = async (
  employeeId: number,
): Promise<ApiResponse<ServicesResponseData>> =>
  (
    await adminAxiosClient.get<ApiResponse<ServicesResponseData>>(
      employeeServicesEndpoint(employeeId),
    )
  ).data;

export const assignServiceToEmployee = async (employeeId: number, serviceId: number,):
  Promise<ApiMessageResponse> =>
  (
    await adminAxiosClient.post<ApiMessageResponse>(
      `${employeeServicesEndpoint(employeeId)}/${serviceId}`,
    )
  ).data;

export const removeServiceFromEmployee = async (employeeId: number, serviceId: number,):
  Promise<ApiMessageResponse> =>
  (
    await adminAxiosClient.delete<ApiMessageResponse>(
      `${employeeServicesEndpoint(employeeId)}/${serviceId}`,
    )
  ).data;
