import axios from "axios";

interface ApiErrorBody {
  message?: string;
}

export const getApiErrorMessage = (
  error: unknown,
  fallback = "Request failed.",
): string =>
  axios.isAxiosError<ApiErrorBody>(error)
    ? (error.response?.data?.message ?? fallback)
    : fallback;

export const hasApiStatus = (error: unknown, status: number): boolean =>
  axios.isAxiosError(error) && error.response?.status === status;
