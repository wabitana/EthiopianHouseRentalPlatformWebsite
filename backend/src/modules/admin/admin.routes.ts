import { Router } from 'express';
import { prisma, withDbRetry } from '../../prisma';
import { authenticateToken, requireAdmin, AuthRequest } from '../../middleware/auth';

const router = Router();
router.use(authenticateToken, requireAdmin);

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
    const role = req.user?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'agent') {
      return res.status(403).json({ error: 'Admin or Agent access required' });
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

// PATCH /api/v1/admin/properties/:id/suspend
router.patch('/properties/:id/suspend', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const property = await prisma.property.update({
      where: { id },
      data: { listingStatus: 'suspended', availability: false },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'Listing Suspended ⚠️',
        message: `Your property listing "${property.title}" has been suspended by administration.`,
        type: 'PROPERTY',
      },
    });

    return res.json(formatProperty(property));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to suspend property' });
  }
});

// DELETE /api/v1/admin/properties/:id
router.delete('/properties/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    await prisma.propertyDocument.deleteMany({ where: { propertyId: id } });
    await prisma.task.deleteMany({ where: { propertyId: id } });
    await prisma.report.deleteMany({ where: { propertyId: id } });
    await prisma.property.delete({ where: { id } });

    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    console.error('Delete property error:', error);
    return res.status(500).json({ error: 'Failed to delete property' });
  }
});

// GET /api/v1/admin/properties/:id/documents - Fetch uploaded title deeds & provider ID documents
router.get('/properties/:id/documents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const propertyDocs = await prisma.propertyDocument.findMany({
      where: { propertyId: id },
    });

    const identityDoc = await prisma.identityDocument.findFirst({
      where: { userId: property.providerId },
    });

    return res.json({
      propertyDocs,
      identityDoc,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch property verification documents' });
  }
});

// GET /api/v1/admin/analytics/kpis
router.get('/analytics/kpis', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const role = req.user?.role?.toLowerCase();
    if (role !== 'admin' && role !== 'agent') {
      return res.status(403).json({ error: 'Admin or Agent access required' });
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
      locationsGroup,
      suspendedCount,
      rejectedCount,
    ] = await withDbRetry(() =>
      Promise.all([
        prisma.user.count(),
        prisma.property.count(),
        prisma.user.count({ where: { role: 'agent', active: true } }),
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
        prisma.property.groupBy({
          by: ['city', 'area'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        prisma.property.count({ where: { listingStatus: 'suspended' } }),
        prisma.property.count({ where: { listingStatus: 'rejected' } }),
      ])
    );

    // Pending verifications count
    const pendingIdentity = await withDbRetry(() => prisma.identityDocument.count({ where: { status: 'UNDER_REVIEW' } })).catch(() => 0);
    const pendingPropertyDocs = await withDbRetry(() => prisma.propertyDocument.count({ where: { status: 'UNDER_REVIEW' } })).catch(() => 0);
    const pendingVerifications = pendingIdentity + pendingPropertyDocs;

    // Location breakdown from DB
    const locationBreakdown = (locationsGroup || []).map((loc) => {
      const name = `${loc.area || ''}, ${loc.city || ''}`.replace(/^,\s*/, '').replace(/,\s*$/, '') || 'Addis Ababa';
      const count = loc._count.id;
      const percentage = totalProperties > 0 ? Math.round((count / totalProperties) * 100) : 0;
      return { location: name, count, percentage };
    });

    // Property status distribution from DB
    const propertyStatusDistribution = [
      { status: 'Published', count: activeProperties || 0, color: '#10B981' },
      { status: 'Pending Verification', count: pendingProperties || 0, color: '#F59E0B' },
      { status: 'Suspended', count: suspendedCount || 0, color: '#EF4444' },
      { status: 'Rejected', count: rejectedCount || 0, color: '#6B7280' },
    ];

    // Calculate real 6-month historical monthly breakdown for registrations & revenue
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);

    const [monthlyUsers, monthlyPayments] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: sixMonthsAgo } },
        select: { role: true, createdAt: true },
      }).catch(() => []),
      prisma.payment.findMany({
        where: { status: 'SUCCESS', createdAt: { gte: sixMonthsAgo } },
        select: { amountETB: true, createdAt: true },
      }).catch(() => []),
    ]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const registrationsChart: any[] = [];
    const revenueChart: any[] = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mIndex = d.getMonth();
      const year = d.getFullYear();
      const label = monthNames[mIndex];

      const seekers = (monthlyUsers || []).filter(u => u.role === 'seeker' && new Date(u.createdAt).getMonth() === mIndex && new Date(u.createdAt).getFullYear() === year).length;
      const providers = (monthlyUsers || []).filter(u => u.role === 'provider' && new Date(u.createdAt).getMonth() === mIndex && new Date(u.createdAt).getFullYear() === year).length;
      const revenue = (monthlyPayments || [])
        .filter(p => new Date(p.createdAt).getMonth() === mIndex && new Date(p.createdAt).getFullYear() === year)
        .reduce((sum, p) => sum + (p.amountETB || 0), 0);

      registrationsChart.push({ month: label, seekers, providers });
      revenueChart.push({ month: label, value: revenue });
    }

    return res.json({
      totalUsers: totalUsers || 0,
      totalProperties: totalProperties || 0,
      pendingVerifications: pendingVerifications || 0,
      activeAgents: activeAgents || 0,
      totalAgents: totalAgents || 0,
      revenueETB: paymentsSum?._sum?.amountETB || 0,
      pendingReports: pendingReports || 0,
      houseSeekers: houseSeekers || 0,
      houseProviders: houseProviders || 0,
      activeProperties: activeProperties || 0,
      pendingProperties: pendingProperties || 0,
      verifiedProperties: verifiedProperties || 0,
      locationBreakdown: locationBreakdown.length > 0 ? locationBreakdown : [],
      propertyStatusDistribution,
      registrationsChart,
      revenueChart,
    });
  } catch (error) {
    console.error('KPI Fetch error:', error);
    return res.json({
      totalUsers: 0,
      totalProperties: 0,
      pendingVerifications: 0,
      activeAgents: 0,
      totalAgents: 0,
      revenueETB: 0,
      pendingReports: 0,
      houseSeekers: 0,
      houseProviders: 0,
      activeProperties: 0,
      pendingProperties: 0,
      verifiedProperties: 0,
    });
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
    if (role) {
      const roleLower = String(role).toLowerCase();
      if (roleLower === 'house seeker') {
        where.role = 'seeker';
      } else if (roleLower === 'house provider') {
        where.role = 'provider';
      } else {
        where.role = roleLower;
      }
    }
    if (active !== undefined) where.active = active === 'true';

    // Flat list fallback if no pagination params are specified
    if (req.query.page === undefined && req.query.limit === undefined) {
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
        },
      });
      return res.json(users);
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
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
        },
      }),
      prisma.user.count({ where })
    ]);

    return res.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
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

