import { apiClient } from './api';

export const rentalService = {
  createRequest: (propertyId: string, data: any) =>
    apiClient.post('/rentals/' + propertyId + '/requests', data, true),
  getMyRequests: (role?: 'owner' | 'renter') =>
    apiClient.get('/rentals/requests?role=' + (role || 'renter'), true),
  acceptRequest: (id: string) => apiClient.patch('/rentals/requests/' + id + '/accept', {}, true),
  rejectRequest: (id: string) => apiClient.patch('/rentals/requests/' + id + '/reject', {}, true),
};
