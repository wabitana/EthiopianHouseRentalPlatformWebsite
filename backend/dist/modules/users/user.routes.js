"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const validation_middleware_1 = require("../../middleware/validation.middleware");
const user_validation_1 = require("./user.validation");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
router.use(auth_middleware_1.authenticate); // Require authentication for all user endpoints
router.get('/me', user_controller_1.UserController.getMe);
router.patch('/me', (0, validation_middleware_1.validateRequest)(user_validation_1.updateProfileSchema), user_controller_1.UserController.updateMe);
// Admin-only endpoints
router.get('/', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), user_controller_1.UserController.getAllUsers);
router.patch('/:id/roles', (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), (0, validation_middleware_1.validateRequest)(user_validation_1.updateRolesSchema), user_controller_1.UserController.updateRoles);
exports.default = router;
