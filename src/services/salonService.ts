import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {SaveServiceInput, SaveSubServiceInput, ServiceResponseData, ServicesResponseData, SubService,} from "../types/service";

const SERVICE_ENDPOINT = "/services";

export const getPublicServices = async (): Promise<ApiResponse<ServicesResponseData>> =>
  (await axiosClient.get<ApiResponse<ServicesResponseData>>(SERVICE_ENDPOINT)).data;

export const uploadSalonServiceImage = async (
  image: File,
): Promise<ApiResponse<{ imageUrl: string }>> => {
  const formData = new FormData();
  formData.append("serviceImage", image);
  return (
    await adminAxiosClient.post<ApiResponse<{ imageUrl: string }>>(
      `${SERVICE_ENDPOINT}/image`,
      formData,
    )
  ).data;
};

export const getServices = async (): Promise<
  ApiResponse<ServicesResponseData>
> =>
  (
    await adminAxiosClient.get<ApiResponse<ServicesResponseData>>(
      SERVICE_ENDPOINT,
    )
  ).data;
export const createSalonService = async (
  input: SaveServiceInput,
): Promise<ApiResponse<ServiceResponseData>> =>
  (
    await adminAxiosClient.post<ApiResponse<ServiceResponseData>>(
      SERVICE_ENDPOINT,
      input,
    )
  ).data;
export const updateSalonService = async (
  id: number,
  input: SaveServiceInput,
): Promise<ApiResponse<ServiceResponseData>> =>
  (
    await adminAxiosClient.put<ApiResponse<ServiceResponseData>>(
      `${SERVICE_ENDPOINT}/${id}`,
      input,
    )
  ).data;
export const updateSalonServiceStatus = async (
  id: number,
  isActive: boolean,
): Promise<ApiResponse<ServiceResponseData>> =>
  (
    await adminAxiosClient.patch<ApiResponse<ServiceResponseData>>(
      `${SERVICE_ENDPOINT}/${id}/status`,
      { isActive },
    )
  ).data;
export const deleteSalonService = async (
  id: number,
): Promise<ApiMessageResponse> =>
  (
    await adminAxiosClient.delete<ApiMessageResponse>(
      `${SERVICE_ENDPOINT}/${id}`,
    )
  ).data;

export const createSubService = async (serviceId: number, input: SaveSubServiceInput): Promise<ApiResponse<{ subService: SubService }>> =>
  (await adminAxiosClient.post<ApiResponse<{ subService: SubService }>>(`${SERVICE_ENDPOINT}/${serviceId}/sub-services`, input)).data;

export const updateSubService = async (serviceId: number, id: number, input: SaveSubServiceInput): Promise<ApiResponse<{ subService: SubService }>> =>
  (await adminAxiosClient.put<ApiResponse<{ subService: SubService }>>(`${SERVICE_ENDPOINT}/${serviceId}/sub-services/${id}`, input)).data;

export const deleteSubService = async (serviceId: number, id: number): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${SERVICE_ENDPOINT}/${serviceId}/sub-services/${id}`)).data;
