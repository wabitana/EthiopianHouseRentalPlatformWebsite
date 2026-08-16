import { Router } from 'express';
import { CmsController } from './cms.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Publicly readable
router.get('/', CmsController.getConfig);

// Admin-only updates
router.patch('/', authenticate, authorizeRoles(Role.ADMIN), CmsController.updateConfig);

export default router;
