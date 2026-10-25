import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// ==========================================
// POST /api/v1/maintenance - Create a maintenance request (Tenant/Seeker)
// ==========================================
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const { title, description, category, propertyId, propertyTitle, providerId } = req.body;

    if (!title || !description) {
      return res.status(400).json({ error: 'Title and description are required.' });
    }

    let resolvedProviderId = providerId;
    let resolvedPropertyTitle = propertyTitle;

    if (propertyId && (!resolvedProviderId || !resolvedPropertyTitle)) {
      const prop = await prisma.property.findUnique({
        where: { id: propertyId },
        select: { providerId: true, title: true },
      });
      if (prop) {
        if (!resolvedProviderId) resolvedProviderId = prop.providerId;
        if (!resolvedPropertyTitle) resolvedPropertyTitle = prop.title;
      }
    }

    // Fallback if still no providerId: assign to the user themselves (dual role test) or first provider
    if (!resolvedProviderId) {
      resolvedProviderId = userId;
    }

    // Get tenant info
    const tenant = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true } });

    // Get provider info
    const provider = await prisma.user.findUnique({ where: { id: resolvedProviderId }, select: { name: true } });

    const maintenanceRequest = await prisma.maintenanceRequest.create({
      data: {
        tenantId: userId,
        providerId: resolvedProviderId,
        propertyId: propertyId || null,
        propertyTitle: resolvedPropertyTitle || null,
        title,
        description,
        category: category || 'General',
        tenantName: tenant?.name || 'Tenant',
        tenantPhone: tenant?.phone || null,
        providerName: provider?.name || 'Landlord',
        status: 'PENDING',
      },
    });

    // Create a notification for the provider
    try {
      await prisma.notification.create({
        data: {
          userId: providerId,
          title: '🛠️ New Maintenance Request',
          message: `${tenant?.name || 'A tenant'} reported: "${title}" (${category || 'General'})`,
          type: 'MAINTENANCE',
          link: maintenanceRequest.id,
        },
      });
    } catch (_) {}

    return res.status(201).json(maintenanceRequest);
  } catch (error: any) {
    console.error('Create maintenance request error:', error);
    return res.status(500).json({ error: 'Failed to create maintenance request.' });
  }
});

// ==========================================
// GET /api/v1/maintenance/my-tickets - Get tenant's own tickets
// ==========================================
router.get('/my-tickets', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const tickets = await prisma.maintenanceRequest.findMany({
      where: { tenantId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tickets);
  } catch (error: any) {
    console.error('Fetch tenant tickets error:', error);
    return res.status(500).json({ error: 'Failed to fetch maintenance tickets.' });
  }
});

// ==========================================
// GET /api/v1/maintenance/provider-tickets - Get tickets directed at provider
// ==========================================
router.get('/provider-tickets', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    const tickets = await prisma.maintenanceRequest.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(tickets);
  } catch (error: any) {
    console.error('Fetch provider tickets error:', error);
    return res.status(500).json({ error: 'Failed to fetch provider maintenance tickets.' });
  }
});

// ==========================================
// PATCH /api/v1/maintenance/:id/status - Update ticket status (Provider)
// ==========================================
router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { status, providerNotes } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required.' });
    }

    const validStatuses = ['PENDING', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    // Verify the provider owns this ticket
    const ticket = await prisma.maintenanceRequest.findUnique({ where: { id } });
    if (!ticket) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }
    if (ticket.providerId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to update this ticket.' });
    }

    const updated = await prisma.maintenanceRequest.update({
      where: { id },
      data: {
        status,
        providerNotes: providerNotes || ticket.providerNotes,
      },
    });

    // Notify tenant about status update
    try {
      const statusLabel = status === 'IN_PROGRESS' ? 'In Progress' : status === 'RESOLVED' ? 'Resolved ✓' : status === 'REJECTED' ? 'Rejected' : 'Updated';
      await prisma.notification.create({
        data: {
          userId: ticket.tenantId,
          title: `🔧 Repair ${statusLabel}`,
          message: `Your repair request "${ticket.title}" has been marked as ${statusLabel} by your landlord.${providerNotes ? ` Note: ${providerNotes}` : ''}`,
          type: 'MAINTENANCE',
          link: ticket.id,
        },
      });
    } catch (_) {}

    return res.json(updated);
  } catch (error: any) {
    console.error('Update maintenance status error:', error);
    return res.status(500).json({ error: 'Failed to update maintenance ticket.' });
  }
});

// ==========================================
// GET /api/v1/maintenance/:id - Get a single ticket detail
// ==========================================
router.get('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const ticket = await prisma.maintenanceRequest.findUnique({ where: { id } });

    if (!ticket) {
      return res.status(404).json({ error: 'Maintenance ticket not found.' });
    }

    // Only tenant or provider can view
    if (ticket.tenantId !== userId && ticket.providerId !== userId) {
      return res.status(403).json({ error: 'You are not authorized to view this ticket.' });
    }

    return res.json(ticket);
  } catch (error: any) {
    console.error('Fetch ticket detail error:', error);
    return res.status(500).json({ error: 'Failed to fetch ticket details.' });
  }
});

export default router;
