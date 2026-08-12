import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

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

// GET /api/v1/favorites
router.get('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    const properties = favorites.map((f) => formatProperty(f.property));
    return res.json(properties);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch favorites' });
  }
});

// POST /api/v1/favorites/:propertyId
router.post('/:propertyId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const existing = await prisma.favorite.findUnique({
      where: { userId_propertyId: { userId, propertyId } },
    });

    if (!existing) {
      await prisma.favorite.create({
        data: { userId, propertyId },
      });
    }

    return res.status(201).json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to add favorite' });
  }
});

// DELETE /api/v1/favorites/:propertyId
router.delete('/:propertyId', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const { propertyId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    await prisma.favorite.deleteMany({
      where: { userId, propertyId },
    });

    return res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to remove favorite' });
  }
});

export default router;
