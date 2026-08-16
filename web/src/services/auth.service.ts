import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { UserResponse } from '../types/user';

export const authService = {
  async register(data: any): Promise<ApiResponse<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }>> {
    return apiClient.post('/auth/register', data);
  },

  async login(data: any): Promise<ApiResponse<{ user: UserResponse; tokens: { accessToken: string; refreshToken: string } }>> {
    return apiClient.post('/auth/login', data);
  },

  async verifyPhone(data: { phoneOrEmail: string; code: string }): Promise<ApiResponse> {
    return apiClient.post('/auth/verify-phone', data);
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string; refreshToken: string }>> {
    return apiClient.post('/auth/refresh', { refreshToken });
  },

  async getMe(): Promise<ApiResponse<UserResponse>> {
    return apiClient.get('/users/me');
  },
};
