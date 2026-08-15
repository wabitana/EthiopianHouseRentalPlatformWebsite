import { Router } from 'express';
import { SaleController } from './sale.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createSaleRequestSchema, respondSaleRequestSchema } from './sale.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/request',
  authorizeRoles(Role.BUYER, Role.RENTER, Role.ADMIN),
  validateRequest(createSaleRequestSchema),
  SaleController.submit
);

router.get('/my-requests', SaleController.getMyRequests);
router.get('/owner-requests', authorizeRoles(Role.OWNER, Role.ADMIN), SaleController.getOwnerRequests);
router.patch(
  '/:id/respond',
  authorizeRoles(Role.OWNER, Role.ADMIN),
  validateRequest(respondSaleRequestSchema),
  SaleController.respond
);

export default router;
