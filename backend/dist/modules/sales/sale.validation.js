"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondSaleRequestSchema = exports.createSaleRequestSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createSaleRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        propertyId: zod_1.z.string().min(1, 'Property ID is required'),
        offerPrice: zod_1.z.number().positive().optional(),
        message: zod_1.z.string().optional(),
    }),
});
exports.respondSaleRequestSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.SaleStatus),
    }),
});
