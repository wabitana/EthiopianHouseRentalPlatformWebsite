import { apiClient } from './api';

export const verificationService = {
  uploadIdentityDocument: (formData: FormData) =>
    apiClient.post('/verification/identity', formData, true),
  uploadPropertyDocument: (propertyId: string, formData: FormData) =>
    apiClient.post('/verification/property/' + propertyId, formData, true),
  getMyVerification: () => apiClient.get('/verification/my', true),
};
