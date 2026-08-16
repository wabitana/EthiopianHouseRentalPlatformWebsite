"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/v1/reports
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const reporterId = req.user?.id;
        if (!reporterId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { propertyId, reason, details } = req.body;
        if (!propertyId || !reason) {
            return res.status(400).json({ error: 'Property ID and reason are required' });
        }
        const report = await prisma_1.prisma.report.create({
            data: {
                propertyId,
                reporterId,
                reason,
                details,
            },
        });
        return res.status(201).json({ success: true, report });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to submit report' });
    }
});
exports.default = router;
