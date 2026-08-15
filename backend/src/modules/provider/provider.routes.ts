import { Router } from 'express';
import { prisma } from '../../prisma';
import { authenticateToken, AuthRequest } from '../../middleware/auth';

const router = Router();

const formatProperty = (p: any) => ({
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

// GET /api/v1/provider/properties
router.get('/properties', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const properties = await prisma.property.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(properties.map(formatProperty));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch provider properties' });
  }
});

// GET /api/v1/provider/inquiries
router.get('/inquiries', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const inquiries = await prisma.inquiry.findMany({
      where: { providerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json(inquiries);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch provider inquiries' });
  }
});

export default router;
