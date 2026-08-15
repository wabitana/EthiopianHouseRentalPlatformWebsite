import { z } from 'zod';
import { SaleStatus } from '@prisma/client';

export const createSaleRequestSchema = z.object({
  body: z.object({
    propertyId: z.string().min(1, 'Property ID is required'),
    offerPrice: z.number().positive().optional(),
    message: z.string().optional(),
  }),
});

export const respondSaleRequestSchema = z.object({
  body: z.object({
    status: z.nativeEnum(SaleStatus),
  }),
});
