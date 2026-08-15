import { z } from 'zod';
import { Role } from '@prisma/client';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    phone: z.string().min(10, 'Phone number must be at least 10 digits'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    roles: z.array(z.nativeEnum(Role)).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    emailOrPhone: z.string().min(1, 'Email or phone number is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const verifyOtpSchema = z.object({
  body: z.object({
    phoneOrEmail: z.string().min(1, 'Phone or email is required'),
    code: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

export const sendOtpSchema = z.object({
  body: z.object({
    phoneOrEmail: z.string().min(1, 'Phone or email is required'),
  }),
});
