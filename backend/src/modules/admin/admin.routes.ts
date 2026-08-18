import { Router } from 'express';
import { prisma } from '../../prisma';
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
          agentStatus: true,
          joinedDate: true,
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
          agentStatus: true,
          joinedDate: true,
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

// PUT /api/v1/admin/users/:id - Edit user profile info (Admin only)
router.put('/users/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, email, phone, role, active, assignedArea, agentStatus } = req.body;

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
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        active: true,
        assignedArea: true,
        agentStatus: true,
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

    // Increment activeTasks count on the agent
    await prisma.user.update({
      where: { id: assignedAgentId },
      data: {
        activeTasks: {
          increment: 1,
        },
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

    const configs = await prisma.platformConfig.findMany();
    return res.json(configs);
  } catch (error) {
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

    const config = await prisma.platformConfig.upsert({
      where: { key },
      update: { value: valueStr },
      create: { key, value: valueStr },
    });

    return res.json({ success: true, config });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update CMS configuration' });
  }
});

export default router;

