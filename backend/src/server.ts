import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

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
} from './modules';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

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

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ethiopian House Rental Modular Backend', version: 'v1' });
});

app.listen(PORT, () => {
  console.log(`🚀 Main Ethiopian House Rental REST API Server running on port ${PORT}`);
});

export default app;
