import { adminAxiosClient } from "../api/adminAxiosClient";
import type { ApiResponse } from "../types/api";
import type {
  NotificationResponseData,
  NotificationsResponseData,
} from "../types/notification";

const NOTIFICATIONS_ENDPOINT = "/notifications";

export const getAdminNotifications = async (): Promise<ApiResponse<NotificationsResponseData>> => {
  const response = await adminAxiosClient.get<
    ApiResponse<NotificationsResponseData>
  >(NOTIFICATIONS_ENDPOINT);
  return response.data;
};

export const retryAdminNotification = async (notificationId: number,):
  Promise<ApiResponse<NotificationResponseData>> => {
  const response = await adminAxiosClient.post<
    ApiResponse<NotificationResponseData>
  >(`${NOTIFICATIONS_ENDPOINT}/${notificationId}/retry`);
  return response.data;
};
