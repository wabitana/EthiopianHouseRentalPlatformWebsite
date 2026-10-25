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

import {
  getTownKeywords,
  buildPropertyTerritoryFilter,
  buildUserTerritoryFilter,
  isPropertyInTerritory,
  isUserInTerritory,
  isTextInTerritory,
  verifyAgentPropertyAccess,
  verifyAgentUserAccess,
} from '../../utils/agentTerritory';

// Backward compatibility alias for local route calls
const buildPropertyTownFilter = buildPropertyTerritoryFilter;
const buildUserTownFilter = buildUserTerritoryFilter;

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
        city: true,
        region: true,
        address: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'Agent profile not found' });

    // Calculate dynamic stats scoped to agent's assigned town
    const assignedTown = user.assignedArea || user.city || '';
    const areaFilter = buildPropertyTownFilter(assignedTown);

    const [propsCount, verificationsCount, activeTasksCount] = await Promise.all([
      prisma.property.count({ where: areaFilter }).catch(() => 0),
      prisma.task.count({ where: { assignedAgentId: user.id, status: 'Completed' } }).catch(() => 0),
      prisma.task.count({ where: { assignedAgentId: user.id, status: { in: ['Pending', 'In Progress'] } } }).catch(() => 0),
    ]);

    return res.json({
      ...user,
      propertiesManaged: propsCount,
      verificationsCompleted: verificationsCount,
      activeTasks: activeTasksCount,
      performanceScore: 98.0,
      agentStatus: user.active ? 'Active' : 'Suspended',
      joinedDate: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch agent profile' });
  }
});

// PATCH & PUT /api/v1/agent/profile - Update authenticated agent's profile
router.patch('/profile', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, phone, email, avatarUrl, city, region, address } = req.body || {};

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(city ? { city } : {}),
        ...(region ? { region } : {}),
        ...(address !== undefined ? { address } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        assignedArea: true,
        city: true,
        region: true,
        address: true,
        active: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated, message: 'Agent profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update agent profile' });
  }
});

