import axios from "axios";
import { getAdminToken } from "../utils/adminToken";

export const adminAxiosClient = axios.create({
    baseURL: import.meta.env.DEV
        ? "/api"
        : import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api",
});

adminAxiosClient.interceptors.request.use((config) => {
    const token = getAdminToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
