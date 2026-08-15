import { Router } from 'express';
import { prisma } from '../prisma';
import { authenticateToken, AuthRequest } from '../middleware/auth';

import { sendNewPropertyEmailAlert } from '../services/email.service';

const router = Router();

// Helper to format property output
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

// GET /api/v1/properties
router.get('/', async (req, res) => {
  try {
    const {
      city,
      area,
      propertyType,
      minPrice,
      maxPrice,
      minRooms,
      minBathrooms,
      searchQuery,
      sortBy,
    } = req.query;

    const where: any = {
      listingStatus: 'active', // Public discovery shows approved active listings
    };

    if (city && city !== 'All') {
      where.city = { equals: String(city) };
    }
    if (area && area !== 'All') {
      where.area = { equals: String(area) };
    }
    if (propertyType && propertyType !== 'All') {
      where.propertyType = { equals: String(propertyType) };
    }
    if (minPrice) {
      where.price = { ...where.price, gte: Number(minPrice) };
    }
    if (maxPrice) {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }
    if (minRooms) {
      where.rooms = { gte: Number(minRooms) };
    }
    if (minBathrooms) {
      where.bathrooms = { gte: Number(minBathrooms) };
    }

    let properties = await prisma.property.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // In-memory text filter for search query
    if (searchQuery && String(searchQuery).trim().length > 0) {
      const q = String(searchQuery).toLowerCase().trim();
      properties = properties.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.area.toLowerCase().includes(q) ||
          p.neighborhood.toLowerCase().includes(q)
      );
    }

    return res.json(properties.map(formatProperty));
  } catch (error) {
    console.error('Fetch properties error:', error);
    return res.status(500).json({ error: 'Failed to fetch properties' });
  }
});

// GET /api/v1/properties/provider/analytics
router.get('/provider/analytics', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch all properties owned by this provider
    const properties = await prisma.property.findMany({
      where: { providerId: userId },
      orderBy: { viewsCount: 'desc' },
    });

    const totalViews = properties.reduce((acc, p) => acc + (p.viewsCount || 0), 0);
    const totalInquiriesCount = properties.reduce((acc, p) => acc + (p.inquiriesCount || 0), 0);

    const dbInquiriesCount = await prisma.inquiry.count({
      where: { providerId: userId },
    });

    const totalInquiries = Math.max(totalInquiriesCount, dbInquiriesCount);
    const phoneClicks = Math.round(totalViews * 0.12) + (totalInquiries * 2);
    const mapClicks = Math.round(totalViews * 0.28) + (totalInquiries * 3);

    const topPerforming = properties.map((p) => ({
      id: p.id,
      title: p.title,
      price: `${p.price.toLocaleString()} ETB`,
      viewsCount: p.viewsCount || 0,
      inquiriesCount: p.inquiriesCount || 0,
    }));

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    const monthlyTrend = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mLabel = monthNames[d.getMonth()];
      const baseRatio = (6 - i) / 6;
      const monthScore = Math.max(10, Math.round((totalViews / 6) * (0.5 + baseRatio * 0.5)));
      monthlyTrend.push({ month: mLabel, count: monthScore });
    }

    const maxTrendCount = Math.max(...monthlyTrend.map((m) => m.count), 1);
    const formattedTrend = monthlyTrend.map((m) => ({
      month: m.month,
      factor: Math.min(1.0, Math.max(0.15, m.count / maxTrendCount)),
    }));

    return res.json({
      totalViews,
      totalInquiries,
      phoneClicks,
      mapClicks,
      monthlyTrend: formattedTrend,
      topProperties: topPerforming,
    });
  } catch (error) {
    console.error('Provider analytics fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch provider analytics' });
  }
});

// GET /api/v1/properties/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    // Increment views count asynchronously
    await prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    });

    return res.json(formatProperty(property));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch property' });
  }
});

