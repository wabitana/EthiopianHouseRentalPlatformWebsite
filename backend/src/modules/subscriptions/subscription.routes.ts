import { Router } from 'express';
import { subscriptionService } from './subscription.service';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/v1/subscriptions/plans (Public)
router.get('/plans', async (_req, res) => {
  try {
    const plans = await subscriptionService.getSubscriptionPlans();
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// GET /api/v1/subscriptions/my-subscription (Authenticated User)
router.get('/my-subscription', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const subscription = await subscriptionService.getUserSubscription(userId);
    return res.json({
      hasActiveSubscription: !!subscription,
      subscription,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscription details' });
  }
});

import { z } from 'zod';

const subscribeSchema = z.object({
  planId: z.string().min(1, 'Subscription planId is required'),
});

// POST /api/v1/subscriptions/subscribe (Landlord subscribes with Chapa simulation)
router.post('/subscribe', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parseResult = subscribeSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { planId } = parseResult.data;

    const result = await subscriptionService.subscribe(userId, planId);
    return res.status(201).json(result);
  } catch (error: any) {
    return res.status(400).json({ error: error.message || 'Subscription failed' });
  }
});

export default router;
