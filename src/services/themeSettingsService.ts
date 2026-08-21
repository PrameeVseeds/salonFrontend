import { adminAxiosClient } from "../api/adminAxiosClient";
import { axiosClient } from "../api/axiosClient";
import type { ApiResponse } from "../types/api";
import type { HeroMediaType, ThemeSettingsResponseData, UpdateThemeSettingsInput } from "../types/themeSettings";

const THEME_ENDPOINT = "/theme-settings";

export const getThemeSettings = async (): 
Promise<ApiResponse<ThemeSettingsResponseData>> => (await adminAxiosClient.get<ApiResponse<ThemeSettingsResponseData>>(THEME_ENDPOINT)).data;
export const getPublicThemeSettings = async ():
Promise<ApiResponse<ThemeSettingsResponseData>> => (await axiosClient.get<ApiResponse<ThemeSettingsResponseData>>(THEME_ENDPOINT)).data;
export const updateThemeSettings = async (input: UpdateThemeSettingsInput): 
Promise<ApiResponse<ThemeSettingsResponseData>> => (await adminAxiosClient.put<ApiResponse<ThemeSettingsResponseData>>(THEME_ENDPOINT, input)).data;
export const updateHeroMedia = async (file: File, heroMediaType: HeroMediaType): 
Promise<ApiResponse<ThemeSettingsResponseData>> => {
    const formData = new FormData();
    formData.append("heroMedia", file);
    formData.append("heroMediaType", heroMediaType);
    return (await adminAxiosClient.patch<ApiResponse<ThemeSettingsResponseData>>(`${THEME_ENDPOINT}/hero-media`, formData)).data;
};
export const deleteHeroMedia = async (): 
Promise<ApiResponse<ThemeSettingsResponseData>> =>
    (await adminAxiosClient.delete<ApiResponse<ThemeSettingsResponseData>>(`${THEME_ENDPOINT}/hero-media`)).data;
