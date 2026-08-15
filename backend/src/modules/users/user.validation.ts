import { z } from 'zod';
import { Role } from '@prisma/client';

export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().min(10).optional(),
    avatarUrl: z.string().url().optional(),
  }),
});

export const updateRolesSchema = z.object({
  body: z.object({
    roles: z.array(z.nativeEnum(Role)).min(1, 'At least one role is required'),
  }),
});
