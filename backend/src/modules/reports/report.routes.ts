import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/v1/reports (Submit Property Abuse / Security Report)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reporterId = req.user?.id;
    if (!reporterId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, reason, details } = req.body;
    if (!propertyId || !reason) {
      return res.status(400).json({ error: 'Property ID and reason are required' });
    }

    const property = await prisma.property.findUnique({ where: { id: propertyId } });
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    const reporter = await prisma.user.findUnique({ where: { id: reporterId } });
    const reporterName = reporter?.name || 'A user';

    const report = await prisma.report.create({
      data: {
        propertyId,
        reporterId,
        reason,
        details: details || null,
      },
    });

    // 1. Notify Property Provider that the listing has been flagged
    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: '⚠️ Listing Flagged for Compliance Review',
        message: `Your property listing "${property.title}" received a report regarding: ${reason}. Please ensure listing accuracy.`,
        type: 'SECURITY_ALERT',
      },
    });

    // 2. Dispatch Confirmation Notification to Reporter
    await prisma.notification.create({
      data: {
        userId: reporterId,
        title: '🛡️ Security Report Received',
        message: `Thank you for reporting "${property.title}" (${reason}). Our moderation team is actively reviewing the listing.`,
        type: 'SECURITY_ALERT',
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Report submitted successfully. Thank you for keeping Ethiopian House Rental safe!',
      report,
    });
  } catch (error: any) {
    console.error('Submit report error:', error);
    return res.status(500).json({ error: error.message || 'Failed to submit report' });
  }
});

// GET /api/v1/reports/my-reports (Get reporter's historical reports)
router.get('/my-reports', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reporterId = req.user?.id;
    if (!reporterId) return res.status(401).json({ error: 'Unauthorized' });

    const reports = await prisma.report.findMany({
      where: { reporterId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, reports });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

export default router;
