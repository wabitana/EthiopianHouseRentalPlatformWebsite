"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewDocSchema = exports.submitLicenseSchema = exports.submitIdentitySchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.submitIdentitySchema = zod_1.z.object({
    body: zod_1.z.object({
        documentType: zod_1.z.string().min(2, 'Document type is required'),
        documentNumber: zod_1.z.string().min(2, 'Document number is required'),
    }),
});
exports.submitLicenseSchema = zod_1.z.object({
    body: zod_1.z.object({
        licenseNumber: zod_1.z.string().min(2, 'License number is required'),
    }),
});
exports.reviewDocSchema = zod_1.z.object({
    body: zod_1.z.object({
        status: zod_1.z.nativeEnum(client_1.VerificationStatus),
        rejectionReason: zod_1.z.string().optional(),
    }),
});
