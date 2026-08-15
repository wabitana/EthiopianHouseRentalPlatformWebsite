import { prisma } from '../../config/database';
import { IdentityDocument, License, VerificationStatus } from '@prisma/client';

export class VerificationRepository {
  static async createIdentityDoc(data: {
    userId: string;
    documentType: string;
    documentNumber: string;
    documentUrl: string;
  }): Promise<IdentityDocument> {
    return prisma.identityDocument.create({ data });
  }

  static async createLicense(data: {
    ownerId: string;
    licenseNumber: string;
    documentUrl: string;
  }): Promise<License> {
    return prisma.license.create({ data });
  }

  static async findIdentityDocById(id: string): Promise<IdentityDocument | null> {
    return prisma.identityDocument.findUnique({ where: { id } });
  }

  static async findIdentityDocByUserId(userId: string): Promise<IdentityDocument | null> {
    return prisma.identityDocument.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findLicenseById(id: string): Promise<License | null> {
    return prisma.license.findUnique({ where: { id } });
  }

  static async updateIdentityStatus(
    id: string,
    status: VerificationStatus,
    rejectionReason?: string
  ): Promise<IdentityDocument> {
    return prisma.identityDocument.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
      },
    });
  }

  static async updateLicenseStatus(
    id: string,
    status: VerificationStatus,
    rejectionReason?: string
  ): Promise<License> {
    return prisma.license.update({
      where: { id },
      data: {
        status,
        rejectionReason,
        verifiedAt: status === VerificationStatus.VERIFIED ? new Date() : null,
      },
    });
  }

  static async getPendingIdentityDocs(): Promise<IdentityDocument[]> {
    return prisma.identityDocument.findMany({
      where: { status: VerificationStatus.PENDING },
      include: { user: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getPendingLicenses(): Promise<License[]> {
    return prisma.license.findMany({
      where: { status: VerificationStatus.PENDING },
      include: { owner: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
