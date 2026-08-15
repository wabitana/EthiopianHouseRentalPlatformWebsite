import { prisma } from '../../config/database';
import { PropertyStatus, VerificationStatus } from '@prisma/client';

export class AdminService {
  static async getDashboardStats() {
    const [
      totalUsers,
      totalOwners,
      totalProperties,
      pendingProperties,
      pendingVerifications,
      activeSubscriptions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { roles: { has: 'OWNER' } } }),
      prisma.property.count(),
      prisma.property.count({ where: { status: PropertyStatus.PENDING_REVIEW } }),
      prisma.identityDocument.count({ where: { status: VerificationStatus.PENDING } }),
      prisma.subscription.count({ where: { status: 'ACTIVE' } }),
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

  static async logAdminAction(adminId: string, action: string, entityName: string, entityId: string, details?: any) {
    return prisma.auditLog.create({
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
    return prisma.auditLog.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { admin: { select: { id: true, name: true, email: true } } },
    });
  }
}
