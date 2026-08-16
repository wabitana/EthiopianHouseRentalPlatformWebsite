export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FAILED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxListings: number;
  features: string[];
}

export interface Subscription {
  id: string;
  ownerId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  endDate: string;
  plan: SubscriptionPlan;
}
