"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeSchema = exports.createPlanSchema = void 0;
const zod_1 = require("zod");
exports.createPlanSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Plan name required'),
        price: zod_1.z.number().min(0, 'Price must be non-negative'),
        durationDays: zod_1.z.number().positive().optional(),
        maxListings: zod_1.z.number().positive().optional(),
        features: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.subscribeSchema = zod_1.z.object({
    body: zod_1.z.object({
        planId: zod_1.z.string().min(1, 'Plan ID is required'),
    }),
});
