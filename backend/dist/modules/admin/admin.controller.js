"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const admin_service_1 = require("./admin.service");
const response_1 = require("../../utils/response");
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
