"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionController = void 0;
const subscription_service_1 = require("./subscription.service");
const response_1 = require("../../utils/response");
class SubscriptionController {
    static async createPlan(req, res, next) {
        try {
            const plan = await subscription_service_1.SubscriptionService.createPlan(req.body);
            (0, response_1.sendSuccess)(res, plan, 'Subscription plan created', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlans(req, res, next) {
        try {
            const plans = await subscription_service_1.SubscriptionService.getActivePlans();
            (0, response_1.sendSuccess)(res, plans, 'Active subscription plans retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMySubscription(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const sub = await subscription_service_1.SubscriptionService.getOwnerActiveSubscription(ownerId);
            (0, response_1.sendSuccess)(res, sub, 'Active subscription details retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async subscribe(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const userEmail = req.user.email;
            const result = await subscription_service_1.SubscriptionService.subscribeOwner(ownerId, userEmail, userEmail, req.body);
            (0, response_1.sendSuccess)(res, result, 'Subscription order initialized', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async confirmPayment(req, res, next) {
        try {
            const txRef = req.body.txRef || req.query.tx_ref;
            const activated = await subscription_service_1.SubscriptionService.confirmPaymentAndActivate(txRef);
            (0, response_1.sendSuccess)(res, activated, 'Payment confirmed and subscription activated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.SubscriptionController = SubscriptionController;
