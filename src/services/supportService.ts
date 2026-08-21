import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse } from "../types/api";
import type { SupportRequestInput } from "../types/support";

export const sendSupportRequest = async (input: SupportRequestInput,): Promise<ApiMessageResponse> => {
  const response = await axiosClient.post<ApiMessageResponse>(
    "/support/contact",
    input,
  );
  return response.data;
};
