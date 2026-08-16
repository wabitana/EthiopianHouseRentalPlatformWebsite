import { apiClient } from './api';
import { ApiResponse } from '../types/api';

export const notificationService = {
  async getUserNotifications(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/notifications');
  },

  async markAsRead(id: string): Promise<ApiResponse> {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },
};
