import { SubscriptionRepository } from './subscription.repository';
import { prisma } from '../../config/database';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { defaultPaymentProvider } from '../payments/chapa-simulation.provider';
import { CreatePlanDTO, SubscribeDTO } from './subscription.types';
import { SubscriptionStatus, PaymentStatus } from '@prisma/client';

export class SubscriptionService {
  static async createPlan(dto: CreatePlanDTO) {
    return SubscriptionRepository.createPlan({
      name: dto.name,
      price: dto.price,
      durationDays: dto.durationDays || 30,
      maxListings: dto.maxListings || 5,
      features: dto.features ? JSON.stringify(dto.features) : '[]',
    });
  }

  static async getActivePlans() {
    return SubscriptionRepository.getActivePlans();
  }

  static async getOwnerActiveSubscription(ownerId: string) {
    return SubscriptionRepository.findActiveSubscription(ownerId);
  }

  static async subscribeOwner(ownerId: string, userEmail: string, userName: string, dto: SubscribeDTO) {
    const plan = await SubscriptionRepository.findPlanById(dto.planId);
    if (!plan || !plan.isActive) {
      throw new NotFoundError('Subscription plan not found or inactive');
    }

    // Create subscription in PENDING state
    const subscription = await SubscriptionRepository.createSubscription({
      ownerId,
      planId: plan.id,
      status: SubscriptionStatus.PENDING,
    });

    // Initiate payment via Payment Provider Abstraction (Chapa simulation)
    const paymentResult = await defaultPaymentProvider.initializePayment({
      amount: plan.price,
      currency: 'ETB',
      email: userEmail,
      name: userName,
      txRef: `SUB-${subscription.id}-${Date.now()}`,
    });

    // Save payment record
    const payment = await prisma.payment.create({
      data: {
        ownerId,
        subscriptionId: subscription.id,
        amount: plan.price,
        currency: 'ETB',
        provider: defaultPaymentProvider.name,
        transactionRef: paymentResult.transactionRef,
        status: PaymentStatus.PENDING,
      },
    });

    return {
      subscription,
      payment,
      checkoutUrl: paymentResult.checkoutUrl,
    };
  }

  static async confirmPaymentAndActivate(transactionRef: string) {
    const payment = await prisma.payment.findUnique({
      where: { transactionRef },
      include: { subscription: { include: { plan: true } } },
    });

    if (!payment || !payment.subscription) {
      throw new NotFoundError('Payment record or associated subscription not found');
    }

    // Verify payment using abstraction
    const verification = await defaultPaymentProvider.verifyPayment(transactionRef);
    if (verification.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestError('Payment verification failed');
    }

    // Update payment status to SUCCESS
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.SUCCESS },
    });

    // Activate subscription using plan duration
    const activatedSubscription = await SubscriptionRepository.activateSubscription(
      payment.subscription.id,
      payment.subscription.plan.durationDays
    );

    return activatedSubscription;
  }
}
