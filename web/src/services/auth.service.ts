import { apiClient } from './api';

export interface LoginInput {
  emailOrPhone: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  roles: string[];
}

export const authService = {
  login: (data: LoginInput) => apiClient.post('/auth/login', data),
  register: (data: RegisterInput) => apiClient.post('/auth/register', data),
  logout: () => apiClient.post('/auth/logout', {}, true),
  refreshToken: (refreshToken: string) => apiClient.post('/auth/refresh', { refreshToken }),
  getMe: () => apiClient.get('/auth/me', true),
};
