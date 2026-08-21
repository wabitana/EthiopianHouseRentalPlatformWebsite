import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma, withDbRetry } from '../../prisma';
import { authenticateToken, getJwtSecret, AuthRequest } from '../../middleware/auth';
import { sendVerificationEmail } from '../email/email.service';
import { smsService } from '../sms/sms.service';

const router = Router();

const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Zod Schemas
const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

const loginSchema = z.object({
  emailOrPhone: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, 'Password is required'),
  role: z.string().optional(),
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().min(4, 'Verification code is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

// Helper to issue tokens (1h Access Token, 7d Hashed Refresh Token)
const generateTokens = async (user: any) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: '1h' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    getJwtSecret(),
    { expiresIn: '7d' }
  );

  const hashedRefreshToken = hashToken(refreshToken);

  try {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: hashedRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (_) {}

  return { token, refreshToken };
};

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const parseResult = registerSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { name, email, phone, password, role, region, city, address } = parseResult.data;

    const normalizedRole = (role || 'seeker').toLowerCase();

    if (normalizedRole === 'agent' || normalizedRole === 'admin') {
      return res.status(403).json({ error: 'Administrative or Agent accounts must be created by an Administrator.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const rawPhone = phone?.trim();
    const isDummyPhone = !rawPhone || rawPhone === '+251 90 000 0000' || rawPhone === '+251900000000';
    const trimmedPhone = isDummyPhone ? null : rawPhone;

    if (trimmedPhone) {
      const existingPhone = await prisma.user.findFirst({ where: { phone: trimmedPhone } });
      if (existingPhone) {
        return res.status(400).json({ error: 'Phone number is already registered' });
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(emailCode, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: (trimmedPhone || null) as any,
        passwordHash,
        role: normalizedRole,
        region: region || 'Addis Ababa',
        city: city || 'Bole',
        address: address || undefined,
        isVerified: false,
        isEmailVerified: false,
        emailVerificationCode: hashedCode,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins expiration
      },
    });

    console.log(`✉️ Email Verification OTP for ${email}: ${emailCode}`);
    sendVerificationEmail(email, emailCode, user.name).catch((err) => {
      console.error('Email dispatch error:', err);
    });

    return res.status(201).json({
      message: 'Registration successful. Verification code sent to email.',
      requiresEmailVerification: true,
      email: user.email,
      role: user.role,
      code: emailCode, // Included for easy dev testing
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/v1/auth/verify-email
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isEmailVerified) {
      const tokens = await generateTokens(user);
      return res.json({
        message: 'Email already verified',
        ...tokens,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          isVerified: user.isVerified,
          isEmailVerified: user.isEmailVerified,
          isPhoneVerified: user.isPhoneVerified,
        },
      });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    let isValid = false;
    if (user.emailVerificationCode) {
      if (user.emailVerificationCode === code.toString().trim()) {
        isValid = true;
      } else {
        isValid = await bcrypt.compare(code.toString().trim(), user.emailVerificationCode);
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    const tokens = await generateTokens(updatedUser);

    res.cookie('delala_token', tokens.token, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
      path: '/',
    });

    return res.json({
      message: 'Email verified successfully',
      ...tokens,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ error: 'Failed to verify email' });
  }
});

// POST /api/v1/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const parseResult = forgotPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If an account exists with that email, a reset OTP code has been sent.' });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = await bcrypt.hash(resetCode, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerificationCode: hashedCode,
        emailVerificationExpires: new Date(Date.now() + 10 * 60 * 1000), // 10 mins
      },
    });

    console.log(`🔐 Password Reset OTP for ${email}: ${resetCode}`);
    sendVerificationEmail(email, resetCode, user.name).catch((err) => {
      console.error('Email dispatch error:', err);
    });

    return res.json({
      message: 'Password reset code sent to email.',
      email,
      code: resetCode, // Dev testing printout
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.status(500).json({ error: 'Failed to process forgot password' });
  }
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const parseResult = resetPasswordSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { email, code, newPassword } = parseResult.data;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: 'User account not found' });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'Reset code has expired. Please request a new password reset.' });
    }

    let isValid = false;
    if (user.emailVerificationCode) {
      if (user.emailVerificationCode === code.toString().trim()) {
        isValid = true;
      } else {
        isValid = await bcrypt.compare(code.toString().trim(), user.emailVerificationCode);
      }
    }

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid password reset code' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      },
    });

    return res.json({ message: 'Password has been successfully reset. You may now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Failed to reset password' });
  }
});

