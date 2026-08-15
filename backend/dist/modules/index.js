"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleRoutes = exports.rentalRoutes = exports.verificationRoutes = exports.subscriptionRoutes = exports.aiRoutes = exports.uploadRoutes = exports.adminRoutes = exports.reportRoutes = exports.notificationsRoutes = exports.inquiriesRoutes = exports.favoritesRoutes = exports.providerRoutes = exports.propertyRoutes = exports.authRoutes = void 0;
var auth_routes_1 = require("./auth/auth.routes");
Object.defineProperty(exports, "authRoutes", { enumerable: true, get: function () { return __importDefault(auth_routes_1).default; } });
var property_routes_1 = require("./properties/property.routes");
Object.defineProperty(exports, "propertyRoutes", { enumerable: true, get: function () { return __importDefault(property_routes_1).default; } });
var provider_routes_1 = require("./provider/provider.routes");
Object.defineProperty(exports, "providerRoutes", { enumerable: true, get: function () { return __importDefault(provider_routes_1).default; } });
var favorites_routes_1 = require("./favorites/favorites.routes");
Object.defineProperty(exports, "favoritesRoutes", { enumerable: true, get: function () { return __importDefault(favorites_routes_1).default; } });
var inquiries_routes_1 = require("./inquiries/inquiries.routes");
Object.defineProperty(exports, "inquiriesRoutes", { enumerable: true, get: function () { return __importDefault(inquiries_routes_1).default; } });
var notifications_routes_1 = require("./notifications/notifications.routes");
Object.defineProperty(exports, "notificationsRoutes", { enumerable: true, get: function () { return __importDefault(notifications_routes_1).default; } });
var report_routes_1 = require("./reports/report.routes");
Object.defineProperty(exports, "reportRoutes", { enumerable: true, get: function () { return __importDefault(report_routes_1).default; } });
var admin_routes_1 = require("./admin/admin.routes");
Object.defineProperty(exports, "adminRoutes", { enumerable: true, get: function () { return __importDefault(admin_routes_1).default; } });
var upload_routes_1 = require("./upload/upload.routes");
Object.defineProperty(exports, "uploadRoutes", { enumerable: true, get: function () { return __importDefault(upload_routes_1).default; } });
var ai_routes_1 = require("./ai/ai.routes");
Object.defineProperty(exports, "aiRoutes", { enumerable: true, get: function () { return __importDefault(ai_routes_1).default; } });
var subscription_routes_1 = require("./subscriptions/subscription.routes");
Object.defineProperty(exports, "subscriptionRoutes", { enumerable: true, get: function () { return __importDefault(subscription_routes_1).default; } });
var verification_routes_1 = require("./verification/verification.routes");
Object.defineProperty(exports, "verificationRoutes", { enumerable: true, get: function () { return __importDefault(verification_routes_1).default; } });
var rental_routes_1 = require("./rentals/rental.routes");
Object.defineProperty(exports, "rentalRoutes", { enumerable: true, get: function () { return __importDefault(rental_routes_1).default; } });
var sale_routes_1 = require("./sales/sale.routes");
Object.defineProperty(exports, "saleRoutes", { enumerable: true, get: function () { return __importDefault(sale_routes_1).default; } });
__exportStar(require("./email/email.service"), exports);
