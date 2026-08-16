import { apiClient } from './api';
import { ApiResponse } from '../types/api';

export const analyticsService = {
  async getAdminStats(): Promise<ApiResponse<any>> {
    return apiClient.get('/admin/stats');
  },

  async getAuditLogs(): Promise<ApiResponse<any[]>> {
    return apiClient.get('/admin/audit-logs');
  },
};
