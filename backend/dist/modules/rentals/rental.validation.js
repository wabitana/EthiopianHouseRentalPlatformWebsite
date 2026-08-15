"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondRentalRequestSchema = exports.createRentalRequestSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createRentalRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        propertyId: zod_1.z.string().min(1, 'Property ID is required'),
        message: zod_1.z.string().optional(),
        moveInDate: zod_1.z.string().datetime({ offset: true }).optional().or(zod_1.z.string().length(10)),
        durationMonths: zod_1.z.number().int().positive().optional(),
    }),
});
exports.respondRentalRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.RentalStatus),
    }),
});
