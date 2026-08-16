import { apiClient } from './api';
import { ApiResponse } from '../types/api';
import { SubscriptionPlan, Subscription } from '../types/subscription';

export const subscriptionService = {
  async getPlans(): Promise<ApiResponse<SubscriptionPlan[]>> {
    return apiClient.get('/subscriptions/plans');
  },

  async getMySubscription(): Promise<ApiResponse<Subscription>> {
    return apiClient.get('/subscriptions/my-subscription');
  },

  async subscribe(planId: string): Promise<ApiResponse<{ subscription: Subscription; checkoutUrl: string }>> {
    return apiClient.post('/subscriptions/subscribe', { planId });
  },

  async confirmPayment(txRef: string): Promise<ApiResponse<Subscription>> {
    return apiClient.post('/subscriptions/confirm-payment', { txRef });
  },
};
