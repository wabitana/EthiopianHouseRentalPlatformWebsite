import { SubscriptionStatus } from '@prisma/client';

export interface CreatePlanDTO {
  name: string;
  price: number;
  durationDays?: number;
  maxListings?: number;
  features?: string[];
}

export interface SubscribeDTO {
  planId: string;
}

export interface SubscriptionResponse {
  id: string;
  ownerId: string;
  plan: {
    id: string;
    name: string;
    price: number;
    maxListings: number;
  };
  status: SubscriptionStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
}
