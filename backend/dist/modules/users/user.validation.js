"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRolesSchema = exports.updateProfileSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.updateProfileSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).optional(),
        phone: zod_1.z.string().min(10).optional(),
        avatarUrl: zod_1.z.string().url().optional(),
    }),
});
exports.updateRolesSchema = zod_1.z.object({
    body: zod_1.z.object({
        roles: zod_1.z.array(zod_1.z.nativeEnum(client_1.Role)).min(1, 'At least one role is required'),
    }),
});
