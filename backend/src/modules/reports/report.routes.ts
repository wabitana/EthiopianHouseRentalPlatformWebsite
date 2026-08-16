import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// POST /api/v1/reports
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const reporterId = req.user?.id;
    if (!reporterId) return res.status(401).json({ error: 'Unauthorized' });

    const { propertyId, reason, details } = req.body;
    if (!propertyId || !reason) {
      return res.status(400).json({ error: 'Property ID and reason are required' });
    }

    const report = await prisma.report.create({
      data: {
        propertyId,
        reporterId,
        reason,
        details,
      },
    });

    return res.status(201).json({ success: true, report });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

export default router;
