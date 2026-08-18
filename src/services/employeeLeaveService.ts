import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
  EmployeeLeaveResponseData,
  EmployeeLeavesResponseData,
  SaveEmployeeLeaveInput,
} from "../types/employeeLeave";
const ENDPOINT = "/employee-leaves";
export const getEmployeeLeaves = async (): Promise<
  ApiResponse<EmployeeLeavesResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<EmployeeLeavesResponseData>>(
      ENDPOINT,
    )
  ).data;
export const createEmployeeLeave = async (
  input: SaveEmployeeLeaveInput,
): Promise<ApiResponse<EmployeeLeaveResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<EmployeeLeaveResponseData>>(
      ENDPOINT,
      input,
    )
  ).data;
export const updateEmployeeLeave = async (
  id: number,
  input: SaveEmployeeLeaveInput,
): Promise<ApiResponse<EmployeeLeaveResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<EmployeeLeaveResponseData>>(
      `${ENDPOINT}/${id}`,
      input,
    )
  ).data;
export const deleteEmployeeLeave = async (
  id: number,
): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${ENDPOINT}/${id}`)).data;
