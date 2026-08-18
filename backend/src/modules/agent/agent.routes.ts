import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// Middleware to check if user has 'agent' or 'admin' role
const requireAgentOrAdmin = (req: AuthRequest, res: any, next: any) => {
  const role = req.user?.role?.toLowerCase();
  if (role !== 'agent' && role !== 'admin') {
    return res.status(403).json({ error: 'Agent or Admin access required' });
  }
  next();
};

// GET /api/v1/agent/profile - Retrieve authenticated agent's stats
router.get('/profile', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
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

    if (!user) return res.status(404).json({ error: 'Agent profile not found' });
    return res.json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch agent profile' });
  }
});

// GET /api/v1/agent/tasks - Retrieve tasks assigned to the agent
router.get('/tasks', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tasks = await prisma.task.findMany({
      where: req.user?.role?.toLowerCase() === 'admin' ? {} : { assignedAgentId: userId },
      orderBy: { dueDate: 'asc' },
    });
    return res.json(tasks);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// PATCH /api/v1/agent/tasks/:id/status - Update task status
router.patch('/tasks/:id/status', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status) return res.status(400).json({ error: 'Status is required' });

    const task = await prisma.task.findUnique({ where: { id } });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    if (task.assignedAgentId !== userId && req.user?.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    // Update agent active tasks count
    const activeTasksCount = await prisma.task.count({
      where: { assignedAgentId: task.assignedAgentId, status: { in: ['Pending', 'In Progress'] } }
    });

    const completedTasksCount = await prisma.task.count({
      where: { assignedAgentId: task.assignedAgentId, status: 'Completed' }
    });

    await prisma.user.update({
      where: { id: task.assignedAgentId },
      data: {
        activeTasks: activeTasksCount,
        verificationsCompleted: completedTasksCount,
      }
    });

    return res.json(updatedTask);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update task status' });
  }
});

// GET /api/v1/agent/assisted-tenants - List all registered offline seekers
router.get('/assisted-tenants', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const tenants = await prisma.assistedTenant.findMany({
      where: req.user?.role?.toLowerCase() === 'admin' ? {} : { agentId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(tenants);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assisted tenants' });
  }
});

// POST /api/v1/agent/assisted-tenants - Register a new offline seeker
router.post('/assisted-tenants', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const {
      fullName,
      featurePhone,
      kebeleIdNumber,
      region,
      woreda,
      preferredHouseType,
      maxBudgetETB,
      familySize,
      hasSmartphone,
    } = req.body;

    if (!fullName || !featurePhone || !kebeleIdNumber) {
      return res.status(400).json({ error: 'Full Name, Phone, and Kebele ID are required' });
    }

    const tenant = await prisma.assistedTenant.create({
      data: {
        fullName,
        featurePhone,
        kebeleIdNumber,
        region: region || 'Addis Ababa',
        woreda: woreda || '01',
        preferredHouseType: preferredHouseType || 'Apartment',
        maxBudgetETB: Number(maxBudgetETB || 0),
        familySize: Number(familySize || 1),
        hasSmartphone: Boolean(hasSmartphone),
        agentId: userId!,
      },
    });

    return res.status(201).json(tenant);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Phone number already registered' });
    }
    return res.status(500).json({ error: 'Failed to register assisted tenant' });
  }
});

// GET /api/v1/agent/assisted-bookings - List bookings managed by agent
router.get('/assisted-bookings', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const bookings = await prisma.assistedBooking.findMany({
      where: req.user?.role?.toLowerCase() === 'admin' ? {} : { agentId: userId },
      include: { tenant: true, property: true },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(bookings);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch assisted bookings' });
  }
});

// POST /api/v1/agent/assisted-bookings - Create a booking
router.post('/assisted-bookings', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const {
      tenantId,
      propertyId,
      monthlyRentETB,
      depositETB,
      paymentMethod,
      receiptNumber,
      status,
    } = req.body;

    if (!tenantId || !propertyId || !paymentMethod || !receiptNumber) {
      return res.status(400).json({ error: 'Tenant, Property, Payment Method, and Receipt Number are required' });
    }

    const booking = await prisma.assistedBooking.create({
      data: {
        tenantId,
        propertyId,
        monthlyRentETB: Number(monthlyRentETB),
        depositETB: Number(depositETB || 0),
        paymentMethod,
        receiptNumber,
        status: status || 'Pending Payment',
        agentId: userId!,
      },
      include: { tenant: true, property: true },
    });

    return res.status(201).json(booking);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Receipt number already exists' });
    }
    return res.status(500).json({ error: 'Failed to create assisted booking' });
  }
});

