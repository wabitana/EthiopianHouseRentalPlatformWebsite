import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// POST /api/v1/inquiries (House Seeker creates inquiry)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const seekerId = req.user?.id;
    if (!seekerId) return res.status(401).json({ error: 'Unauthorized' });

    const seekerUser = await prisma.user.findUnique({ where: { id: seekerId } });
    if (!seekerUser) return res.status(404).json({ error: 'User not found' });

    const { propertyId, message } = req.body;
    if (!propertyId || !message) {
      return res.status(400).json({ error: 'Property ID and message are required' });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    const propertyImage = images && images.length > 0 ? images[0] : '';

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId,
        propertyTitle: property.title,
        propertyImage,
        seekerId,
        seekerName: seekerUser.name,
        seekerPhone: seekerUser.phone,
        providerId: property.providerId,
        message,
        status: 'new_inquiry',
      },
    });

    // Increment property inquiries count
    await prisma.property.update({
      where: { id: propertyId },
      data: { inquiriesCount: { increment: 1 } },
    });

    // Notify House Provider of new inquiry
    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'New Rental Inquiry',
        message: `${seekerUser.name} sent an inquiry for "${property.title}".`,
        type: 'INQUIRY',
      },
    });

    return res.status(201).json(inquiry);
  } catch (error) {
    console.error('Create inquiry error:', error);
    return res.status(500).json({ error: 'Failed to create inquiry' });
  }
});

// GET /api/v1/inquiries (Role-aware: Seekers see sent, Providers see received)
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const where = role === 'provider' ? { providerId: userId } : { seekerId: userId };

    const inquiries = await prisma.inquiry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch inquiries' });
  }
});

// PATCH /api/v1/inquiries/:id (Provider responds or changes status)
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const { status, response } = req.body;

    const inquiry = await prisma.inquiry.findUnique({ where: { id } });
    if (!inquiry) return res.status(404).json({ error: 'Inquiry not found' });

    if (inquiry.providerId !== userId && inquiry.seekerId !== userId) {
      return res.status(403).json({ error: 'Not authorized to modify this inquiry' });
    }

    const updated = await prisma.inquiry.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(response !== undefined && { response }),
      },
    });

    // Notify seeker if provider responded
    if (response && inquiry.seekerId) {
      await prisma.notification.create({
        data: {
          userId: inquiry.seekerId,
          title: 'Inquiry Response',
          message: `Provider responded to your inquiry for "${inquiry.propertyTitle}": "${response}".`,
          type: 'RESPONSE',
        },
      });
    }

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update inquiry' });
  }
});

export default router;
