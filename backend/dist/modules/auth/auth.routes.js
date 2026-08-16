"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../../prisma");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'ethiopian_house_rental_super_secret_jwt_key_2026';
// POST /api/v1/auth/register
router.post('/register', async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ error: 'Name, email, phone, and password are required' });
        }
        const normalizedRole = (role || 'seeker').toLowerCase();
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                name,
                email,
                phone,
                passwordHash,
                role: normalizedRole,
                isVerified: false,
            },
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
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
    }
    catch (error) {
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
        const user = await (0, prisma_1.withDbRetry)(() => prisma_1.prisma.user.findFirst({
            where: {
                OR: [{ email: emailOrPhone }, { phone: emailOrPhone }],
            },
        }));
        if (!user) {
            return res.status(401).json({ error: 'Invalid email/phone or password' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.passwordHash);
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
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Failed to login' });
    }
});
// POST /api/v1/auth/google
router.post('/google', async (req, res) => {
    try {
        const { email, name, avatarUrl, role } = req.body;
        const userEmail = email || 'google_user@example.com';
        const userName = name || 'Google User';
        const userRole = (role || 'seeker').toLowerCase();
        let user = await prisma_1.prisma.user.findUnique({ where: { email: userEmail } });
        if (user) {
            if (role) {
                const requestedRole = role.toLowerCase();
                const existingRole = user.role.toLowerCase();
                if (existingRole !== requestedRole && existingRole !== 'admin') {
                    const registeredLabel = existingRole === 'seeker' ? 'House Seeker' : 'House Provider';
                    const selectedLabel = requestedRole === 'seeker' ? 'House Seeker' : 'House Provider';
                    return res.status(403).json({
                        error: `This Google account is registered as a ${registeredLabel}. You cannot log in as ${selectedLabel}. Please select '${registeredLabel}'.`,
                    });
                }
            }
        }
        else {
            const defaultPasswordHash = await bcryptjs_1.default.hash('google_oauth_secure_pwd_2026', 10);
            user = await prisma_1.prisma.user.create({
                data: {
                    name: userName,
                    email: userEmail,
                    phone: '+251 90 000 0000',
                    passwordHash: defaultPasswordHash,
                    role: userRole,
                    avatarUrl: avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                    isVerified: true,
                },
            });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
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
    }
    catch (error) {
        console.error('Google auth error:', error);
        return res.status(500).json({ error: 'Failed to authenticate with Google' });
    }
});
// POST & GET /api/v1/auth/logout
const handleLogout = (_req, res) => {
    return res.json({ success: true, message: 'Logged out successfully' });
};
router.post('/logout', handleLogout);
router.get('/logout', handleLogout);
// GET /api/v1/users/me
router.get('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch current user' });
    }
});
// PATCH /api/v1/users/me
router.patch('/me', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, phone, avatarUrl, isVerified } = req.body;
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
                ...(avatarUrl !== undefined && { avatarUrl }),
                ...(isVerified !== undefined && { isVerified }),
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
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});
// POST /api/v1/auth/verify-identity
router.post('/verify-identity', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { idType, idNumber, documentImage, selfieImage } = req.body;
        if (!idType || !idNumber) {
            return res.status(400).json({ error: 'ID Document Type and ID Number are required' });
        }
        const updatedUser = await prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                isVerified: true,
            },
        });
        await prisma_1.prisma.property.updateMany({
            where: { providerId: userId },
            data: { providerIsVerified: true },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: updatedUser.id,
                title: 'Identity Verification Approved ✓',
                message: `Your ${idType} (${idNumber}) has been successfully verified. You now hold a Verified User Badge on Ethiopian House Rental.`,
                type: 'SYSTEM',
            },
        });
        return res.json({
            success: true,
            message: 'Identity verification approved successfully',
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
    }
    catch (error) {
        console.error('Verify identity error:', error);
        return res.status(500).json({ error: 'Failed to complete identity verification' });
    }
});
exports.default = router;
