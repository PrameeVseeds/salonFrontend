import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type { SaveServiceCategoryInput, ServiceCategoriesResponseData, ServiceCategoryResponseData } from "../types/service";

const ENDPOINT = "/service-categories";

export const getPublicServiceCategories = async (): Promise<ApiResponse<ServiceCategoriesResponseData>> =>
  (await axiosClient.get<ApiResponse<ServiceCategoriesResponseData>>(ENDPOINT)).data;

export const getServiceCategories = async (): Promise<ApiResponse<ServiceCategoriesResponseData>> =>
  (await adminAxiosClient.get<ApiResponse<ServiceCategoriesResponseData>>(ENDPOINT)).data;

export const createServiceCategory = async (input: SaveServiceCategoryInput): Promise<ApiResponse<ServiceCategoryResponseData>> =>
  (await adminAxiosClient.post<ApiResponse<ServiceCategoryResponseData>>(ENDPOINT, input)).data;

export const updateServiceCategory = async (id: number, input: SaveServiceCategoryInput): Promise<ApiResponse<ServiceCategoryResponseData>> =>
  (await adminAxiosClient.put<ApiResponse<ServiceCategoryResponseData>>(`${ENDPOINT}/${id}`, input)).data;

export const deleteServiceCategory = async (id: number): Promise<ApiMessageResponse> =>
  (await adminAxiosClient.delete<ApiMessageResponse>(`${ENDPOINT}/${id}`)).data;
