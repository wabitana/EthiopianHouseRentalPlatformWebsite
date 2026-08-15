"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const modules_1 = require("./modules");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
// Static uploads directory
const uploadsPath = path_1.default.join(__dirname, '../uploads');
app.use('/uploads', express_1.default.static(uploadsPath));
// REST API v1 Modular Routes
app.use('/api/v1/auth', modules_1.authRoutes);
app.use('/api/v1/users', modules_1.authRoutes);
app.use('/api/v1/properties', modules_1.propertyRoutes);
app.use('/api/v1/provider', modules_1.providerRoutes);
app.use('/api/v1/favorites', modules_1.favoritesRoutes);
app.use('/api/v1/inquiries', modules_1.inquiriesRoutes);
app.use('/api/v1/notifications', modules_1.notificationsRoutes);
app.use('/api/v1/reports', modules_1.reportRoutes);
app.use('/api/v1/admin', modules_1.adminRoutes);
app.use('/api/v1/upload', modules_1.uploadRoutes);
app.use('/api/v1/ai', modules_1.aiRoutes);
app.use('/api/v1/subscriptions', modules_1.subscriptionRoutes);
app.use('/api/v1/verification', modules_1.verificationRoutes);
app.use('/api/v1/rentals', modules_1.rentalRoutes);
app.use('/api/v1/sales', modules_1.saleRoutes);
// Health check endpoint
app.get('/api/v1/health', (_req, res) => {
    res.json({ status: 'ok', service: 'Ethiopian Property Platform REST API', version: 'v1' });
});
// Centralized error handling middleware
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    return res.status(err.status || 500).json({
        success: false,
        error: {
            code: err.code || 'INTERNAL_SERVER_ERROR',
            message: err.message || 'An unexpected internal server error occurred',
        },
    });
});
exports.default = app;
