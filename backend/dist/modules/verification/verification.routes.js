"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_controller_1 = require("./verification.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const upload_middleware_1 = require("../../middleware/upload.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const verification_validation_1 = require("./verification.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // Protected endpoints
// User Submission Endpoints
router.post('/identity', upload_middleware_1.uploadPrivate.single('document'), (0, validation_middleware_1.validateRequest)(verification_validation_1.submitIdentitySchema), verification_controller_1.VerificationController.uploadIdentity);
router.post('/license', (0, role_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), upload_middleware_1.uploadPrivate.single('document'), (0, validation_middleware_1.validateRequest)(verification_validation_1.submitLicenseSchema), verification_controller_1.VerificationController.uploadLicense);
// Admin Review Endpoints
router.get('/pending', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), verification_controller_1.VerificationController.getPending);
router.patch('/identity/:id/review', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(verification_validation_1.reviewDocSchema), verification_controller_1.VerificationController.reviewIdentity);
router.patch('/license/:id/review', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(verification_validation_1.reviewDocSchema), verification_controller_1.VerificationController.reviewLicense);
exports.default = router;