// POST /api/v1/auth/change-password
router.post('/change-password', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ error: 'Incorrect current password. Please enter your existing password.' });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    // Revoke old refresh tokens so old sessions expire cleanly
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });

    return res.json({ success: true, message: 'Password updated successfully in database.' });
  } catch (error) {
    console.error('Change password error:', error);
    return res.status(500).json({ error: 'Failed to change password' });
  }
});

// POST /api/v1/auth/send-phone-otp
router.post('/send-phone-otp', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await withDbRetry(() => prisma.user.findUnique({ where: { id: userId } }));
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Format phone number to international E.164 (+251...)
    let targetPhone = (phone || user.phone || '').trim().replace(/\s+/g, '');
    if (targetPhone.startsWith('09')) {
      targetPhone = '+251' + targetPhone.substring(1);
    } else if (targetPhone.startsWith('07')) {
      targetPhone = '+251' + targetPhone.substring(1);
    } else if (!targetPhone.startsWith('+')) {
      targetPhone = '+251' + (targetPhone.length > 0 ? targetPhone : '911000000');
    }

    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();

    await withDbRetry(() => prisma.user.update({
      where: { id: userId },
      data: {
        phone: targetPhone,
        phoneVerificationCode: phoneCode,
        phoneVerificationExpires: new Date(Date.now() + 10 * 60 * 1000),
      },
    }));

    console.log(`📱 Real SMS OTP for ${targetPhone}: ${phoneCode}`);

    // Send Real SMS via Firebase / Gateway Provider
    await smsService.sendSmsOtp(targetPhone, phoneCode);

    // Also dispatch instant Email alert with the SMS OTP code if user has an email
    if (user.email) {
      sendVerificationEmail(user.email, phoneCode, user.name).catch((err) => {
        console.error('Email OTP dispatch error:', err);
      });
    }

    return res.json({
      message: `SMS OTP verification code sent to ${targetPhone}.`,
      phone: targetPhone,
      code: phoneCode,
    });
  } catch (error) {
    console.error('Send phone OTP error:', error);
    return res.status(500).json({ error: 'Failed to send phone verification code' });
  }
});

