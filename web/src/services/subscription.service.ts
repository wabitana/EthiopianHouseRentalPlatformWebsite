import { apiClient } from './api';

export const subscriptionService = {
  getPlans: () => apiClient.get('/subscriptions/plans'),
  getMySubscription: () => apiClient.get('/subscriptions/my', true),
  subscribe: (planId: string) => apiClient.post('/subscriptions', { planId }, true),
  cancelSubscription: () => apiClient.delete('/subscriptions/my', true),
};
