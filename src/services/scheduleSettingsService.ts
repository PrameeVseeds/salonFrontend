import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
  BusinessBreakResponseData,
  BusinessBreaksResponseData,
  ClosedDateResponseData,
  ClosedDatesResponseData,
  SaveBusinessBreakInput,
  SaveClosedDateInput,
} from "../types/scheduleSettings";

const BREAKS = "/business-breaks";
const CLOSED_DATES = "/closed-dates";
export const getBusinessBreaks = async (): Promise<
  ApiResponse<BusinessBreaksResponseData>
> =>
  (await adminAxiosClient.get<ApiResponse<BusinessBreaksResponseData>>(BREAKS))
    .data;
export const createBusinessBreak = async (
  input: SaveBusinessBreakInput,
): Promise<ApiResponse<BusinessBreakResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<BusinessBreakResponseData>>(
      BREAKS,
      input,
    )
  ).data;
export const updateBusinessBreak = async (
  id: number,
  input: SaveBusinessBreakInput,
): Promise<ApiResponse<BusinessBreakResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<BusinessBreakResponseData>>(
      `${BREAKS}/${id}`,
      input,
    )
  ).data;
export const deleteBusinessBreak = async (
  id: number,
): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${BREAKS}/${id}`)).data;
export const getClosedDates = async (): Promise<
  ApiResponse<ClosedDatesResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<ClosedDatesResponseData>>(
      CLOSED_DATES,
    )
  ).data;
export const createClosedDate = async (
  input: SaveClosedDateInput,
): Promise<ApiResponse<ClosedDateResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<ClosedDateResponseData>>(
      CLOSED_DATES,
      input,
    )
  ).data;
export const updateClosedDate = async (
  id: number,
  input: SaveClosedDateInput,
): Promise<ApiResponse<ClosedDateResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<ClosedDateResponseData>>(
      `${CLOSED_DATES}/${id}`,
      input,
    )
  ).data;
export const deleteClosedDate = async (
  id: number,
): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${CLOSED_DATES}/${id}`))
    .data;