// POST /api/v1/admin/users - Admin create/register new user account (with mobile OTP & verification business rules)
router.post('/users', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, phone, password, confirmPassword, role, city, address, autoVerify } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required fields' });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ error: 'Password and Confirm Password do not match' });
    }

    const emailSanitized = String(email).trim().toLowerCase();
    const nameSanitized = String(name).trim();
    const phoneSanitized = String(phone || '+251 90 000 0000').trim();

    let userRole = 'seeker';
    if (role) {
      const rLower = String(role).toLowerCase();
      if (rLower === 'house provider' || rLower === 'provider') userRole = 'provider';
      else if (rLower === 'agent') userRole = 'agent';
      else if (rLower === 'admin') userRole = 'admin';
      else if (rLower === 'house seeker' || rLower === 'seeker') userRole = 'seeker';
    }

    const existing = await prisma.user.findUnique({ where: { email: emailSanitized } });
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists' });
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate 6-digit Email Verification OTP code for mobile business rules
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    const isVerifiedBool = Boolean(autoVerify);

    const newUser = await prisma.user.create({
      data: {
        name: nameSanitized,
        email: emailSanitized,
        phone: phoneSanitized,
        passwordHash,
        role: userRole,
        city: city || 'Addis Ababa',
        address: address || null,
        isVerified: isVerifiedBool,
        isEmailVerified: isVerifiedBool,
        emailVerificationCode: isVerifiedBool ? null : otpCode,
        emailVerificationExpires: isVerifiedBool ? null : otpExpires,
        active: true,
        ...(userRole === 'agent' && {
          assignedArea: address || city || 'Addis Ababa',
          agentStatus: 'Active',
        }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        isVerified: true,
        isEmailVerified: true,
        emailVerificationCode: true,
        active: true,
        createdAt: true,
        city: true,
        address: true,
        assignedArea: true,
      },
    });

    return res.status(201).json(newUser);
  } catch (error) {
    console.error('Admin create user error:', error);
    return res.status(500).json({ error: 'Failed to create user account' });
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
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        assignedArea: true,
        active: true,
        createdAt: true,
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

// GET /api/v1/admin/payments - Get all financial transactions (Supports time period filtering: 7d, 30d, 6m, 1y, all)
router.get('/payments', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { period } = req.query;
    let dateFilter: Date | undefined = undefined;

    if (period === '7d') {
      dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    } else if (period === '30d') {
      dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    } else if (period === '6m') {
      dateFilter = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    } else if (period === '1y') {
      dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    }

    const where: any = {};
    if (dateFilter) {
      where.createdAt = { gte: dateFilter };
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true, role: true }
        },
        subscription: {
          include: {
            plan: {
              select: { name: true, priceETB: true, maxListings: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(payments);
  } catch (error) {
    console.error('Fetch payments error:', error);
    return res.status(500).json({ error: 'Failed to fetch payments' });
  }
});

// DELETE /api/v1/admin/payments/clear-all - Clear all payment transaction logs
router.delete('/payments/clear-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await prisma.payment.deleteMany({});

    return res.json({ success: true, message: 'All payment transaction logs cleared successfully' });
  } catch (error) {
    console.error('Clear payments error:', error);
    return res.status(500).json({ error: 'Failed to clear payment transactions' });
  }
});

