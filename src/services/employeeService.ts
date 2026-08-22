import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {EmployeeImageResponseData,EmployeeResponseData,EmployeesResponseData,SaveEmployeeInput,} from "../types/employee";

const EMPLOYEE_ENDPOINT = "/employees";
export const getPublicEmployees = async (): Promise<ApiResponse<EmployeesResponseData>> =>
  (await axiosClient.get<ApiResponse<EmployeesResponseData>>(EMPLOYEE_ENDPOINT)).data;

export const getEmployees = async (): Promise<
  ApiResponse<EmployeesResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<EmployeesResponseData>>(
      EMPLOYEE_ENDPOINT,
    )
  ).data;
export const registerEmployee = async (
  input: SaveEmployeeInput,
): Promise<ApiResponse<EmployeeResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<EmployeeResponseData>>(
      `${EMPLOYEE_ENDPOINT}/register`,
      input,
    )
  ).data;
export const updateEmployee = async (
  id: number,
  input: SaveEmployeeInput,
): Promise<ApiResponse<EmployeeResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<EmployeeResponseData>>(
      `${EMPLOYEE_ENDPOINT}/${id}/profile`,
      input,
    )
  ).data;
export const updateEmployeeStatus = async (
  id: number,
  isActive: boolean,
): Promise<ApiResponse<EmployeeResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<EmployeeResponseData>>(
      `${EMPLOYEE_ENDPOINT}/${id}/status`,
      { isActive },
    )
  ).data;
export const uploadEmployeeProfileImage = async (
  id: number,
  image: File,
): Promise<ApiResponse<EmployeeImageResponseData>> => {
  const formData = new FormData();
  formData.append("profileImage", image);
  return (
    await adminAxiosClient.patch<ApiResponse<EmployeeImageResponseData>>(
      `${EMPLOYEE_ENDPOINT}/${id}/profile/image`,
      formData,
    )
  ).data;
};
export const deleteEmployee = async (id: number): Promise<ApiMessageResponse> =>
  (
    await adminAxiosClient.delete<ApiMessageResponse>(
      `${EMPLOYEE_ENDPOINT}/${id}`,
    )
  ).data;
