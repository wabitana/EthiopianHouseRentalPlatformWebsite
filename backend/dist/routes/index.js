"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const auth_routes_1 = __importDefault(require("../modules/auth/auth.routes"));
const user_routes_1 = __importDefault(require("../modules/users/user.routes"));
const verification_routes_1 = __importDefault(require("../modules/verification/verification.routes"));
const subscription_routes_1 = __importDefault(require("../modules/subscriptions/subscription.routes"));
const property_routes_1 = __importDefault(require("../modules/properties/property.routes"));
const rental_routes_1 = __importDefault(require("../modules/rentals/rental.routes"));
const sale_routes_1 = __importDefault(require("../modules/sales/sale.routes"));
const search_routes_1 = __importDefault(require("../modules/search/search.routes"));
const favorite_routes_1 = __importDefault(require("../modules/favorites/favorite.routes"));
const message_routes_1 = __importDefault(require("../modules/messaging/message.routes"));
const admin_routes_1 = __importDefault(require("../modules/admin/admin.routes"));
const cms_routes_1 = __importDefault(require("../modules/cms/cms.routes"));
const router = (0, express_1.Router)();
// Base API Index Route
router.get('/', (req, res) => {
    return (0, response_1.sendSuccess)(res, {
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
    return (0, response_1.sendSuccess)(res, {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        service: 'Ethiopian Property Platform API',
    }, 'API is up and running');
});
// Feature Modules Mounting
router.use('/auth', auth_routes_1.default);
router.use('/users', user_routes_1.default);
router.use('/verification', verification_routes_1.default);
router.use('/subscriptions', subscription_routes_1.default);
router.use('/properties', property_routes_1.default);
router.use('/rentals', rental_routes_1.default);
router.use('/sales', sale_routes_1.default);
router.use('/search', search_routes_1.default);
router.use('/favorites', favorite_routes_1.default);
router.use('/messaging', message_routes_1.default);
router.use('/admin', admin_routes_1.default);
router.use('/cms', cms_routes_1.default);
exports.default = router;
