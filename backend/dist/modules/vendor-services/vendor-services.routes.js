"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../prisma");
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
// GET /api/v1/services/packages (Public Service Packages: Deep Cleaning, Inspection, Logistics)
router.get('/packages', async (_req, res) => {
    try {
        const packages = await prisma_1.prisma.servicePackage.findMany({
            where: { active: true },
            orderBy: [{ type: 'asc' }, { sortOrder: 'asc' }],
        });
        const formatted = packages.map((p) => {
            let parsedFeatures = [];
            try {
                parsedFeatures = typeof p.features === 'string' ? JSON.parse(p.features) : p.features;
            }
            catch (_) {
                parsedFeatures = [p.features];
            }
            return { ...p, features: parsedFeatures };
        });
        return res.json({ packages: formatted });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch service packages' });
    }
});
// GET /api/v1/services/slots (Available appointment slots)
router.get('/slots', async (req, res) => {
    try {
        const { date, type } = req.query;
        const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
        const slots = times.map((t) => ({ time: t, available: true }));
        return res.json({ date: date || new Date().toISOString().split('T')[0], type: type || 'INSPECTION', slots });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch appointment slots' });
    }
});
// POST /api/v1/services/book (Book Tenant Service / Inspection)
router.post('/book', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { type, scheduledAt, address, city, estimatedPrice, notes, packageId } = req.body;
        if (!type || !address || !estimatedPrice) {
            return res.status(400).json({ error: 'Missing required booking details' });
        }
        const bookingNumber = `SRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
        const booking = await prisma_1.prisma.serviceBooking.create({
            data: {
                bookingNumber,
                userId,
                type,
                status: 'PENDING',
                scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
                address,
                city: city || 'Addis Ababa',
                estimatedPrice: Number(estimatedPrice),
                notes,
                packageId,
            },
        });
        await prisma_1.prisma.notification.create({
            data: {
                userId,
                title: 'Service Booking Created!',
                message: `Your booking #${bookingNumber} (${type}) has been placed. We will contact you for confirmation.`,
                type: 'SYSTEM',
            },
        });
        return res.status(201).json({ success: true, booking });
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to create service booking' });
    }
});
// GET /api/v1/services/bookings (Get User Bookings)
router.get('/bookings', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const bookings = await prisma_1.prisma.serviceBooking.findMany({
            where: { userId },
            include: { package: true },
            orderBy: { createdAt: 'desc' },
        });
        return res.json({ bookings });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch service bookings' });
    }
});
// GET /api/v1/addresses (User Saved Addresses)
router.get('/addresses', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const addresses = await prisma_1.prisma.savedAddress.findMany({
            where: { userId },
            orderBy: { isDefault: 'desc' },
        });
        return res.json({ addresses });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to fetch saved addresses' });
    }
});
// POST /api/v1/addresses (Add Saved Address)
router.post('/addresses', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ error: 'Unauthorized' });
        const { label, address, city, lat, lng, isDefault } = req.body;
        if (!label || !address) {
            return res.status(400).json({ error: 'Label and address are required' });
        }
        if (isDefault) {
            await prisma_1.prisma.savedAddress.updateMany({
                where: { userId },
                data: { isDefault: false },
            });
        }
        const saved = await prisma_1.prisma.savedAddress.create({
            data: {
                userId,
                label,
                address,
                city: city || 'Addis Ababa',
                lat: lat ? Number(lat) : null,
                lng: lng ? Number(lng) : null,
                isDefault: isDefault ?? false,
            },
        });
        return res.status(201).json({ success: true, address: saved });
    }
    catch (error) {
        return res.status(400).json({ error: error.message || 'Failed to save address' });
    }
});
exports.default = router;
