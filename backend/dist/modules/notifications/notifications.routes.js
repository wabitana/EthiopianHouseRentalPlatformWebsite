"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/v1/notifications
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const notifications = await prisma_1.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(notifications.map((n) => ({
            id: n.id,
            userId: n.userId,
            title: n.title,
            message: n.message,
            type: n.type,
            isRead: n.read,
            createdAt: n.createdAt,
        })));
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});
// PATCH /api/v1/notifications/:id/read
router.patch('/:id/read', auth_1.authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        await prisma_1.prisma.notification.updateMany({
            where: { id, userId },
            data: { read: true },
        });
        return res.json({ success: true, message: 'Notification marked as read' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update notification' });
    }
});
exports.default = router;
