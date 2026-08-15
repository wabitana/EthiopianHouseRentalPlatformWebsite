import { Router } from 'express';
import { RentalController } from './rental.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createRentalRequestSchema, respondRentalRequestSchema } from './rental.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.post(
  '/request',
  authorizeRoles(Role.RENTER, Role.BUYER, Role.ADMIN),
  validateRequest(createRentalRequestSchema),
  RentalController.submit
);

router.get('/my-requests', RentalController.getMyRequests);
router.get('/owner-requests', authorizeRoles(Role.OWNER, Role.ADMIN), RentalController.getOwnerRequests);
router.patch(
  '/:id/respond',
  authorizeRoles(Role.OWNER, Role.ADMIN),
  validateRequest(respondRentalRequestSchema),
  RentalController.respond
);

export default router;