router.put('/profile', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, phone, email, avatarUrl, city, region, address } = req.body || {};

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(name ? { name } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(email ? { email } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl } : {}),
        ...(city ? { city } : {}),
        ...(region ? { region } : {}),
        ...(address !== undefined ? { address } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        avatarUrl: true,
        assignedArea: true,
        city: true,
        region: true,
        address: true,
        active: true,
        createdAt: true,
      },
    });

    return res.json({ user: updated, message: 'Agent profile updated successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update agent profile' });
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
        contractNumber: `LEA-${Date.now()}`,
        bookingId,
        tenantName,
        tenantKebeleId,
        landlordName: providerName || 'Landlord',
        providerName,
        providerIdNumber: providerIdNumber || 'PRV-OFFLINE',
        propertyTitle,
        location,
        monthlyRentETB: Number(monthlyRentETB),
        depositETB: 0,
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

    const userRole = req.user?.role?.toLowerCase() || 'agent';
    const access = await verifyAgentPropertyAccess(req.user!.id, userRole, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    const property = access.property;

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

router.get('/stats', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';
    const agentUser = await prisma.user.findUnique({ where: { id: userId } });
    const assignedArea = agentUser?.assignedArea || agentUser?.city || 'Addis Ababa';

    const agentWhere = isAdmin ? {} : { agentId: userId };
    const propertyWhere = isAdmin
      ? { availability: true }
      : { availability: true, ...buildPropertyTownFilter(assignedArea) };
    const providerWhere = isAdmin
      ? { role: { in: ['provider', 'PROVIDER', 'landlord'] } }
      : {
          role: { in: ['provider', 'PROVIDER', 'landlord'] },
          OR: [
            ...(buildUserTownFilter(assignedArea).OR || []),
            {
              properties: {
                some: buildPropertyTownFilter(assignedArea),
              },
            },
          ],
        };

    const [
      assistedTenantsCount,
      propertiesCount,
      houseProvidersCount,
      activeTasksCount,
      pendingIdentityDocs,
      pendingPropDocs,
    ] = await Promise.all([
      prisma.assistedTenant.count({ where: agentWhere }).catch(() => 0),
      prisma.property.count({ where: propertyWhere }).catch(() => 0),
      prisma.user.count({ where: providerWhere }).catch(() => 0),
      prisma.task.count({ where: { ...(isAdmin ? {} : { assignedAgentId: userId }), status: { in: ['Pending', 'In Progress'] } } }).catch(() => 0),
      prisma.identityDocument.count({ where: { status: 'PENDING' } }).catch(() => 0),
      prisma.propertyDocument.count({ where: { status: 'PENDING' } }).catch(() => 0),
    ]);

    return res.json({
      assistedTenantsCount,
      propertiesCount,
      houseProvidersCount,
      activeTasksCount,
      pendingVerificationsCount: pendingIdentityDocs + pendingPropDocs,
      assignedArea,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch agent stats' });
  }
});

// Helper to format property response
const formatAgentProperty = (p: any) => {
  let imagesArr: string[] = [];
  try {
    imagesArr = typeof p.images === 'string' ? JSON.parse(p.images) : p.images || [];
  } catch (_) {
    imagesArr = [];
  }

  let amenitiesArr: string[] = [];
  try {
    amenitiesArr = typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities || [];
  } catch (_) {
    amenitiesArr = [];
  }

  return {
    id: p.id,
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
    images: imagesArr,
    amenities: amenitiesArr,
    availability: p.availability,
    isVerified: p.isVerified,
    listingStatus: p.listingStatus,
    viewsCount: p.viewsCount,
    inquiriesCount: p.inquiriesCount,
    providerId: p.providerId,
    providerName: p.provider?.name || p.providerName || 'Landlord',
    providerPhone: p.provider?.phone || p.providerPhone || '',
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
};

// GET /api/v1/agent/properties - List properties strictly filtered to agent's assigned operational town
router.get('/properties', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';
    const { searchQuery, city, area } = req.query;

    let areaFilter: any = {};

    if (!isAdmin) {
      const agentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { assignedArea: true, city: true },
      });

      const assignedTown = (agentUser?.assignedArea || agentUser?.city || '').trim();
      if (assignedTown) {
        areaFilter = buildPropertyTerritoryFilter(assignedTown);
      }
    }

    // Combine with optional search / filter parameters, keeping territory strictly enforced
    const andFilters: any[] = [];
    if (Object.keys(areaFilter).length > 0) {
      andFilters.push(areaFilter);
    }

    if (city && String(city).trim() && String(city).toLowerCase() !== 'all') {
      andFilters.push({ city: { contains: String(city).trim(), mode: 'insensitive' } });
    }

    if (area && String(area).trim() && String(area).toLowerCase() !== 'all') {
      andFilters.push({ area: { contains: String(area).trim(), mode: 'insensitive' } });
    }

    if (searchQuery && String(searchQuery).trim()) {
      const q = String(searchQuery).trim();
      andFilters.push({
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { neighborhood: { contains: q, mode: 'insensitive' } },
          { addressDetails: { contains: q, mode: 'insensitive' } },
        ],
      });
    }

    const where = andFilters.length > 0 ? { AND: andFilters } : {};

    const properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        provider: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            city: true,
          },
        },
      },
    });

    return res.json(properties.map(formatAgentProperty));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch agent properties' });
  }
});

// GET /api/v1/agent/properties/:id - View single property with territorial authorization
router.get('/properties/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    const access = await verifyAgentPropertyAccess(userId, userRole, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    return res.json(formatAgentProperty(access.property));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch property details' });
  }
});

