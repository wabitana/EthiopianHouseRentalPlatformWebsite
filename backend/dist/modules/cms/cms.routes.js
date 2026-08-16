"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const cms_controller_1 = require("./cms.controller");
const auth_middleware_1 = require("../../middleware/auth.middleware");
const role_middleware_1 = require("../../middleware/role.middleware");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
// Publicly readable
router.get('/', cms_controller_1.CmsController.getConfig);
// Admin-only updates
router.patch('/', auth_middleware_1.authenticate, (0, role_middleware_1.authorizeRoles)(client_1.Role.ADMIN), cms_controller_1.CmsController.updateConfig);
exports.default = router;
