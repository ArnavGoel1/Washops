import { apiRequest } from "../apiClient";

export type PaymentItem = {
  _id: string;
  id: string;
  customer?: {
    _id: string;
    user?: {
      name: string;
      email: string;
      phone?: string;
    };
  };
  schedule?: {
    _id: string;
    time: string;
    appointmentDate: string;
    status: string;
    car?: {
      model: string;
      carNumber: string;
    };
  };
  rate: number;
  status: "pending" | "success" | "failed" | "refunded";
  createdAt: string;
};

export function listMyPayments() {
  return apiRequest<PaymentItem[]>("/payments");
}

export function checkout(input: { scheduleId: string; rate?: number }) {
  return apiRequest<PaymentItem>("/payments/checkout", {
    method: "POST",
    body: input,
  });
}

export function updatePaymentStatus(
  id: string,
  status: "success" | "failed" | "refunded"
) {
  return apiRequest<PaymentItem>("/payments/" + id + "/status", {
    method: "PATCH",
    body: { status },
  });
}
