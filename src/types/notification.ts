export type NotificationType = "Email" | "SMS" | "WhatsApp";
export type NotificationStatus = "Pending" | "Sent" | "Failed";

export interface AdminNotification {
  id: number;
  appointmentId: number;
  customerId: number;
  notificationType: NotificationType;
  title: string;
  message: string;
  sentStatus: NotificationStatus;
  sentAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponseData {
  notifications: AdminNotification[];
}

export interface NotificationResponseData {
  notification: AdminNotification;
}
