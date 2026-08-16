import { apiClient } from './api';
import { ApiResponse } from '../types/api';

export const verificationService = {
  async uploadIdentity(formData: FormData): Promise<ApiResponse> {
    return apiClient.post('/verification/identity', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async uploadLicense(formData: FormData): Promise<ApiResponse> {
    return apiClient.post('/verification/license', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  async getPending(): Promise<ApiResponse<{ identities: any[]; licenses: any[] }>> {
    return apiClient.get('/verification/pending');
  },

  async reviewIdentity(id: string, status: string, rejectionReason?: string): Promise<ApiResponse> {
    return apiClient.patch(`/verification/identity/${id}/review`, { status, rejectionReason });
  },

  async reviewLicense(id: string, status: string, rejectionReason?: string): Promise<ApiResponse> {
    return apiClient.patch(`/verification/license/${id}/review`, { status, rejectionReason });
  },
};
