"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const formatProperty = (p) => ({
    id: p.id,
    providerId: p.providerId,
    providerName: p.providerName,
    providerPhone: p.providerPhone,
    providerAvatar: p.providerAvatar,
    providerIsVerified: p.providerIsVerified,
    title: p.title,
    description: p.description,
    propertyType: p.propertyType,
    price: p.price,
    rentalPeriod: p.rentalPeriod,
    rooms: p.rooms,
    bathrooms: p.bathrooms,
    city: p.city,
    area: p.area,
    neighborhood: p.neighborhood,
    addressDetails: p.addressDetails,
    images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
    amenities: typeof p.amenities === 'string' ? JSON.parse(p.amenities) : p.amenities,
    availability: p.availability,
    isVerified: p.isVerified,
    listingStatus: p.listingStatus,
    viewsCount: p.viewsCount,
    inquiriesCount: p.inquiriesCount,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
});
// GET /api/v1/admin/properties/pending
router.get('/properties/pending', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const pendingProperties = await prisma_1.prisma.property.findMany({
            where: { listingStatus: 'pending' },
            orderBy: { createdAt: 'desc' },
        });
        return res.json(pendingProperties.map(formatProperty));
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch pending properties' });
    }
});
// PATCH /api/v1/admin/properties/:id/approve
router.patch('/properties/:id/approve', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const property = await prisma_1.prisma.property.update({
            where: { id },
            data: { listingStatus: 'active', isVerified: true, availability: true },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: property.providerId,
                title: 'Listing Approved! 🎉',
                message: `Your property listing "${property.title}" has been approved and published to the marketplace.`,
                type: 'PROPERTY',
            },
        });
        return res.json(formatProperty(property));
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to approve property' });
    }
});
// PATCH /api/v1/admin/properties/:id/reject
router.patch('/properties/:id/reject', auth_1.authenticateToken, async (req, res) => {
    try {
        if (req.user?.role !== 'admin') {
            return res.status(403).json({ error: 'Admin access required' });
        }
        const { id } = req.params;
        const property = await prisma_1.prisma.property.update({
            where: { id },
            data: { listingStatus: 'rejected', availability: false },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId: property.providerId,
                title: 'Listing Action Required',
                message: `Your property listing "${property.title}" was not approved. Please review and update details.`,
                type: 'PROPERTY',
            },
        });
        return res.json(formatProperty(property));
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to reject property' });
    }
});
exports.default = router;
