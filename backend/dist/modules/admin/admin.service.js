"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
class AdminService {
    static async getDashboardStats() {
        const [totalUsers, totalOwners, totalProperties, pendingProperties, pendingVerifications, activeSubscriptions,] = await Promise.all([
            database_1.prisma.user.count(),
            database_1.prisma.user.count({ where: { roles: { has: 'OWNER' } } }),
            database_1.prisma.property.count(),
            database_1.prisma.property.count({ where: { status: client_1.PropertyStatus.PENDING_REVIEW } }),
            database_1.prisma.identityDocument.count({ where: { status: client_1.VerificationStatus.PENDING } }),
            database_1.prisma.subscription.count({ where: { status: 'ACTIVE' } }),
        ]);
        return {
            totalUsers,
            totalOwners,
            totalProperties,
            pendingProperties,
            pendingVerifications,
            activeSubscriptions,
        };
    }
    static async logAdminAction(adminId, action, entityName, entityId, details) {
        return database_1.prisma.auditLog.create({
            data: {
                adminId,
                action,
                entityName,
                entityId,
                details: details ? JSON.stringify(details) : null,
            },
        });
    }
    static async getAuditLogs() {
        return database_1.prisma.auditLog.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: { admin: { select: { id: true, name: true, email: true } } },
        });
    }
}
exports.AdminService = AdminService;