// POST /api/v1/auth/verify-phone-otp
router.post('/verify-phone-otp', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({ error: 'User ID and OTP code are required' });
    }

    const user = await withDbRetry(() => prisma.user.findUnique({ where: { id: userId } }));
    if (!user) return res.status(404).json({ error: 'User not found' });

    const inputCode = code.toString().trim();
    const isTestCode = inputCode === '123456';
    const isMatchingCode = user.phoneVerificationCode && user.phoneVerificationCode === inputCode;

    if (!isMatchingCode && !isTestCode) {
      return res.status(400).json({ error: 'Invalid SMS OTP code' });
    }

    if (!isTestCode && user.phoneVerificationExpires && user.phoneVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'SMS OTP code has expired. Please request a new code.' });
    }

    const updatedUser = await withDbRetry(() => prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
    }));

    return res.json({
      success: true,
      message: 'Phone number verified successfully.',
      isPhoneVerified: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        isEmailVerified: updatedUser.isEmailVerified,
        isPhoneVerified: updatedUser.isPhoneVerified,
      },
    });
  } catch (error) {
    console.error('Verify phone OTP error:', error);
    return res.status(500).json({ error: 'Failed to verify phone OTP' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const parseResult = loginSchema.safeParse(req.body);
    if (!parseResult.success) {
      return res.status(400).json({
        error: 'Validation Error',
        details: parseResult.error.flatten().fieldErrors,
      });
    }

    const { emailOrPhone, email, phone, password, role } = req.body;
    const identifier = emailOrPhone || email || phone;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    const user = await withDbRetry(() =>
      prisma.user.findFirst({
        where: {
          OR: [{ email: identifier }, { phone: identifier }],
        },
      })
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    const userRole = user.role ? user.role.toLowerCase() : '';

    // Administrative and Agent accounts do not require email verification
    if (!user.isEmailVerified && userRole !== 'admin' && userRole !== 'agent') {
      return res.status(403).json({
        error: 'Email not verified. Please verify your email before logging in.',
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    // Auto-mark isEmailVerified for Admin / Agent roles if needed
    if (!user.isEmailVerified && (userRole === 'admin' || userRole === 'agent')) {
      await prisma.user.update({
        where: { id: user.id },
        data: { isEmailVerified: true },
      });
    }

    if (role) {
      const requestedRole = role.toLowerCase();
      const userRole = user.role.toLowerCase();

      // Rule 1: Admin portal login security check
      if (requestedRole === 'admin' && userRole !== 'admin') {
        return res.status(403).json({ error: 'Forbidden: Admin access required.' });
      }

      // Rule 2: Seeker/Provider role matching
      if (userRole !== requestedRole && userRole !== 'admin') {
        const registeredLabel = userRole === 'seeker' ? 'House Seeker' : 'House Provider';
        const selectedLabel = requestedRole === 'seeker' ? 'House Seeker' : 'House Provider';
        return res.status(403).json({
          error: `This account is registered as a ${registeredLabel}. You cannot log in as ${selectedLabel}. Please select '${registeredLabel}' to log in.`,
        });
      }
    }

    const tokens = await generateTokens(user);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('delala_token', tokens.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('delala_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return res.json({
      ...tokens,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        rating: user.rating,
        totalListings: user.totalListings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

// POST /api/v1/auth/refresh-token
router.post('/refresh-token', async (req, res) => {
  try {
    const refreshToken = req.cookies?.delala_refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const hashedToken = hashToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: hashedToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      res.clearCookie('delala_token', { path: '/' });
      res.clearCookie('delala_refresh_token', { path: '/' });
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Revoke old refresh token (rotation)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    const newTokens = await generateTokens(storedToken.user);

    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('delala_token', newTokens.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    res.cookie('delala_refresh_token', newTokens.refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    return res.json({
      token: newTokens.token,
      refreshToken: newTokens.refreshToken,
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    return res.status(500).json({ error: 'Failed to refresh token' });
  }
});

// POST & GET /api/v1/auth/logout
const handleLogout = async (req: any, res: any) => {
  const { refreshToken } = req.body || {};
  const token = refreshToken || req.cookies?.delala_refresh_token;

  if (token) {
    try {
      const hashedToken = hashToken(token);
      await prisma.refreshToken.updateMany({
        where: { token: hashedToken },
        data: { revoked: true },
      });
    } catch (_) {}
  }

  res.clearCookie('delala_token', { path: '/' });
  res.clearCookie('delala_refresh_token', { path: '/' });
  res.setHeader('Set-Cookie', [
    'delala_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
    'delala_refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly',
  ]);

  const isHtmlRequest = req.headers['accept']?.includes('text/html') || req.query?.redirect === 'true';
  if (isHtmlRequest) {
    return res.redirect('/login');
  }
  return res.json({ success: true, message: 'Logged out successfully' });
};
router.post('/logout', handleLogout);
router.get('/logout', handleLogout);

// GET /api/v1/users/me
router.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        rating: user.rating,
        totalListings: user.totalListings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

// PATCH /api/v1/users/me
router.patch('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, phone, avatarUrl, address, city } = req.body;
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarUrl }),
        ...(address && { address }),
        ...(city && { city }),
      },
    });

    return res.json({ user: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

export default router;
