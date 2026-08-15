import { prisma } from '../../config/database';
import { SubscriptionPlan, SubscriptionStatus, Prisma } from '@prisma/client';

export type SubscriptionWithPlan = Prisma.SubscriptionGetPayload<{ include: { plan: true } }>;

export class SubscriptionRepository {
  static async createPlan(data: {
    name: string;
    price: number;
    durationDays?: number;
    maxListings?: number;
    features?: string;
  }): Promise<SubscriptionPlan> {
    return prisma.subscriptionPlan.create({ data });
  }

  static async findPlanById(id: string): Promise<SubscriptionPlan | null> {
    return prisma.subscriptionPlan.findUnique({ where: { id } });
  }

  static async getActivePlans(): Promise<SubscriptionPlan[]> {
    return prisma.subscriptionPlan.findMany({ where: { isActive: true } });
  }

  static async createSubscription(data: {
    ownerId: string;
    planId: string;
    status: SubscriptionStatus;
  }): Promise<SubscriptionWithPlan> {
    return prisma.subscription.create({ data, include: { plan: true } });
  }

  static async findActiveSubscription(ownerId: string): Promise<SubscriptionWithPlan | null> {
    return prisma.subscription.findFirst({
      where: {
        ownerId,
        status: SubscriptionStatus.ACTIVE,
        endDate: { gte: new Date() },
      },
      include: { plan: true },
      orderBy: { endDate: 'desc' },
    });
  }

  static async activateSubscription(subscriptionId: string, durationDays: number): Promise<SubscriptionWithPlan> {
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + durationDays * 24 * 60 * 60 * 1000);

    return prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: SubscriptionStatus.ACTIVE,
        startDate,
        endDate,
      },
      include: { plan: true },
    });
  }
}
