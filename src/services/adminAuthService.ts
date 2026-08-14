import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiMessageResponse, ApiResponse } from "../types/api";
import type {
    AdminLoginInput,
    AdminLoginResult,
    AdminProfileResponseData,
    ChangeAdminPasswordInput,
    SuperAdminDashboardResponseData,
    UpdateAdminProfileInput,
} from "../types/admin";
import { removeAdminToken, setAdminToken } from "../utils/adminToken";

const AUTH_ENDPOINT = "/auth";

export const loginAdmin = async (
    input: AdminLoginInput,
    rememberMe = true,
): Promise<ApiResponse<AdminLoginResult>> => {
    const response = await axiosClient.post<ApiResponse<AdminLoginResult>>(`${AUTH_ENDPOINT}/login`, input);
    setAdminToken(response.data.data.token, rememberMe);
    return response.data;
};

export const getAdminProfile = async (): Promise<ApiResponse<AdminProfileResponseData>> => {
    const response = await adminAxiosClient.get<ApiResponse<AdminProfileResponseData>>(`${AUTH_ENDPOINT}/profile`);
    return response.data;
};

export const updateAdminProfile = async (input: UpdateAdminProfileInput): 
Promise<ApiResponse<AdminProfileResponseData>> => {
    const response = await adminAxiosClient.put<ApiResponse<AdminProfileResponseData>>(
        `${AUTH_ENDPOINT}/profile`,
        input,
    );
    return response.data;
};

export const changeAdminPassword = async (input: ChangeAdminPasswordInput,): Promise<ApiMessageResponse> => {
    const response = await adminAxiosClient.patch<ApiMessageResponse>(
        `${AUTH_ENDPOINT}/change-password`,
        input,
    );
    return response.data;
};

export const getSuperAdminDashboard = async (): Promise<ApiResponse<SuperAdminDashboardResponseData>> => {
    const response = await adminAxiosClient.get<ApiResponse<SuperAdminDashboardResponseData>>(
        `${AUTH_ENDPOINT}/super-admin-dashboard`,
    );
    return response.data;
};

export const logoutAdmin = (): void => {
    removeAdminToken();
};
