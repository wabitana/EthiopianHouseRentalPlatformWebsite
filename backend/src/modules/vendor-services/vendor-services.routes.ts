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

// GET /api/v1/addresses
router.get('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  const userId = req.user?.id;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  const user = await prisma.user.findUnique({ where: { id: userId } });
  const defaultAddress = user?.address
    ? [{ id: 'addr-default', label: 'Primary Residence', address: user.address, city: user.city || 'Addis Ababa', isDefault: true }]
    : [];

  return res.json({ addresses: defaultAddress });
});

// POST /api/v1/addresses
router.post('/addresses', authenticateToken, async (req: AuthRequest, res) => {
  const { label, address, city } = req.body;
  return res.status(201).json({
    success: true,
    address: {
      id: `addr-${Date.now()}`,
      label: label || 'Home',
      address,
      city: city || 'Addis Ababa',
      isDefault: true,
    },
  });
});

export default router;
