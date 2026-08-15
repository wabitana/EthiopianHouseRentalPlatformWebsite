"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_service_1 = require("./subscription.service");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/v1/subscriptions/plans (Public)
router.get('/plans', async (_req, res) => {
    try {
        const plans = await subscription_service_1.subscriptionService.getSubscriptionPlans();
        return res.json(plans);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription plans' });
    }
});
// GET /api/v1/subscriptions/my-subscription (Authenticated User)
router.get('/my-subscription', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const subscription = await subscription_service_1.subscriptionService.getUserSubscription(userId);
        return res.json({
            hasActiveSubscription: !!subscription,
            subscription,
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch subscription details' });
    }
});
// POST /api/v1/subscriptions/subscribe (Landlord subscribes with Chapa simulation)
router.post('/subscribe', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { planId } = req.body;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!planId)
            return res.status(400).json({ error: 'Subscription planId is required' });
        const result = await subscription_service_1.subscriptionService.subscribe(userId, planId);
        return res.status(201).json(result);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Subscription failed' });
    }
});
exports.default = router;
