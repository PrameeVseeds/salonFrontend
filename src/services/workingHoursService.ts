import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  SaveWorkingHoursInput,
  WorkingHoursListResponseData,
  WorkingHoursResponseData,
} from "../types/workingHours";
const ENDPOINT = "/working-hours";
export const getWorkingHours = async (): Promise<
  ApiResponse<WorkingHoursListResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<WorkingHoursListResponseData>>(
      ENDPOINT,
    )
  ).data;
export const createWorkingHours = async (
  input: SaveWorkingHoursInput,
): Promise<ApiResponse<WorkingHoursResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<WorkingHoursResponseData>>(
      ENDPOINT,
      input,
    )
  ).data;
export const updateWorkingHours = async (
  id: number,
  input: SaveWorkingHoursInput,
): Promise<ApiResponse<WorkingHoursResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<WorkingHoursResponseData>>(
      `${ENDPOINT}/${id}`,
      input,
    )
  ).data;
export const updateWorkingHoursStatus = async (
  id: number,
  isClosed: boolean,
): Promise<ApiResponse<WorkingHoursResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<WorkingHoursResponseData>>(
      `${ENDPOINT}/${id}/status`,
      { isClosed },
    )
  ).data;
