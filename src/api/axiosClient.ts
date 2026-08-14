import axios from "axios";
import { getCustomerToken } from "../utils/customerToken";

export const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "/api",
});

axiosClient.interceptors.request.use((config) => {
    const token = getCustomerToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});
