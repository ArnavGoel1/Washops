import { apiRequest } from '../apiClient';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export function signup(input: {
  name: string;
  email: string;
  password: string;
  phone?: string;
}) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

export function login(input: { email: string; password: string }) {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: input,
    auth: false,
  });
}

export function validateToken() {
  return apiRequest<{ valid: boolean; user: AuthUser }>('/auth/validate', {
    method: 'GET',
  });
}
