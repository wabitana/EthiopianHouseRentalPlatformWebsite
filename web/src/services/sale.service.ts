import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { SaleRequest } from '../types/sale';

export const saleService = {
  async submitRequest(data: { propertyId: string; offerPrice?: number; message?: string }): Promise<ApiResponse<SaleRequest>> {
    return apiClient.post('/sales/request', data);
  },

  async getMyRequests(): Promise<ApiResponse<SaleRequest[]>> {
    return apiClient.get('/sales/my-requests');
  },

  async getOwnerRequests(): Promise<ApiResponse<SaleRequest[]>> {
    return apiClient.get('/sales/owner-requests');
  },

  async respond(id: string, status: 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW' | 'LEGAL_PROCESS'): Promise<ApiResponse<SaleRequest>> {
    return apiClient.patch(`/sales/${id}/respond`, { status });
  },
};