// POST /api/v1/properties (House Provider only)
router.post('/', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId || userRole !== 'provider') {
      return res.status(403).json({ error: 'Only House Providers can post properties' });
    }

    const providerUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!providerUser) return res.status(404).json({ error: 'Provider profile not found' });

    const {
      title,
      description,
      propertyType,
      price,
      rentalPeriod,
      rooms,
      bathrooms,
      city,
      area,
      neighborhood,
      addressDetails,
      images,
      amenities,
    } = req.body;

    if (!title || !description || !propertyType || !price || !city || !area || !neighborhood) {
      return res.status(400).json({ error: 'Missing required property information' });
    }

    const newProperty = await prisma.property.create({
      data: {
        providerId: userId,
        providerName: providerUser.name,
        providerPhone: providerUser.phone,
        providerAvatar: providerUser.avatarUrl,
        providerIsVerified: providerUser.isVerified,
        title,
        description,
        propertyType,
        price: Number(price),
        rentalPeriod: rentalPeriod || 'Monthly',
        rooms: Number(rooms || 1),
        bathrooms: Number(bathrooms || 1),
        city,
        area,
        neighborhood,
        addressDetails,
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        availability: true,
        isVerified: true,
        listingStatus: 'active', // Immediately visible to seekers
      },
    });

    // Update total listings count
    await prisma.user.update({
      where: { id: userId },
      data: { totalListings: { increment: 1 } },
    });

    // Broadcast In-App Notifications to all registered users
    try {
      const allUsers = await prisma.user.findMany({
        select: { id: true, email: true },
      });

      if (allUsers.length > 0) {
        await prisma.notification.createMany({
          data: allUsers.map((u) => ({
            userId: u.id,
            title: `New Property Posted: ${title}`,
            message: `A new ${propertyType} with ${rooms} rooms in ${area}, ${city} is now available for ${price} ETB/${rentalPeriod || 'Monthly'}.`,
            type: 'PROPERTY',
          })),
        });
        console.log(`🔔 Created in-app notification for ${allUsers.length} users.`);
        
        // Dispatch Email Alert to all users
        const emails = allUsers.map((u) => u.email).filter(Boolean);
        sendNewPropertyEmailAlert(emails, {
          title,
          description,
          propertyType,
          price: Number(price),
          rentalPeriod: rentalPeriod || 'Monthly',
          rooms: Number(rooms || 1),
          bathrooms: Number(bathrooms || 1),
          city,
          area,
          neighborhood,
          images: typeof images === 'string' ? JSON.parse(images) : (images || []),
        }).catch((err) => console.error('Email alert dispatch error:', err));
      }
    } catch (notifErr) {
      console.error('Notification broadcast warning:', notifErr);
    }

    return res.status(201).json(formatProperty(newProperty));
  } catch (error) {
    console.error('Create property error:', error);
    return res.status(500).json({ error: 'Failed to create property' });
  }
});

// PATCH /api/v1/properties/:id
router.patch('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    if (property.providerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to edit this property' });
    }

    const {
      title,
      description,
      propertyType,
      price,
      rentalPeriod,
      rooms,
      bathrooms,
      city,
      area,
      neighborhood,
      addressDetails,
      images,
      amenities,
      availability,
    } = req.body;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(propertyType && { propertyType }),
        ...(price !== undefined && { price: Number(price) }),
        ...(rentalPeriod && { rentalPeriod }),
        ...(rooms !== undefined && { rooms: Number(rooms) }),
        ...(bathrooms !== undefined && { bathrooms: Number(bathrooms) }),
        ...(city && { city }),
        ...(area && { area }),
        ...(neighborhood && { neighborhood }),
        ...(addressDetails !== undefined && { addressDetails }),
        ...(images && { images: JSON.stringify(images) }),
        ...(amenities && { amenities: JSON.stringify(amenities) }),
        ...(availability !== undefined && { availability: Boolean(availability) }),
      },
    });

    return res.json(formatProperty(updated));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update property' });
  }
});

// DELETE /api/v1/properties/:id
router.delete('/:id', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    if (property.providerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this property' });
    }

    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete property' });
  }
});

// PATCH /api/v1/properties/:id/availability
router.patch('/:id/availability', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;
    const { availability } = req.body;
    const userId = req.user?.id;

    const property = await prisma.property.findUnique({ where: { id } });
    if (!property) return res.status(404).json({ error: 'Property not found' });

    if (property.providerId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const newAvailability = Boolean(availability);
    const updated = await prisma.property.update({
      where: { id },
      data: {
        availability: newAvailability,
        listingStatus: newAvailability ? 'active' : 'rented',
      },
    });

    return res.json(formatProperty(updated));
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update availability' });
  }
});

export default router;
