import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiResponse } from "../types/api";
import type { SalonSettingsResponseData, UpdateSalonSettingsInput } from "../types/settings";

const SETTINGS_ENDPOINT = "/settings";

export const getSalonSettings = async ():
    Promise<ApiResponse<SalonSettingsResponseData>> =>
    (await adminAxiosClient.get<ApiResponse<SalonSettingsResponseData>>(SETTINGS_ENDPOINT)).data;
export const updateSalonSettings = async (input: UpdateSalonSettingsInput):
    Promise<ApiResponse<SalonSettingsResponseData>> =>
    (await adminAxiosClient.put<ApiResponse<SalonSettingsResponseData>>(SETTINGS_ENDPOINT, input)).data;
export const updateSalonLogo = async (logo: File):
    Promise<ApiResponse<SalonSettingsResponseData>> => {
    const formData = new FormData();
    formData.append("logo", logo);
    return (await adminAxiosClient.patch<ApiResponse<SalonSettingsResponseData>>(`${SETTINGS_ENDPOINT}/logo`, formData)).data;
};
