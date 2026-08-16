export type SubscriptionStatus = 'PENDING' | 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'FAILED';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  durationDays: number;
  maxListings: number;
  features: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  ownerId: string;
  planId: string;
  plan?: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate?: string | null;
  endDate?: string | null;
  createdAt: string;
}
