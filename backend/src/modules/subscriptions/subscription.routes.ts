import { Router } from 'express';
import { SubscriptionController } from './subscription.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createPlanSchema, subscribeSchema } from './subscription.validation';
import { Role } from '@prisma/client';

const router = Router();

// Public Plan Listing Endpoint
router.get('/plans', SubscriptionController.getPlans);

// Authenticated Endpoints
router.use(authenticate);

router.get('/my-subscription', authorizeRoles(Role.OWNER, Role.ADMIN), SubscriptionController.getMySubscription);
router.post('/subscribe', authorizeRoles(Role.OWNER, Role.ADMIN), validateRequest(subscribeSchema), SubscriptionController.subscribe);
router.post('/confirm-payment', SubscriptionController.confirmPayment);

// Admin-only Plan Management Endpoint
router.post('/plans', authorizeRoles(Role.ADMIN), validateRequest(createPlanSchema), SubscriptionController.createPlan);

export default router;
