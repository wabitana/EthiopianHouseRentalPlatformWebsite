"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscriptionService = exports.SubscriptionService = void 0;
const prisma_1 = require("../../prisma");
const payment_provider_1 = require("../payments/payment.provider");
class SubscriptionService {
    constructor(provider) {
        this.paymentProvider = provider || new payment_provider_1.ChapaSimulationProvider();
    }
    async getSubscriptionPlans() {
        return await prisma_1.prisma.subscriptionPlan.findMany({
            orderBy: { priceETB: 'asc' },
        });
    }
    async getUserSubscription(userId) {
        const activeSub = await prisma_1.prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: { gte: new Date() },
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
        });
        return activeSub;
    }
    async isOwnerSubscribed(userId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return false;
        if (user.role === 'admin')
            return true;
        const activeSub = await prisma_1.prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endDate: { gte: new Date() },
            },
        });
        return !!activeSub;
    }
    async subscribe(userId, planId) {
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const plan = await prisma_1.prisma.subscriptionPlan.findUnique({ where: { id: planId } });
        if (!plan)
            throw new Error('Subscription plan not found');
        // 1. Process Payment via Payment Provider abstraction (Chapa simulation)
        const paymentResult = await this.paymentProvider.initializePayment({
            userId,
            amountETB: plan.priceETB,
            email: user.email,
            phone: user.phone,
            title: `${plan.name} Owner Subscription Plan`,
        });
        if (!paymentResult.success) {
            throw new Error('Payment processing failed');
        }
        // 2. Create Active Subscription Record
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(startDate.getDate() + plan.durationDays);
        const subscription = await prisma_1.prisma.subscription.create({
            data: {
                userId,
                planId: plan.id,
                status: 'ACTIVE',
                startDate,
                endDate,
            },
            include: { plan: true },
        });
        // 3. Record Payment
        await prisma_1.prisma.payment.create({
            data: {
                userId,
                subscriptionId: subscription.id,
                amountETB: plan.priceETB,
                paymentMethod: this.paymentProvider.name,
                reference: paymentResult.reference,
                status: 'SUCCESS',
            },
        });
        // 4. Send Notification
        await prisma_1.prisma.notification.create({
            data: {
                userId,
                title: 'Subscription Activated! 🎉',
                message: `Your ${plan.name} plan is now active until ${endDate.toLocaleDateString()}. You can now post properties for rent or sale!`,
                type: 'SUBSCRIPTION',
            },
        });
        return {
            subscription,
            payment: paymentResult,
        };
    }
}
exports.SubscriptionService = SubscriptionService;
exports.subscriptionService = new SubscriptionService();
