import { z } from 'zod';
import { VerificationStatus } from '@prisma/client';

export const submitIdentitySchema = z.object({
  body: z.object({
    documentType: z.string().min(2, 'Document type is required'),
    documentNumber: z.string().min(2, 'Document number is required'),
  }),
});

export const submitLicenseSchema = z.object({
  body: z.object({
    licenseNumber: z.string().min(2, 'License number is required'),
  }),
});

export const reviewDocSchema = z.object({
  body: z.object({
    status: z.nativeEnum(VerificationStatus),
    rejectionReason: z.string().optional(),
  }),
});
