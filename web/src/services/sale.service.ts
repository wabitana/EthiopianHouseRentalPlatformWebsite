import { apiClient } from './api';

export const saleService = {
  createRequest: (propertyId: string, data: any) =>
    apiClient.post('/sales/' + propertyId + '/requests', data, true),
  getMyRequests: (role?: 'owner' | 'buyer') =>
    apiClient.get('/sales/requests?role=' + (role || 'buyer'), true),
  acceptRequest: (id: string) => apiClient.patch('/sales/requests/' + id + '/accept', {}, true),
  rejectRequest: (id: string) => apiClient.patch('/sales/requests/' + id + '/reject', {}, true),
};
