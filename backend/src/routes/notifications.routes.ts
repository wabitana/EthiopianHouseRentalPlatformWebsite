import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/v1/notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(
      notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type,
        isRead: n.read,
        createdAt: n.createdAt,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    await prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });

    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

export default router;
