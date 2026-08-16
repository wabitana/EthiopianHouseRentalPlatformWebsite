import { apiClient } from './api';

export const analyticsService = {
  getAdminStats: () => apiClient.get('/analytics/stats', true),
  getUserGrowth: (period?: string) => apiClient.get('/analytics/users?period=' + (period || '30d'), true),
  getPropertyStats: () => apiClient.get('/analytics/properties', true),
  getRevenueStats: () => apiClient.get('/analytics/revenue', true),
};
