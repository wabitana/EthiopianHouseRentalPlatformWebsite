"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const subscription_validation_1 = require("./subscription.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public Plan Listing Endpoint
router.get('/plans', subscription_controller_1.SubscriptionController.getPlans);
// Authenticated Endpoints
router.use(auth_middleware_1.authenticate);
router.get('/my-subscription', (0, role_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), subscription_controller_1.SubscriptionController.getMySubscription);
router.post('/subscribe', (0, role_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(subscription_validation_1.subscribeSchema), subscription_controller_1.SubscriptionController.subscribe);
router.post('/confirm-payment', subscription_controller_1.SubscriptionController.confirmPayment);
// Admin-only Plan Management Endpoint
router.post('/plans', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(subscription_validation_1.createPlanSchema), subscription_controller_1.SubscriptionController.createPlan);
exports.default = router;
