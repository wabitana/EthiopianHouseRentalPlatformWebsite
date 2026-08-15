import { z } from 'zod';
import { TransactionType, PropertyStatus } from '@prisma/client';

export const createPropertySchema = z.object({
  body: z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    propertyType: z.string().min(2, 'Property type is required'),
    transactionType: z.nativeEnum(TransactionType),
    price: z.number().positive('Price must be positive'),
    area: z.number().positive('Area must be positive'),
    bedrooms: z.number().int().nonnegative(),
    bathrooms: z.number().int().nonnegative(),
    city: z.string().min(2, 'City is required'),
    areaName: z.string().min(2, 'Area name is required'),
    neighborhood: z.string().optional(),
    addressDetails: z.string().optional(),
    images: z.array(z.string()).optional(),
  }),
});

export const updatePropertySchema = z.object({
  body: z.object({
    title: z.string().min(5).optional(),
    description: z.string().min(10).optional(),
    price: z.number().positive().optional(),
    availability: z.boolean().optional(),
    status: z.nativeEnum(PropertyStatus).optional(),
  }),
});
