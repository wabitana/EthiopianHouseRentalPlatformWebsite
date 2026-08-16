import { apiClient } from './api';

export interface PropertyFilters {
  page?: number;
  limit?: number;
  listingType?: 'RENT' | 'SALE';
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  propertyType?: string;
  search?: string;
}

export const propertyService = {
  getPublicProperties: (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.append(k, String(v)); });
    return apiClient.get('/properties?' + params.toString());
  },

  getPropertyById: (id: string) => apiClient.get('/properties/' + id),

  getMyProperties: (filters: PropertyFilters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => { if (v !== undefined) params.append(k, String(v)); });
    return apiClient.get('/users/me/properties?' + params.toString(), true);
  },

  createProperty: (data: any) => apiClient.post('/properties', data, true),

  updateProperty: (id: string, data: any) => apiClient.put('/properties/' + id, data, true),

  deleteProperty: (id: string) => apiClient.delete('/properties/' + id, true),
};
