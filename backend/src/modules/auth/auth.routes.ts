import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  refreshTokenSchema,
  sendOtpSchema,
} from './auth.validation';
import { rateLimit } from '../../middleware/rate-limit.middleware';

const router = Router();

const authRateLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.post('/register', authRateLimiter, validateRequest(registerSchema), AuthController.register);
router.post('/login', authRateLimiter, validateRequest(loginSchema), AuthController.login);
router.post('/verify-phone', validateRequest(verifyOtpSchema), AuthController.verifyPhone);
router.post('/refresh', validateRequest(refreshTokenSchema), AuthController.refreshToken);
router.post('/send-otp', authRateLimiter, validateRequest(sendOtpSchema), AuthController.sendOtp);

export default router;
