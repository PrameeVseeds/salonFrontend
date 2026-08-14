import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
    Admin,
    AdminResponseData,
    CreateAdminInput,
    ResetAdminPasswordInput,
    UpdateAdminInput,
    UpdateAdminStatusInput,
} from "../types/admin";

const ADMIN_ENDPOINT = "/admins";

export const createAdmin = async (input: CreateAdminInput): Promise<ApiResponse<Admin | null>> => {
    const response = await adminAxiosClient.post<ApiResponse<Admin | null>>(`${ADMIN_ENDPOINT}/create`, input);
    return response.data;
};

export const getAdmins = async (): Promise<ApiResponse<Admin[]>> => {
    const response = await adminAxiosClient.get<ApiResponse<Admin[]>>(ADMIN_ENDPOINT);
    return response.data;
};

export const getAdminById = async (adminId: number): Promise<ApiResponse<AdminResponseData>> => {
    const response = await adminAxiosClient.get<ApiResponse<AdminResponseData>>(`${ADMIN_ENDPOINT}/${adminId}`);
    return response.data;
};

export const updateAdmin = async (adminId: number,input: UpdateAdminInput,): Promise<ApiResponse<AdminResponseData>> => {
    const response = await adminAxiosClient.put<ApiResponse<AdminResponseData>>(
        `${ADMIN_ENDPOINT}/${adminId}`,
        input,
    );
    return response.data;
};

export const updateAdminStatus = async (adminId: number,input: UpdateAdminStatusInput): Promise<ApiResponse<AdminResponseData>> => {
    const response = await adminAxiosClient.patch<ApiResponse<AdminResponseData>>(
        `${ADMIN_ENDPOINT}/${adminId}/status`,
        input,
    );
    return response.data;
};

export const resetAdminPassword = async (adminId: number,input: ResetAdminPasswordInput,): Promise<ApiMessageResponse> => {
    const response = await adminAxiosClient.patch<ApiMessageResponse>(
        `${ADMIN_ENDPOINT}/${adminId}/reset-password`,
        input,
    );
    return response.data;
};

export const deleteAdmin = async (adminId: number): Promise<ApiMessageResponse> => {
    const response = await adminAxiosClient.delete<ApiMessageResponse>(`${ADMIN_ENDPOINT}/${adminId}`);
    return response.data;
};
