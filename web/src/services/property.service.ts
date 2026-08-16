import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { Property } from '../types/property';

export const propertyService = {
  async getPublished(page = 1, limit = 10): Promise<ApiResponse<Property[]>> {
    return apiClient.get(`/properties/published?page=${page}&limit=${limit}`);
  },

  async getById(id: string): Promise<ApiResponse<Property>> {
    return apiClient.get(`/properties/${id}`);
  },

  async create(data: any): Promise<ApiResponse<Property>> {
    return apiClient.post('/properties', data);
  },

  async update(id: string, data: any): Promise<ApiResponse<Property>> {
    return apiClient.patch(`/properties/${id}`, data);
  },

  async search(params: Record<string, any>): Promise<ApiResponse<Property[]>> {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/search?${query}`);
  },
};
