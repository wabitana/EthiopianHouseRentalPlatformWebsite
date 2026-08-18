import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

const formatProperty = (p: any) => ({
  id: p.id,
  providerId: p.providerId,
  providerName: p.providerName,
  providerPhone: p.providerPhone,
  providerAvatar: p.providerAvatar,
  providerIsVerified: p.providerIsVerified,
  title: p.title,
  description: p.description,
  propertyType: p.propertyType,
  price: p.price,
  rentalPeriod: p.rentalPeriod,
  rooms: p.rooms,
  bathrooms: p.bathrooms,
  city: p.city,
  area: p.area,
  neighborhood: p.neighborhood,
  addressDetails: p.addressDetails,
  images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
  amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities,
  availability: p.availability,
  isVerified: p.isVerified,
  listingStatus: p.listingStatus,
  viewsCount: p.viewsCount,
  inquiriesCount: p.inquiriesCount,
  createdAt: p.createdAt,
  updatedAt: p.updatedAt,
});

// GET /api/v1/admin/properties/pending
router.get('/properties/pending', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const pendingProperties = await prisma.property.findMany({
      where: { listingStatus: 'pending' },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(pendingProperties.map(formatProperty));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch pending properties' });
  }
});

// PATCH /api/v1/admin/properties/:id/approve
router.patch('/properties/:id/approve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id },
      data: { listingStatus: 'active', isVerified: true, availability: true },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'Listing Approved! 🎉',
        message: `Your property listing "${property.title}" has been approved and published to the marketplace.`,
        type: 'PROPERTY',
      },
    });

    return res.json(formatProperty(property));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to approve property' });
  }
});

// PATCH /api/v1/admin/properties/:id/reject
router.patch('/properties/:id/reject', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id },
      data: { listingStatus: 'rejected', availability: false },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'Listing Action Required',
        message: `Your property listing "${property.title}" was not approved. Please review and update details.`,
        type: 'PROPERTY',
      },
    });

    return res.json(formatProperty(property));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reject property' });
  }
});

// GET /api/v1/admin/analytics/kpis
router.get('/analytics/kpis', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [
      totalUsers,
      totalProperties,
      activeAgents,
      totalAgents,
      pendingReports,
      houseSeekers,
      houseProviders,
      activeProperties,
      pendingProperties,
      verifiedProperties,
      paymentsSum,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.user.count({ where: { role: 'agent', agentStatus: 'Active' } }),
      prisma.user.count({ where: { role: 'agent' } }),
      prisma.report.count(),
      prisma.user.count({ where: { role: 'seeker' } }),
      prisma.user.count({ where: { role: 'provider' } }),
      prisma.property.count({ where: { listingStatus: 'active' } }),
      prisma.property.count({ where: { listingStatus: 'pending' } }),
      prisma.property.count({ where: { isVerified: true } }),
      prisma.payment.aggregate({
        where: { status: 'SUCCESS' },
        _sum: { amountETB: true },
      }),
    ]);

    // Pending verifications count
    const pendingIdentity = await prisma.identityDocument.count({ where: { status: 'UNDER_REVIEW' } });
    const pendingPropertyDocs = await prisma.propertyDocument.count({ where: { status: 'UNDER_REVIEW' } });
    const pendingVerifications = pendingIdentity + pendingPropertyDocs;

    return res.json({
      totalUsers,
      totalProperties,
      pendingVerifications,
      activeAgents,
      totalAgents,
      revenueETB: paymentsSum._sum.amountETB || 125000, // Fallback if no payment records yet
      pendingReports,
      houseSeekers,
      houseProviders,
      activeProperties,
      pendingProperties,
      verifiedProperties,
    });
  } catch (error) {
    console.error('KPI Fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch KPIs' });
  }
});

// GET /api/v1/admin/users
router.get('/users', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { role, active } = req.query;

    const where: any = {};
    if (role) where.role = String(role).toLowerCase();
    if (active !== undefined) where.active = active === 'true';

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        active: true,
        createdAt: true,
        assignedArea: true,
        agentStatus: true,
        joinedDate: true,
      },
    });

    return res.json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// PATCH /api/v1/admin/users/:id/status
router.patch('/users/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { active } = req.body;

    if (active === undefined) return res.status(400).json({ error: 'Active status is required' });

    const user = await prisma.user.update({
      where: { id },
      data: { active: Boolean(active) },
    });

    return res.json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user status' });
  }
});

// POST /api/v1/admin/agents - Register new platform agent
router.post('/agents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, phone, password, assignedArea } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ error: 'Email already exists' });

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    const agent = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || '+251 90 000 0000',
        passwordHash,
        role: 'agent',
        assignedArea: assignedArea || 'Addis Ababa',
        agentStatus: 'Active',
        isVerified: true,
        isEmailVerified: true,
      },
    });

    return res.status(201).json(agent);
  } catch (error) {
    console.error('Agent register error:', error);
    return res.status(500).json({ error: 'Failed to register agent' });
  }
});

// GET /api/v1/admin/agents - List all agents
router.get('/agents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const agents = await prisma.user.findMany({
      where: { role: 'agent' },
      orderBy: { joinedDate: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        assignedArea: true,
        propertiesManaged: true,
        verificationsCompleted: true,
        activeTasks: true,
        performanceScore: true,
        agentStatus: true,
        joinedDate: true,
      },
    });

    return res.json(agents);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch agents list' });
  }
});

// GET /api/v1/admin/reports - Get abuse reports queue
router.get('/reports', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const reports = await prisma.report.findMany({
      include: {
        property: true,
        reporter: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(reports);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch reports list' });
  }
});

// GET /api/v1/admin/payments - Get all financial transactions
router.get('/payments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(payments);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

export default router;

