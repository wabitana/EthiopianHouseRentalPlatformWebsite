import { Router } from 'express';
import { AdminController } from './admin.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate, authorizeRoles(Role.ADMIN));

router.get('/stats', AdminController.getStats);
router.get('/audit-logs', AdminController.getAuditLogs);
router.get('/properties', AdminController.getProperties);
router.get('/payments', AdminController.getPayments);

export default router;
