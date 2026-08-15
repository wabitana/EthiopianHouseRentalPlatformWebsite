"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rental_service_1 = require("./rental.service");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/v1/rentals (Create Rental Request)
router.post('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const renterId = req.user?.id;
        if (!renterId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { propertyId, proposedStartDate, notes } = req.body;
        if (!propertyId)
            return res.status(400).json({ error: 'propertyId is required' });
        const rentalReq = await rental_service_1.rentalService.createRentalRequest({
            propertyId,
            renterId,
            proposedStartDate,
            notes,
        });
        return res.status(201).json(rentalReq);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to create rental request' });
    }
});
// GET /api/v1/rentals (Get User Rental Requests)
router.get('/', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role || 'seeker';
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const requests = await rental_service_1.rentalService.getUserRentalRequests(userId, role);
        return res.json(requests);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch rental requests' });
    }
});
// PATCH /api/v1/rentals/:id/status (Accept / Reject / Activate Rental)
router.patch('/:id/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        const { id } = req.params;
        const { status } = req.body;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!status)
            return res.status(400).json({ error: 'Status is required' });
        const updated = await rental_service_1.rentalService.updateRentalStatus(id, userId, status);
        return res.json(updated);
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to update rental status' });
    }
});
exports.default = router;
