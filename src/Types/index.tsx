// Mirrors backend models: CarDetails, Schedule, Payment (see /src/models on backend)

export type CarType = 'hatchback' | 'sedan' | 'suv' | 'other';

export type Car = {
  id: string;
  model: string;
  company: string;
  color?: string;
  type: CarType;
  carNumber: string;
};

export type ScheduleStatus =
  | 'pending'
  | 'confirmed'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export type Schedule = {
  id: string;
  car: Car;
  customer: string; // customer id
  appointmentDate: string; // ISO date string
  time: string;
  status: ScheduleStatus;
};

export type PaymentStatus = 'pending' | 'success' | 'failed' | 'refunded';

export type Payment = {
  id: string;
  schedule: string; // schedule id
  rate: number;
  status: PaymentStatus;
};

export type Order = {
  id: string;
  tag: string;
  customer: string;
  customerName: string;
  phone: string;
  car: Car;
  appointmentDate: string;
  time: string;
  status: ScheduleStatus;
  preferences?: string[];
};
