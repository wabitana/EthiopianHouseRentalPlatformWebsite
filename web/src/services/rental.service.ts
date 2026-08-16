import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { RentalRequest } from '../types/rental';

export const rentalService = {
  async submitRequest(data: { propertyId: string; message?: string; moveInDate?: string; durationMonths?: number }): Promise<ApiResponse<RentalRequest>> {
    return apiClient.post('/rentals/request', data);
  },

  async getMyRequests(): Promise<ApiResponse<RentalRequest[]>> {
    return apiClient.get('/rentals/my-requests');
  },

  async getOwnerRequests(): Promise<ApiResponse<RentalRequest[]>> {
    return apiClient.get('/rentals/owner-requests');
  },

  async respond(id: string, status: 'ACCEPTED' | 'REJECTED'): Promise<ApiResponse<RentalRequest>> {
    return apiClient.patch(`/rentals/${id}/respond`, { status });
  },
};
