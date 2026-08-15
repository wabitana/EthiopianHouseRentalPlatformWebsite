"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const property_controller_1 = require("./property.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const property_validation_1 = require("./property.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Public Property Endpoints
router.get('/published', property_controller_1.PropertyController.getPublished);
router.get('/:id', property_controller_1.PropertyController.getById);
// Authenticated Endpoints
router.use(auth_middleware_1.authenticate);
// Creation guarded by subscription & role
router.post('/', (0, role_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(property_validation_1.createPropertySchema), property_controller_1.PropertyController.create);
router.patch('/:id', (0, role_middleware_1.authorizeRoles)(client_1.Role.OWNER, client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(property_validation_1.updatePropertySchema), property_controller_1.PropertyController.update);
// Admin-only Approval Status Update
router.patch('/:id/status', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), property_controller_1.PropertyController.updateStatus);
exports.default = router;
