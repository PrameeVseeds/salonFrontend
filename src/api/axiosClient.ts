import axios from "axios";

export const axiosClient = axios.create({
    baseURL: import.meta.env.DEV
        ? "/api"
        : import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || "/api",
});
