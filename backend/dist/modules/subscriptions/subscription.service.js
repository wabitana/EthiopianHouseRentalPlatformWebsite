"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const subscription_repository_1 = require("./subscription.repository");
const database_1 = require("../../config/database");
const errors_1 = require("../../utils/errors");
const chapa_simulation_provider_1 = require("../payments/chapa-simulation.provider");
const client_1 = require("@prisma/client");
class SubscriptionService {
    static async createPlan(dto) {
        return subscription_repository_1.SubscriptionRepository.createPlan({
            name: dto.name,
            price: dto.price,
            durationDays: dto.durationDays || 30,
            maxListings: dto.maxListings || 5,
            features: dto.features ? JSON.stringify(dto.features) : '[]',
        });
    }
    static async getActivePlans() {
        return subscription_repository_1.SubscriptionRepository.getActivePlans();
    }
    static async getOwnerActiveSubscription(ownerId) {
        return subscription_repository_1.SubscriptionRepository.findActiveSubscription(ownerId);
    }
    static async subscribeOwner(ownerId, userEmail, userName, dto) {
        const plan = await subscription_repository_1.SubscriptionRepository.findPlanById(dto.planId);
        if (!plan || !plan.isActive) {
            throw new errors_1.NotFoundError('Subscription plan not found or inactive');
        }
        // Create subscription in PENDING state
        const subscription = await subscription_repository_1.SubscriptionRepository.createSubscription({
            ownerId,
            planId: plan.id,
            status: client_1.SubscriptionStatus.PENDING,
        });
        // Initiate payment via Payment Provider Abstraction (Chapa simulation)
        const paymentResult = await chapa_simulation_provider_1.defaultPaymentProvider.initializePayment({
            amount: plan.price,
            currency: 'ETB',
            email: userEmail,
            name: userName,
            txRef: `SUB-${subscription.id}-${Date.now()}`,
        });
        // Save payment record
        const payment = await database_1.prisma.payment.create({
            data: {
                ownerId,
                subscriptionId: subscription.id,
                amount: plan.price,
                currency: 'ETB',
                provider: chapa_simulation_provider_1.defaultPaymentProvider.name,
                transactionRef: paymentResult.transactionRef,
                status: client_1.PaymentStatus.PENDING,
            },
        });
        return {
            subscription,
            payment,
            checkoutUrl: paymentResult.checkoutUrl,
        };
    }
    static async confirmPaymentAndActivate(transactionRef) {
        const payment = await database_1.prisma.payment.findUnique({
            where: { transactionRef },
            include: { subscription: { include: { plan: true } } },
        });
        if (!payment || !payment.subscription) {
            throw new errors_1.NotFoundError('Payment record or associated subscription not found');
        }
        // Verify payment using abstraction
        const verification = await chapa_simulation_provider_1.defaultPaymentProvider.verifyPayment(transactionRef);
        if (verification.status !== client_1.PaymentStatus.SUCCESS) {
            throw new errors_1.BadRequestError('Payment verification failed');
        }
        // Update payment status to SUCCESS
        await database_1.prisma.payment.update({
            where: { id: payment.id },
            data: { status: client_1.PaymentStatus.SUCCESS },
        });
        // Activate subscription using plan duration
        const activatedSubscription = await subscription_repository_1.SubscriptionRepository.activateSubscription(payment.subscription.id, payment.subscription.plan.durationDays);
        return activatedSubscription;
    }
}
exports.SubscriptionService = SubscriptionService;
