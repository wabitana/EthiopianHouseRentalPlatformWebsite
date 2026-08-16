"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../utils/response");
const property_repository_1 = require("../properties/property.repository");
const prisma_1 = require("../../prisma");
class AdminController {
    static async getStats(req, res, next) {
        try {
            const stats = await admin_service_1.AdminService.getDashboardStats();
            (0, response_1.sendSuccess)(res, stats, 'Admin dashboard metrics retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getProperties(req, res, next) {
        try {
            const result = await property_repository_1.PropertyRepository.findMany({}, 0, 100);
            (0, response_1.sendSuccess)(res, { properties: result.properties, total: result.total }, 'All properties retrieved for audit');
        }
        catch (error) {
            next(error);
        }
    }
    static async getPayments(req, res, next) {
        try {
            const payments = await prisma_1.prisma.payment.findMany({
                include: { owner: true }
            });
            (0, response_1.sendSuccess)(res, { payments }, 'All payments retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAuditLogs(req, res, next) {
        try {
            const logs = await admin_service_1.AdminService.getAuditLogs();
            (0, response_1.sendSuccess)(res, logs, 'System audit logs retrieved');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AdminController = AdminController;