// DELETE /api/v1/admin/payments/:id - Delete single payment transaction log
router.delete('/payments/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ error: 'Invalid payment ID parameter' });
    }

    await prisma.payment.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'Payment transaction deleted successfully' });
  } catch (error) {
    console.error('Delete payment error:', error);
    return res.status(500).json({ error: 'Failed to delete payment transaction' });
  }
});

// PUT /api/v1/admin/users/:id - Edit user profile info (Admin only)
router.put('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, email, phone, role, active, assignedArea, agentStatus, avatarUrl } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone }),
        ...(role && { role }),
        ...(active !== undefined && { active: Boolean(active) }),
        ...(assignedArea && { assignedArea }),
        ...(agentStatus && { agentStatus }),
        ...(avatarUrl && { avatarUrl }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        assignedArea: true,
        avatarUrl: true,
      }
    });

    return res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// DELETE /api/v1/admin/users/:id - Delete user account (Admin only)
router.delete('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;

    // Rule 1: Admin cannot delete their own account
    if (id === req.user?.id) {
      return res.status(400).json({ error: 'Administrators cannot delete their own account' });
    }

    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found' });
    }

    // Rule 2: Cannot delete the last remaining administrator
    if (targetUser.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: 'Cannot delete the last remaining administrator account' });
      }
    }

    // Delete user from database
    await prisma.user.delete({
      where: { id },
    });

    return res.json({ success: true, message: 'User account successfully deleted' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ error: 'Failed to delete user account' });
  }
});

// PATCH /api/v1/admin/reports/:id/resolve - Action Body: action ('resolve', 'dismiss', 'delete_property')
router.patch('/reports/:id/resolve', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { action } = req.body; // 'resolve', 'dismiss', 'delete_property'

    if (!action) {
      return res.status(400).json({ error: 'Action is required' });
    }

    const report = await prisma.report.findUnique({
      where: { id },
      include: { property: true },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (action === 'delete_property') {
      // Delete the reported property (cascades will delete associated reports)
      await prisma.property.delete({
        where: { id: report.propertyId },
      });
      return res.json({ success: true, message: 'Property deleted and associated reports resolved' });
    } else if (action === 'resolve' || action === 'dismiss') {
      // Resolve/dismiss by removing the report from the queue
      await prisma.report.delete({
        where: { id },
      });
      return res.json({ success: true, message: `Report marked as ${action}` });
    } else {
      return res.status(400).json({ error: 'Invalid resolve action' });
    }
  } catch (error) {
    console.error('Resolve report error:', error);
    return res.status(500).json({ error: 'Failed to resolve report' });
  }
});

// POST /api/v1/admin/tasks - Assign / create a task for an agent
router.post('/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { title, type, propertyId, assignedAgentId, dueDate, priority, description } = req.body;

    if (!title || !type || !assignedAgentId || !dueDate || !description) {
      return res.status(400).json({ error: 'Missing required task fields' });
    }

    // Check if agent exists
    const agent = await prisma.user.findUnique({
      where: { id: assignedAgentId, role: 'agent' },
    });
    if (!agent) {
      return res.status(400).json({ error: 'Assigned user is not an agent or does not exist' });
    }

    let propertyTitle = null;
    let providerName = null;
    if (propertyId) {
      const property = await prisma.property.findUnique({
        where: { id: propertyId },
      });
      if (property) {
        propertyTitle = property.title;
        providerName = property.providerName;
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        type,
        propertyId,
        propertyTitle,
        providerName,
        assignedAgentId,
        dueDate: new Date(dueDate),
        priority: priority || 'Medium',
        status: 'Pending',
        description,
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to assign task to agent' });
  }
});

