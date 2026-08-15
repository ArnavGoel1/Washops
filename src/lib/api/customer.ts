import { apiRequest } from "../apiClient";
import { Car, Schedule } from "@/Types";

export type CustomerUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
};

export type CustomerProfile = {
  _id: string;
  name?: string;
  user?: CustomerUser;
  phone?: string;
  email?: string;
  price?: number;
  notes?: string;
  address?: {
    _id: string;
    street: string;
    city?: string;
    state?: string;
    zipCode?: string;
  };
  carDetails: Car[];
  createdAt: string;
};

export function listCustomers() {
  return apiRequest<CustomerProfile[]>("/customers");
}

export function getCustomerById(id: string) {
  return apiRequest<{ customer: CustomerProfile; schedules: Schedule[] }>(
    "/customers/" + id
  );
}

export type CarInput = {
  type?: string;
  model?: string;
  company?: string;
  carNumber?: string;
};

export function createCustomer(input: {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  cars?: CarInput[];
  carType?: string;
  carModel?: string;
  carCompany?: string;
  carNumber?: string;
  schedule?: string;
  time?: string;
  price?: string | number;
  notes?: string;
}) {
  return apiRequest<{ customer: CustomerProfile; schedules?: Schedule[] }>(
    "/customers",
    {
      method: "POST",
      body: input,
    }
  );
}

export function getMyProfile() {
  return apiRequest<CustomerProfile>("/customers/me");
}

export function addCar(input: {
  model: string;
  company: string;
  color?: string;
  type?: string;
  carNumber: string;
}) {
  return apiRequest<Car>("/customers/me/cars", {
    method: "POST",
    body: input,
  });
}

export function listMyCars() {
  return apiRequest<Car[]>("/customers/me/cars");
}

export function createSchedule(input: {
  car: string;
  appointmentDate?: string;
  time?: string;
}) {
  return apiRequest<Schedule>("/customers/me/schedules", {
    method: "POST",
    body: input,
  });
}

export function listMySchedules() {
  return apiRequest<any[]>("/customers/me/schedules");
}

export function updateSchedule(
  id: string,
  input: Partial<{ status: string; appointmentDate: string; time: string }>
) {
  return apiRequest<Schedule>("/customers/me/schedules/" + id, {
    method: "PATCH",
    body: input,
  });
}
