import express from 'express';
import cors from 'cors';
import path from 'path';

import {
  authRoutes,
  propertyRoutes,
  providerRoutes,
  favoritesRoutes,
  inquiriesRoutes,
  notificationsRoutes,
  reportRoutes,
  adminRoutes,
  uploadRoutes,
  aiRoutes,
  subscriptionRoutes,
  verificationRoutes,
  rentalRoutes,
  saleRoutes,
} from './modules';

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// REST API v1 Modular Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes);
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/inquiries', inquiriesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/verification', verificationRoutes);
app.use('/api/v1/rentals', rentalRoutes);
app.use('/api/v1/sales', saleRoutes);

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ethiopian Property Platform REST API', version: 'v1' });
});

// Centralized error handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled Server Error:', err);
  return res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected internal server error occurred',
    },
  });
});

export default app;