// GET /api/v1/admin/tasks - List all tasks for admin tracking
router.get('/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const tasks = await prisma.task.findMany({
      include: {
        assignedAgent: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET /api/v1/admin/cms/configs - List all configurations
router.get('/cms/configs', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    let configs = await withDbRetry(() => prisma.platformConfig.findMany());
    if (configs.length === 0) {
      // Auto-initialize default platform settings if not yet present
      const defaultConfig = await withDbRetry(() =>
        prisma.platformConfig.create({
          data: {
            key: 'platform_settings',
            value: JSON.stringify({
              language: 'en',
              currency: 'ETB',
              commissionRate: 5,
              theme: 'dark',
              twoFactorAuth: true,
              sessionTimeout: true,
            }),
          },
        })
      );
      configs = [defaultConfig];
    }
    return res.json(configs);
  } catch (error) {
    console.error('Fetch CMS configs error:', error);
    return res.status(500).json({ error: 'Failed to fetch CMS configurations' });
  }
});

// PUT /api/v1/admin/cms/configs/:key - Update system configuration
router.put('/cms/configs/:key', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (value === undefined) {
      return res.status(400).json({ error: 'Value is required' });
    }

    const valueStr = typeof value === 'string' ? value : JSON.stringify(value);

    const config = await withDbRetry(() =>
      prisma.platformConfig.upsert({
        where: { key },
        update: { value: valueStr },
        create: { key, value: valueStr },
      })
    );

    return res.json({ success: true, config });
  } catch (error) {
    console.error('Update CMS config error:', error);
    return res.status(500).json({ error: 'Failed to update CMS configuration' });
  }
});

// GET /api/v1/admin/subscription-plans - List subscription plans
router.get('/subscription-plans', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const plans = await prisma.subscriptionPlan.findMany({
      orderBy: { priceETB: 'asc' },
    });
    return res.json(plans);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
});

// POST /api/v1/admin/subscription-plans - Create subscription plan
router.post('/subscription-plans', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, priceETB, durationDays, maxListings, features } = req.body;

    if (!name || priceETB === undefined || !durationDays) {
      return res.status(400).json({ error: 'Name, priceETB, and durationDays are required' });
    }

    const featuresStr = typeof features === 'string' ? features : JSON.stringify(features || []);

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name,
        priceETB: Number(priceETB),
        durationDays: Number(durationDays),
        maxListings: Number(maxListings || 10),
        features: featuresStr,
      },
    });

    return res.status(201).json(plan);
  } catch (error) {
    console.error('Create plan error:', error);
    return res.status(500).json({ error: 'Failed to create subscription plan' });
  }
});

// PUT /api/v1/admin/subscription-plans/:id - Update subscription plan
router.put('/subscription-plans/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, priceETB, durationDays, maxListings, features } = req.body;

    const featuresStr = features ? (typeof features === 'string' ? features : JSON.stringify(features)) : undefined;

    const plan = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(priceETB !== undefined && { priceETB: Number(priceETB) }),
        ...(durationDays !== undefined && { durationDays: Number(durationDays) }),
        ...(maxListings !== undefined && { maxListings: Number(maxListings) }),
        ...(featuresStr && { features: featuresStr }),
      },
    });

    return res.json(plan);
  } catch (error) {
    console.error('Update plan error:', error);
    return res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

// ==========================================
// PLATFORM AGENT MANAGEMENT CRUD ENDPOINTS
// ==========================================

// GET /api/v1/admin/agents - Fetch all platform field agents
router.get('/agents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const agents = await withDbRetry(() =>
      prisma.user.findMany({
        where: {
          role: { in: ['agent', 'AGENT'] }
        },
        include: {
          tasks: {
            where: { status: { in: ['Pending', 'In Progress'] } }
          },
          assistedTenants: true,
          assistedBookings: true,
          leaseAgreements: true,
        },
        orderBy: { createdAt: 'desc' },
      })
    );

    const formattedAgents = await Promise.all(
      agents.map(async (a) => {
        const areaFilter = a.assignedArea ? { area: { contains: a.assignedArea } } : {};
        const [propsCount, verificationsCount] = await Promise.all([
          prisma.property.count({ where: areaFilter }).catch(() => 0),
          prisma.task.count({ where: { assignedAgentId: a.id, status: 'Completed' } }).catch(() => 0),
        ]);

        return {
          id: a.id,
          name: a.name,
          email: a.email,
          phone: a.phone,
          role: a.role,
          avatarUrl: a.avatarUrl,
          assignedArea: a.assignedArea || 'Addis Ababa',
          propertiesManaged: propsCount,
          verificationsCompleted: verificationsCount,
          activeTasks: a.tasks ? a.tasks.length : 0,
          performanceScore: 98.0,
          agentStatus: a.active ? 'Active' : 'Suspended',
          joinedDate: a.createdAt,
          city: a.city,
        };
      })
    );

    return res.json(formattedAgents);
  } catch (error) {
    console.error('Fetch agents error:', error);
    return res.status(500).json({ error: 'Failed to fetch field agents' });
  }
});

