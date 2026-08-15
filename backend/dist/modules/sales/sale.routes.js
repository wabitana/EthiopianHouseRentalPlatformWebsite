"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sale_service_1 = require("./sale.service");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/v1/sales (Submit Purchase Request)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const buyerId = req.user?.id;
        if (!buyerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { propertyId, offeredPriceETB, notes } = req.body;
        if (!propertyId || !offeredPriceETB) {
            return res.status(400).json({ error: 'propertyId and offeredPriceETB are required' });
        }
        const saleReq = await sale_service_1.saleService.createSaleRequest({
            propertyId,
            buyerId,
            offeredPriceETB,
            notes,
        });
        return res.status(201).json(saleReq);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to submit sale request' });
    }
});
// GET /api/v1/sales (Get User Sale Requests)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role || 'seeker';
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const requests = await sale_service_1.saleService.getUserSaleRequests(userId, role);
        return res.json(requests);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch sale requests' });
    }
});
// PATCH /api/v1/sales/:id/status (Accept / Legal Process / Complete Sale)
router.patch('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status } = req.body;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!status)
            return res.status(400).json({ error: 'Status is required' });
        const updated = await sale_service_1.saleService.updateSaleStatus(id, userId, status);
        return res.json(updated);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to update sale status' });
    }
});
exports.default = router;
