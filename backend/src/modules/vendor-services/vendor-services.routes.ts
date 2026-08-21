import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

const DEFAULT_PACKAGES = [
  { id: 'pkg-1', name: 'Deep Cleaning & Sanitization', type: 'CLEANING', priceETB: 1500, features: ['Living Room & Bedrooms', 'Kitchen Disinfection', 'Bathroom Scrubbing'] },
  { id: 'pkg-2', name: 'On-Site Property Inspection', type: 'INSPECTION', priceETB: 800, features: ['Structural Verification', 'Deed & Document Validation', 'High-Res Photo Audit'] },
  { id: 'pkg-3', name: 'Relocation & Logistics', type: 'LOGISTICS', priceETB: 3500, features: ['Furniture Packing', 'Truck Transportation', 'Unloading & Assembly'] },
];

// GET /api/v1/services/packages
router.get('/packages', async (_req, res) => {
  return res.json({ packages: DEFAULT_PACKAGES });
});

// GET /api/v1/services/slots
router.get('/slots', async (req, res) => {
  const { date, type } = req.query;
  const times = ['09:00 AM', '11:00 AM', '02:00 PM', '04:00 PM'];
  const slots = times.map((t) => ({ time: t, available: true }));
  return res.json({ date: date || new Date().toISOString().split('T')[0], type: type || 'INSPECTION', slots });
});

// POST /api/v1/services/book
router.post('/book', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const { type, address, estimatedPrice } = req.body;
  if (!type || !address || !estimatedPrice) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  const bookingNumber = `SRV-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

  await prisma.notification.create({
    data: {
      userId,
      title: 'Service Booking Created!',
      message: `Your booking #${bookingNumber} (${type}) has been placed. We will contact you for confirmation.`,
      type: 'SYSTEM',
    },
  });

  return res.status(201).json({
    success: true,
    booking: {
      id: `booking-${Date.now()}`,
      bookingNumber,
      userId,
      type,
      status: 'PENDING',
      address,
      estimatedPrice,
      createdAt: new Date(),
    },
  });
});

// GET /api/v1/services/bookings
router.get('/bookings', authenticateToken, async (_req, res) => {
  return res.json({ bookings: [] });
});

// GET /api/v1/addresses
router.get('/addresses', authenticateToken, async (_req, res) => {
  return res.json({ addresses: [] });
});

// POST /api/v1/addresses
router.post('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  const { label, address, city } = req.body;
  return res.status(201).json({
    success: true,
    address: {
      id: `addr-${Date.now()}`,
      label,
      address,
      city: city || 'Addis Ababa',
      isDefault: true,
    },
  });
});

export default router;
