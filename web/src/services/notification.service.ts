import { apiClient } from './api';

export const notificationService = {
  getMyNotifications: (page = 1) => apiClient.get('/notifications?page=' + page, true),
  markRead: (id: string) => apiClient.patch('/notifications/' + id + '/read', {}, true),
  markAllRead: () => apiClient.patch('/notifications/read-all', {}, true),
};
