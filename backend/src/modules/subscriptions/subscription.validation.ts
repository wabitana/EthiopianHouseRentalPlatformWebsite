import { z } from 'zod';

export const createPlanSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Plan name required'),
    price: z.number().min(0, 'Price must be non-negative'),
    durationDays: z.number().positive().optional(),
    maxListings: z.number().positive().optional(),
    features: z.array(z.string()).optional(),
  }),
});

export const subscribeSchema = z.object({
  body: z.object({
    planId: z.string().min(1, 'Plan ID is required'),
  }),
});
