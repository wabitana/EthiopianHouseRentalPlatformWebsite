"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePropertySchema = exports.createPropertySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.createPropertySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
        description: zod_1.z.string().min(10, 'Description must be at least 10 characters'),
        propertyType: zod_1.z.string().min(2, 'Property type is required'),
        transactionType: zod_1.z.nativeEnum(client_1.TransactionType),
        price: zod_1.z.number().positive('Price must be positive'),
        area: zod_1.z.number().positive('Area must be positive'),
        bedrooms: zod_1.z.number().int().nonnegative(),
        bathrooms: zod_1.z.number().int().nonnegative(),
        city: zod_1.z.string().min(2, 'City is required'),
        areaName: zod_1.z.string().min(2, 'Area name is required'),
        neighborhood: zod_1.z.string().optional(),
        addressDetails: zod_1.z.string().optional(),
        images: zod_1.z.array(zod_1.z.string()).optional(),
    }),
});
exports.updatePropertySchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(5).optional(),
        description: zod_1.z.string().min(10).optional(),
        price: zod_1.z.number().positive().optional(),
        availability: zod_1.z.boolean().optional(),
        status: zod_1.z.nativeEnum(client_1.PropertyStatus).optional(),
    }),
});
