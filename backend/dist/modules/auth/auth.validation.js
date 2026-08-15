"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpSchema = exports.refreshTokenSchema = exports.verifyOtpSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
        email: zod_1.z.string().email('Invalid email address'),
        phone: zod_1.z.string().min(10, 'Phone number must be at least 10 digits'),
        password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
        roles: zod_1.z.array(zod_1.z.nativeEnum(client_1.Role)).optional(),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        emailOrPhone: zod_1.z.string().min(1, 'Email or phone number is required'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
exports.verifyOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        phoneOrEmail: zod_1.z.string().min(1, 'Phone or email is required'),
        code: zod_1.z.string().length(6, 'OTP must be 6 digits'),
    }),
});
exports.refreshTokenSchema = zod_1.z.object({
    body: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1, 'Refresh token is required'),
    }),
});
exports.sendOtpSchema = zod_1.z.object({
    body: zod_1.z.object({
        phoneOrEmail: zod_1.z.string().min(1, 'Phone or email is required'),
    }),
});