// POST /api/v1/agent/properties - Create property listing restricted to agent's assigned area
router.post('/properties', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id!;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';

    const agentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, phone: true, avatarUrl: true, assignedArea: true, city: true },
    });

    const assignedArea = agentUser?.assignedArea || agentUser?.city || 'Addis Ababa';

    const {
      title,
      description,
      propertyType,
      price,
      rentalPeriod,
      rooms,
      bathrooms,
      city,
      area,
      neighborhood,
      addressDetails,
      images,
      amenities,
      providerId,
    } = req.body;

    if (!title || !price || !city || !area) {
      return res.status(400).json({ error: 'Title, price, city, and area are required' });
    }

    // Territorial Access Control: Ensure the property belongs to agent's assigned territory
    if (!isAdmin) {
      const isAllowed = isPropertyInTerritory({ city, area, neighborhood, addressDetails, title }, assignedArea);
      if (!isAllowed) {
        return res.status(403).json({
          error: `Access Denied: You are only authorized to create properties in your assigned territory (${assignedArea}). You cannot create listings in (${city}, ${area}).`,
        });
      }
    }

    let targetProviderId = userId;
    let targetProviderName = agentUser?.name || 'Agent';
    let targetProviderPhone = agentUser?.phone || '';

    if (providerId) {
      const provider = await prisma.user.findUnique({ where: { id: providerId } });
      if (!provider) {
        return res.status(404).json({ error: 'Assigned landlord/provider not found' });
      }
      if (!isAdmin && !isUserInTerritory(provider, assignedArea)) {
        return res.status(403).json({
          error: `Access Denied: Provider "${provider.name}" does not belong to your assigned territory (${assignedArea}).`,
        });
      }
      targetProviderId = provider.id;
      targetProviderName = provider.name;
      targetProviderPhone = provider.phone || '';
    }

    const created = await prisma.property.create({
      data: {
        providerId: targetProviderId,
        providerName: targetProviderName,
        providerPhone: targetProviderPhone,
        title,
        description: description || '',
        propertyType: propertyType || 'Apartment',
        price: Number(price),
        rentPrice: Number(price),
        rentalPeriod: rentalPeriod || 'Monthly',
        rooms: Number(rooms || 1),
        bathrooms: Number(bathrooms || 1),
        city,
        area,
        neighborhood: neighborhood || area,
        addressDetails: addressDetails || '',
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        availability: true,
        isVerified: true,
        listingStatus: 'active',
      },
    });

    return res.status(201).json(formatAgentProperty(created));
  } catch (error) {
    console.error('Agent create property error:', error);
    return res.status(500).json({ error: 'Failed to create property listing' });
  }
});

// PATCH /api/v1/agent/properties/:id - Update property in agent's assigned area
router.patch('/properties/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;
    const isAdmin = userRole.toLowerCase() === 'admin';

    const access = await verifyAgentPropertyAccess(userId, userRole, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    const {
      title,
      description,
      propertyType,
      price,
      rentalPeriod,
      rooms,
      bathrooms,
      city,
      area,
      neighborhood,
      addressDetails,
      images,
      amenities,
      availability,
      listingStatus,
    } = req.body;

    // Prevent agent from moving property outside assigned territory
    if (!isAdmin && (city || area)) {
      const assignedArea = access.assignedArea!;
      const testProp = { ...access.property, ...(city && { city }), ...(area && { area }) };
      if (!isPropertyInTerritory(testProp, assignedArea)) {
        return res.status(403).json({
          error: `Access Denied: You cannot move a property to a city or area outside your assigned territory (${assignedArea}).`,
        });
      }
    }

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(propertyType && { propertyType }),
        ...(price !== undefined && { price: Number(price) }),
        ...(rentalPeriod && { rentalPeriod }),
        ...(rooms !== undefined && { rooms: Number(rooms) }),
        ...(bathrooms !== undefined && { bathrooms: Number(bathrooms) }),
        ...(city && { city }),
        ...(area && { area }),
        ...(neighborhood && { neighborhood }),
        ...(addressDetails !== undefined && { addressDetails }),
        ...(images && { images: JSON.stringify(images) }),
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(availability !== undefined && { availability: Boolean(availability) }),
        ...(listingStatus && { listingStatus }),
      },
    });

    return res.json(formatAgentProperty(updated));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/v1/agent/properties/:id - Delete property in agent's assigned area
router.delete('/properties/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id!;
    const userRole = req.user?.role!;

    const access = await verifyAgentPropertyAccess(userId, userRole, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete property' });
  }
});

