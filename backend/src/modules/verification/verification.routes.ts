import { Router } from 'express';
import { VerificationController } from './verification.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authorizeRoles } from '../../middleware/role.middleware';
import { uploadPrivate } from '../../middleware/upload.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { submitIdentitySchema, submitLicenseSchema, reviewDocSchema } from './verification.validation';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate); // Protected endpoints

// User Submission Endpoints
router.post(
  '/identity',
  uploadPrivate.single('document'),
  validateRequest(submitIdentitySchema),
  VerificationController.uploadIdentity
);

router.post(
  '/license',
  authorizeRoles(Role.OWNER, Role.ADMIN),
  uploadPrivate.single('document'),
  validateRequest(submitLicenseSchema),
  VerificationController.uploadLicense
);

// Admin Review Endpoints
router.get('/pending', authorizeRoles(Role.ADMIN), VerificationController.getPending);
router.patch('/identity/:id/review', authorizeRoles(Role.ADMIN), validateRequest(reviewDocSchema), VerificationController.reviewIdentity);
router.patch('/license/:id/review', authorizeRoles(Role.ADMIN), validateRequest(reviewDocSchema), VerificationController.reviewLicense);

export default router;
