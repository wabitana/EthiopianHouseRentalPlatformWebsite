import { Router } from 'express';
import { PropertyController } from './property.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createPropertySchema, updatePropertySchema } from './property.validation';
import { Role } from '@prisma/client';

const router = Router();

// Public Property Endpoints
router.get('/published', PropertyController.getPublished);
router.get('/', PropertyController.getPublished);
router.get('/:id', PropertyController.getById);

// Authenticated Endpoints
router.use(authenticate);

// Creation guarded by subscription & role
router.post(
  '/',
  authorizeRoles(Role.OWNER, Role.ADMIN),
  validateRequest(createPropertySchema),
  PropertyController.create
);

router.patch(
  '/:id',
  authorizeRoles(Role.OWNER, Role.ADMIN),
  validateRequest(updatePropertySchema),
  PropertyController.update
);

// Admin-only Approval Status Update
router.patch(
  '/:id/status',
  authorizeRoles(Role.ADMIN),
  PropertyController.updateStatus
);

export default router;