// POST /api/v1/admin/agents - Register a new field agent
router.post('/agents', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { name, email, phone, password, assignedArea, city } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    const passwordHash = await require('bcryptjs').hash(password, 10);

    const agent = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role: 'agent',
        isVerified: true,
        isEmailVerified: true,
        isPhoneVerified: true,
        active: true,
        assignedArea: assignedArea || 'Addis Ababa',
        city: city || 'Addis Ababa',
      },
    });

    await prisma.notification.create({
      data: {
        userId: agent.id,
        title: 'Welcome Field Agent! 🚀',
        message: `Your agent account for ${agent.assignedArea} has been created by Platform Administrator.`,
        type: 'SYSTEM',
      },
    });

    return res.status(201).json({
      id: agent.id,
      name: agent.name,
      email: agent.email,
      phone: agent.phone,
      role: agent.role,
      assignedArea: agent.assignedArea,
      agentStatus: agent.active ? 'Active' : 'Suspended',
      performanceScore: 98.0,
      joinedDate: agent.createdAt,
    });
  } catch (error: any) {
    console.error('Create agent error:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email address is already registered' });
    }
    return res.status(500).json({ error: 'Failed to create field agent' });
  }
});

// PUT /api/v1/admin/agents/:id - Update field agent details & territory
router.put('/agents/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, phone, assignedArea, agentStatus, performanceScore, city } = req.body;

    const agent = await prisma.user.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const updatedAgent = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(assignedArea && { assignedArea }),
        ...(agentStatus && {
          active: agentStatus === 'Active',
        }),
        ...(city && { city }),
      },
    });

    return res.json({
      id: updatedAgent.id,
      name: updatedAgent.name,
      email: updatedAgent.email,
      phone: updatedAgent.phone,
      assignedArea: updatedAgent.assignedArea,
      agentStatus: updatedAgent.active ? 'Active' : 'Suspended',
      performanceScore: 98.0,
    });
  } catch (error) {
    console.error('Update agent error:', error);
    return res.status(500).json({ error: 'Failed to update agent' });
  }
});

// DELETE /api/v1/admin/agents/:id - Delete field agent
router.delete('/agents/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const agent = await prisma.user.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'Agent account removed successfully' });
  } catch (error) {
    console.error('Delete agent error:', error);
    return res.status(500).json({ error: 'Failed to delete agent account' });
  }
});

// POST /api/v1/admin/agents/:id/tasks - Assign a new task to field agent
router.post('/agents/:id/tasks', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { title, type, priority, dueDate, description, propertyId, propertyTitle, providerName } = req.body;

    if (!title || !type || !dueDate) {
      return res.status(400).json({ error: 'Title, type, and due date are required' });
    }

    const agent = await prisma.user.findUnique({ where: { id } });
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    const task = await prisma.task.create({
      data: {
        title,
        type,
        priority: priority || 'Medium',
        dueDate: new Date(dueDate),
        description: description || 'Field inspection task assigned by Admin.',
        propertyId: propertyId || null,
        propertyTitle: propertyTitle || null,
        providerName: providerName || null,
        assignedAgentId: id,
        status: 'Pending',
      },
    });

    return res.status(201).json(task);
  } catch (error) {
    console.error('Assign agent task error:', error);
    return res.status(500).json({ error: 'Failed to assign task to agent' });
  }
});

// GET /api/v1/admin/agents/:id/details - Fetch full agent details with linked items
router.get('/agents/:id/details', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const agent = await prisma.user.findUnique({
      where: { id },
      include: {
        tasks: { orderBy: { dueDate: 'asc' } },
        assistedTenants: { orderBy: { createdAt: 'desc' } },
        assistedBookings: { include: { tenant: true, property: true }, orderBy: { createdAt: 'desc' } },
        leaseAgreements: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    return res.json(agent);
  } catch (error) {
    console.error('Fetch agent details error:', error);
    return res.status(500).json({ error: 'Failed to fetch agent details' });
  }
});

export default router;

