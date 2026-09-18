import { customerAxiosClient } from "../api/customerAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  AiConsultationResponseData,
  ConsultationRequestType,
} from "../types/aiConsultation";
export const createAiConsultation = async (
  image: File,
  requestType: ConsultationRequestType,
  preference: string,
): Promise<ApiResponse<AiConsultationResponseData>> => {
  const formData = new FormData();
  formData.append("image", image);
  formData.append("requestType", requestType);
  if (preference.trim()) formData.append("preference", preference.trim());
  return (
    await customerAxiosClient.post<ApiResponse<AiConsultationResponseData>>(
      "/ai-consultation",
      formData,
    )
  ).data;
};
