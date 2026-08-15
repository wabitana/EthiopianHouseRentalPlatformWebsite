import { z } from 'zod';
import { RentalStatus } from '@prisma/client';

export const createRentalRequestSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    message: z.string().optional(),
    moveInDate: z.string().datetime({ offset: true }).optional().or(z.string().length(10)),
    durationMonths: z.number().int().positive().optional(),
  }),
});

export const respondRentalRequestSchema = z.object({
  body: z.object({
    status: z.nativeEnum(RentalStatus),
  }),
});
