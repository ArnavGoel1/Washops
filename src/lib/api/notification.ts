import { apiRequest } from "../apiClient";

export type NotificationItem = {
  _id: string;
  title: string;
  message: string;
  type: "payment_due" | "payment_collected" | "booking" | "payment" | "system";
  amount?: number;
  customerName?: string;
  customer?: string | { _id: string; name?: string; phone?: string };
  payment?: string | { _id: string; rate?: number; status?: string };
  schedule?: string | { _id: string; time?: string };
  read: boolean;
  createdAt: string;
};

export function listMyNotifications() {
  return apiRequest<NotificationItem[]>("/notifications/me");
}

export function markNotificationRead(id: string) {
  return apiRequest<NotificationItem>("/notifications/" + id + "/read", {
    method: "PATCH",
  });
}

export function markAllNotificationsRead() {
  return apiRequest<{ message: string }>("/notifications/read-all", {
    method: "PATCH",
  });
}
