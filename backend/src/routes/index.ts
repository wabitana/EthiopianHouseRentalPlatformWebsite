import { Router } from 'express';
import { sendSuccess } from '../utils/response';
import authRoutes from '../modules/auth/auth.routes';
import userRoutes from '../modules/users/user.routes';
import verificationRoutes from '../modules/verification/verification.routes';
import subscriptionRoutes from '../modules/subscriptions/subscription.routes';
import propertyRoutes from '../modules/properties/property.routes';
import rentalRoutes from '../modules/rentals/rental.routes';
import saleRoutes from '../modules/sales/sale.routes';
import searchRoutes from '../modules/search/search.routes';
import favoriteRoutes from '../modules/favorites/favorite.routes';
import messagingRoutes from '../modules/messaging/message.routes';
import adminRoutes from '../modules/admin/admin.routes';
import { uploadPublic } from '../middleware/upload.middleware';
import { CloudinaryService } from '../services/cloudinary.service';
import cmsRoutes from '../modules/cms/cms.routes';

const router = Router();

// Base API Index Route
router.get('/', (req, res) => {
  return sendSuccess(res, {
    name: 'Ethiopian Property Platform API',
    version: 'v1',
    health: '/api/v1/health',
    swagger: '/api-docs',
    swaggerJson: '/api-docs/json',
    documentation: 'Interactive OpenAPI Swagger documentation available at /api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      verification: '/api/v1/verification',
      subscriptions: '/api/v1/subscriptions',
      properties: '/api/v1/properties',
      rentals: '/api/v1/rentals',
      sales: '/api/v1/sales',
      search: '/api/v1/search',
      favorites: '/api/v1/favorites',
      messaging: '/api/v1/messaging',
      admin: '/api/v1/admin',
    },
  }, 'Welcome to Ethiopian Property Platform API');
});

// Health Check Route
router.get('/health', (req, res) => {
  return sendSuccess(res, {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: 'Ethiopian Property Platform API',
  }, 'API is up and running');
});

// Feature Modules Mounting
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/verification', verificationRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/properties', propertyRoutes);
router.use('/rentals', rentalRoutes);
router.use('/sales', saleRoutes);
router.use('/search', searchRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/messaging', messagingRoutes);
router.use('/admin', adminRoutes);

// Public Upload Route for Property Images (direct to Cloudinary)
router.post('/upload', uploadPublic.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'File is required' });
    }
    const secureUrl = await CloudinaryService.uploadFile(req.file.path, 'properties');
    return sendSuccess(res, { url: secureUrl }, 'File uploaded successfully to Cloudinary');
  } catch (error) {
    next(error);
  }
});
router.use('/cms', cmsRoutes);

export default router;
