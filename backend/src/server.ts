import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes';
import propertyRoutes from './routes/property.routes';
import providerRoutes from './routes/provider.routes';
import favoritesRoutes from './routes/favorites.routes';
import inquiriesRoutes from './routes/inquiries.routes';
import notificationsRoutes from './routes/notifications.routes';
import reportRoutes from './routes/report.routes';
import adminRoutes from './routes/admin.routes';
import uploadRoutes from './routes/upload.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// REST API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', authRoutes); // /me endpoint aliased
app.use('/api/v1/properties', propertyRoutes);
app.use('/api/v1/provider', providerRoutes);
app.use('/api/v1/favorites', favoritesRoutes);
app.use('/api/v1/inquiries', inquiriesRoutes);
app.use('/api/v1/notifications', notificationsRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/upload', uploadRoutes);

// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
  res.json({ status: 'ok', service: 'Ethiopian House Rental Backend', version: 'v1' });
});

app.listen(PORT, () => {
  console.log(`🚀 Main Ethiopian House Rental REST API Server running on port ${PORT}`);
});

export default app;
