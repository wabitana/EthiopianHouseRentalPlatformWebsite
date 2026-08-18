import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma, withDbRetry } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';
import { sendVerificationEmail } from '../email/email.service';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ethiopian_house_rental_super_secret_jwt_key_2026';

// Helper to issue tokens
const generateTokens = async (user: any) => {
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  try {
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
  } catch (_) {}

  return { token, refreshToken };
};

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const normalizedRole = (role || 'seeker').toLowerCase();

    // Rule: Administrative or Agent roles cannot be registered publicly
    if (normalizedRole === 'agent' || normalizedRole === 'admin') {
      return res.status(400).json({ error: 'Administrative or Agent accounts must be created by an Administrator.' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const emailCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || '+251 90 000 0000',
        passwordHash,
        role: normalizedRole,
        isVerified: false,
        isEmailVerified: false,
        emailVerificationCode: emailCode,
        emailVerificationExpires: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
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
      code: emailCode, // Included for easy dev/testing
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
      return res.json({ message: 'Email already verified', ...tokens, user });
    }

    if (user.emailVerificationCode !== code.toString().trim()) {
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
      maxAge: 30 * 24 * 60 * 60 * 1000,
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

// POST /api/v1/auth/send-phone-otp
router.post('/send-phone-otp', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { phone } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const phoneCode = Math.floor(100000 + Math.random() * 900000).toString();
    const targetPhone = phone || '+251911000000';

    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: targetPhone,
        phoneVerificationCode: phoneCode,
        phoneVerificationExpires: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    console.log(`📱 SMS OTP for ${targetPhone}: ${phoneCode}`);

    return res.json({
      message: 'Phone verification code sent.',
      phone: targetPhone,
      code: phoneCode, // Included for dev testing
    });
  } catch (error) {
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

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.phoneVerificationCode !== code.toString().trim()) {
      return res.status(400).json({ error: 'Invalid SMS OTP code' });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isPhoneVerified: true,
        phoneVerificationCode: null,
        phoneVerificationExpires: null,
      },
    });

    return res.json({
      message: 'Phone number verified successfully.',
      isPhoneVerified: true,
      user: updatedUser,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to verify phone OTP' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
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

    if (role) {
      const requestedRole = role.toLowerCase();
      const userRole = user.role.toLowerCase();
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

    // Short-lived access token cookie
    res.cookie('delala_token', tokens.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
      path: '/',
    });

    // Long-lived refresh token cookie (HttpOnly — JS can never read this)
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
    // Accept refresh token from HttpOnly cookie (preferred) or request body (fallback)
    const refreshToken = req.cookies?.delala_refresh_token || req.body?.refreshToken;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token required' });
    }

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.revoked || storedToken.expiresAt < new Date()) {
      // Clear both cookies on invalid refresh to force re-login
      res.clearCookie('delala_token', { path: '/' });
      res.clearCookie('delala_refresh_token', { path: '/' });
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Revoke the used refresh token (rotation — prevents replay attacks)
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { revoked: true },
    });

    // Issue a fresh token pair
    const newTokens = await generateTokens(storedToken.user);

    // Set both tokens as HttpOnly cookies
    const isProduction = process.env.NODE_ENV === 'production';

    res.cookie('delala_token', newTokens.token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
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
  if (refreshToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken },
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
