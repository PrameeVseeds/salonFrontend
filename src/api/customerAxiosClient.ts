import axios from "axios";
import { getCustomerToken } from "../utils/customerToken";

export const customerAxiosClient = axios.create({
    baseURL: import.meta.env.DEV
        ? "/api"
        : import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api",
});

customerAxiosClient.interceptors.request.use((config) => {
    const token = getCustomerToken();

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});