// GET /api/v1/agent/leases - List agreements managed by agent
router.get('/leases', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const leases = await prisma.leaseAgreement.findMany({
      where: req.user?.role?.toLowerCase() === 'admin' ? {} : { agentId: userId },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(leases);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch lease agreements' });
  }
});

// POST /api/v1/agent/leases - Create witnessed lease agreement
router.post('/leases', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const {
      bookingId,
      tenantName,
      tenantKebeleId,
      providerName,
      providerIdNumber,
      propertyTitle,
      location,
      monthlyRentETB,
      startDate,
      endDate,
      kebeleWitnessName,
      kebeleWitnessStamp,
      status,
    } = req.body;

    if (!bookingId || !tenantName || !tenantKebeleId || !providerName || !kebeleWitnessName) {
      return res.status(400).json({ error: 'Missing required lease details' });
    }

    const lease = await prisma.leaseAgreement.create({
      data: {
        bookingId,
        tenantName,
        tenantKebeleId,
        providerName,
        providerIdNumber: providerIdNumber || 'PRV-OFFLINE',
        propertyTitle,
        location,
        monthlyRentETB: Number(monthlyRentETB),
        startDate: new Date(startDate || Date.now()),
        endDate: new Date(endDate || Date.now() + 365 * 24 * 60 * 60 * 1000),
        kebeleWitnessName,
        kebeleWitnessStamp: kebeleWitnessStamp || 'OFFICIAL_KEBELE_STAMP',
        status: status || 'Official Draft',
        agentId: userId!,
      },
    });

    // Update Booking status to confirm signed lease
    await prisma.assistedBooking.update({
      where: { id: bookingId },
      data: { status: 'Confirmed & Signed' },
    });

    return res.status(201).json(lease);
  } catch (error) {
    console.error('Lease creation error:', error);
    return res.status(500).json({ error: 'Failed to create lease agreement' });
  }
});

// GET /api/v1/agent/feature-phone-sms - Retrieve SMS history
router.get('/feature-phone-sms', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const messages = await prisma.featurePhoneSms.findMany({
      where: req.user?.role?.toLowerCase() === 'admin' ? {} : { agentId: userId },
      orderBy: { sentTime: 'desc' },
    });
    return res.json(messages);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch SMS records' });
  }
});

// POST /api/v1/agent/feature-phone-sms - Log/send text message
router.post('/feature-phone-sms', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { recipientPhone, recipientName, messageAmharic, messageEnglish, status } = req.body;

    if (!recipientPhone || !recipientName || !messageAmharic) {
      return res.status(400).json({ error: 'Recipient phone, name, and Amharic message are required' });
    }

    const sms = await prisma.featurePhoneSms.create({
      data: {
        recipientPhone,
        recipientName,
        messageAmharic,
        messageEnglish: messageEnglish || '',
        status: status || 'Queued',
        agentId: userId!,
      },
    });

    return res.status(201).json(sms);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to log SMS record' });
  }
});

// PATCH /api/v1/agent/properties/:id/inspect - Record field inspection notes & verify property
router.patch('/properties/:id/inspect', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { notes, documentUrl, listingStatus } = req.body;

    // Verify property exists
    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    // Update property listingStatus, verification, etc.
    const updatedProperty = await prisma.property.update({
      where: { id },
      data: {
        isVerified: true,
        listingStatus: listingStatus || 'active',
      },
    });

    // If document URL is provided, record it in PropertyDocument
    if (documentUrl) {
      await prisma.propertyDocument.create({
        data: {
          propertyId: id,
          ownerId: property.providerId,
          docType: 'SITE_PLAN',
          docUrl: documentUrl,
          status: 'VERIFIED',
          aiNotes: notes || 'Field inspection notes uploaded by agent.',
        },
      });
    }

    // Increment agent verifications completed
    const userId = req.user?.id;
    if (userId && req.user?.role?.toLowerCase() === 'agent') {
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationsCompleted: { increment: 1 },
        },
      });
    }

    // Create system notification
    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'Property Inspected and Verified 🎉',
        message: `Your property listing "${property.title}" has been verified on-site by our agent.`,
        type: 'PROPERTY',
      },
    });

    return res.json({ success: true, property: updatedProperty, notes });
  } catch (error) {
    console.error('On-site inspection error:', error);
    return res.status(500).json({ error: 'Failed to record on-site inspection' });
  }
});

export default router;
