"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const verification_service_1 = require("./verification.service");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// POST /api/v1/verification/identity (Upload National ID / Passport)
router.post('/identity', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { idType, idNumber, documentUrl, selfieUrl } = req.body;
        if (!idType || !idNumber) {
            return res.status(400).json({ error: 'ID Type and ID Number are required' });
        }
        const doc = await verification_service_1.verificationService.submitIdentityDocument({
            userId,
            idType,
            idNumber,
            documentUrl: documentUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600',
            selfieUrl,
        });
        return res.status(201).json({ success: true, document: doc });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to submit identity verification' });
    }
});
// POST /api/v1/verification/property-license (Upload House Deed / Site Plan)
router.post('/property-license', auth_1.authenticateToken, async (req, res) => {
    try {
        const ownerId = req.user?.id;
        if (!ownerId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { propertyId, docType, docUrl } = req.body;
        if (!propertyId || !docType) {
            return res.status(400).json({ error: 'Property ID and Document Type are required' });
        }
        const doc = await verification_service_1.verificationService.submitPropertyDocument({
            propertyId,
            ownerId,
            docType,
            docUrl: docUrl || 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=600',
        });
        return res.status(201).json({ success: true, document: doc });
    }
    catch (error) {
        return res.status(500).json({ error: error.message || 'Failed to submit property document' });
    }
});
// GET /api/v1/verification/admin/pending (Admin review queue)
router.get('/admin/pending', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const data = await verification_service_1.verificationService.getPendingVerifications();
        return res.json(data);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch verification queue' });
    }
});
exports.default = router;
