import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

// GET /api/v1/notifications
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let notifications;
    if (role === 'admin') {
      notifications = await prisma.notification.findMany({
        orderBy: { createdAt: 'desc' },
      });
    } else {
      notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    }

    return res.json(
      notifications.map((n) => ({
        id: n.id,
        userId: n.userId,
        title: n.title,
        message: n.message,
        type: n.type || 'SYSTEM',
        read: n.read,
        isRead: n.read,
        link: n.link,
        createdAt: n.createdAt,
      }))
    );
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch notifications' });
  }
});

// PATCH /api/v1/notifications/read-all
router.patch('/read-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    if (role === 'admin') {
      await prisma.notification.updateMany({
        data: { read: true },
      });
    } else if (userId) {
      await prisma.notification.updateMany({
        where: { userId },
        data: { read: true },
      });
    }

    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to mark notifications as read' });
  }
});

// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();
    const { read } = req.body;

    const newReadState = read !== undefined ? Boolean(read) : true;

    if (role === 'admin') {
      await prisma.notification.update({
        where: { id },
        data: { read: newReadState },
      });
    } else {
      await prisma.notification.updateMany({
        where: { id, userId },
        data: { read: newReadState },
      });
    }

    return res.json({ success: true, message: 'Notification status updated' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update notification' });
  }
});

// DELETE /api/v1/notifications/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    if (role === 'admin') {
      await prisma.notification.delete({
        where: { id },
      });
    } else {
      await prisma.notification.deleteMany({
        where: { id, userId },
      });
    }

    return res.json({ success: true, message: 'Notification deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete notification' });
  }
});

// DELETE /api/v1/notifications/clear-all
router.delete('/clear-all', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const role = req.user?.role?.toLowerCase();

    if (role === 'admin') {
      await prisma.notification.deleteMany({});
    } else if (userId) {
      await prisma.notification.deleteMany({
        where: { userId },
      });
    }

    return res.json({ success: true, message: 'All notifications deleted' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to clear notifications' });
  }
});

export default router;
