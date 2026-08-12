import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ethiopian_house_rental_super_secret_jwt_key_2026';

// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required' });
    }

    const normalizedRole = (role || 'seeker').toLowerCase();
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      return res.status(400).json({ error: 'Email is already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: normalizedRole,
        isVerified: false,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
        rating: user.rating,
        totalListings: user.totalListings,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

// POST /api/v1/auth/login
router.post('/login', async (req, res) => {
  try {
    const { emailOrPhone, password, role } = req.body;

    if (!emailOrPhone || !password) {
      return res.status(400).json({ error: 'Email/Phone and password are required' });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email/phone or password' });
    }

    // Optional role override verification if provided
    if (role && user.role !== role.toLowerCase()) {
      // Update role if switching profile role
      await prisma.user.update({
        where: { id: user.id },
        data: { role: role.toLowerCase() },
      });
      user.role = role.toLowerCase();
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatarUrl,
        isVerified: user.isVerified,
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

// POST /api/v1/auth/logout
router.post('/logout', authenticateToken, (req, res) => {
  return res.json({ success: true, message: 'Logged out successfully' });
});

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

    const { name, phone, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(avatarUrl && { avatarUrl }),
      },
    });

    return res.json({
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        isVerified: updatedUser.isVerified,
        rating: updatedUser.rating,
        totalListings: updatedUser.totalListings,
        createdAt: updatedUser.createdAt,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

export default router;