// GET /api/v1/agent/providers - List house providers strictly filtered to agent's assigned operational town
router.get('/providers', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';

    let whereClause: any = { role: { in: ['provider', 'PROVIDER', 'landlord'] } };

    if (!isAdmin) {
      const agentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { assignedArea: true, city: true },
      });

      const assignedTown = (agentUser?.assignedArea || agentUser?.city || '').trim();

      if (assignedTown) {
        whereClause = {
          role: { in: ['provider', 'PROVIDER', 'landlord'] },
          OR: [
            ...(buildUserTerritoryFilter(assignedTown).OR || []),
            {
              properties: {
                some: buildPropertyTerritoryFilter(assignedTown),
              },
            },
          ],
        };
      }
    }

    const providers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        region: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
        properties: { select: { id: true, title: true, city: true, area: true, price: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(providers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch house providers' });
  }
});

// GET /api/v1/agent/seekers - List house seekers strictly filtered to agent's assigned operational town
router.get('/seekers', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';

    let whereClause: any = { role: { in: ['seeker', 'SEEKER', 'tenant'] } };

    if (!isAdmin) {
      const agentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { assignedArea: true, city: true },
      });

      const assignedTown = (agentUser?.assignedArea || agentUser?.city || '').trim();

      if (assignedTown) {
        whereClause = {
          role: { in: ['seeker', 'SEEKER', 'tenant'] },
          ...(buildUserTerritoryFilter(assignedTown)),
        };
      }
    }

    const seekers = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        city: true,
        region: true,
        address: true,
        avatarUrl: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.json(seekers);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch house seekers' });
  }
});

// GET /api/v1/agent/users/:id - View user details with territorial authorization
router.get('/users/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const access = await verifyAgentUserAccess(req.user!.id, req.user!.role, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    const { passwordHash, ...safeUser } = access.targetUser;
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

// POST /api/v1/agent/users - Register a seeker or provider in agent's assigned area
router.post('/users', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id!;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';

    const agentUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { assignedArea: true, city: true },
    });
    const assignedArea = agentUser?.assignedArea || agentUser?.city || 'Addis Ababa';

    const { name, email, phone, role, city, region, address } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const userRole = (role || 'seeker').toLowerCase();
    if (!['seeker', 'provider'].includes(userRole)) {
      return res.status(400).json({ error: 'Agents can only register seekers or providers' });
    }

    const targetCity = city || assignedArea;
    if (!isAdmin) {
      if (!isTextInTerritory(targetCity, assignedArea) && !isTextInTerritory(address, assignedArea)) {
        return res.status(403).json({
          error: `Access Denied: You can only register users in your assigned territory (${assignedArea}).`,
        });
      }
    }

    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash('DelalaUser123!', 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        role: userRole,
        passwordHash,
        city: targetCity,
        region: region || targetCity,
        address,
        assignedArea: targetCity,
        isVerified: true,
        active: true,
      },
    });

    const { passwordHash: _, ...safeUser } = newUser;
    return res.status(201).json(safeUser);
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'Email or phone already registered' });
    }
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// PATCH /api/v1/agent/users/:id - Update seeker or provider in agent's assigned area
router.patch('/users/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const access = await verifyAgentUserAccess(req.user!.id, req.user!.role, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    const { name, phone, address, city, active } = req.body;
    const isAdmin = req.user?.role?.toLowerCase() === 'admin';

    if (!isAdmin && city) {
      if (!isTextInTerritory(city, access.assignedArea)) {
        return res.status(403).json({
          error: `Access Denied: Cannot transfer user to a city outside your assigned territory (${access.assignedArea}).`,
        });
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(address !== undefined && { address }),
        ...(city && { city }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    const { passwordHash: _, ...safeUser } = updated;
    return res.json(safeUser);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user' });
  }
});

// DELETE /api/v1/agent/users/:id - Delete seeker or provider in agent's assigned area
router.delete('/users/:id', authenticateToken, requireAgentOrAdmin, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const access = await verifyAgentUserAccess(req.user!.id, req.user!.role, id);
    if (!access.authorized) {
      return res.status(403).json({ error: access.error });
    }

    if (['admin', 'agent'].includes(access.targetUser.role?.toLowerCase())) {
      return res.status(403).json({ error: 'Cannot delete admin or agent accounts' });
    }

    await prisma.user.delete({ where: { id } });
    return res.json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;
