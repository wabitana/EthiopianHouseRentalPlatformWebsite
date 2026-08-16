import { Router } from 'express';
import { UserController } from './user.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updateProfileSchema, updateRolesSchema } from './user.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate); // Require authentication for all user endpoints

router.get('/me', UserController.getMe);
router.get('/me/properties', UserController.getMyProperties);
router.patch('/me', validateRequest(updateProfileSchema), UserController.updateMe);

// Admin-only endpoints
router.get('/', authorizeRoles(Role.ADMIN), UserController.getAllUsers);
router.patch('/:id/roles', authorizeRoles(Role.ADMIN), validateRequest(updateRolesSchema), UserController.updateRoles);

export default router;
