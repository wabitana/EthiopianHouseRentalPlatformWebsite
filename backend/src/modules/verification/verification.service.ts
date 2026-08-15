import { VerificationRepository } from './verification.repository';
import { prisma } from '../../config/database';
import { NotFoundError } from '../../utils/errors';
import { VerificationStatus } from '@prisma/client';
import { ReviewDocDTO } from './verification.types';

export class VerificationService {
  static async submitIdentityDocument(userId: string, documentType: string, documentNumber: string, documentUrl: string) {
    const doc = await VerificationRepository.createIdentityDoc({
      userId,
      documentType,
      documentNumber,
      documentUrl,
    });

    // Create AI Pre-check hook entry
    await this.triggerAiPrecheck('IdentityDocument', doc.id);

    return doc;
  }

  static async submitOwnerLicense(ownerId: string, licenseNumber: string, documentUrl: string) {
    const license = await VerificationRepository.createLicense({
      ownerId,
      licenseNumber,
      documentUrl,
    });

    // Create AI Pre-check hook entry
    await this.triggerAiPrecheck('License', license.id);

    return license;
  }

  static async reviewIdentityDocument(docId: string, dto: ReviewDocDTO) {
    const doc = await VerificationRepository.findIdentityDocById(docId);
    if (!doc) {
      throw new NotFoundError('Identity document not found');
    }

    const updatedDoc = await VerificationRepository.updateIdentityStatus(docId, dto.status, dto.rejectionReason);

    // If verified, set user.isIdentityVerified to true
    if (dto.status === VerificationStatus.VERIFIED) {
      await prisma.user.update({
        where: { id: doc.userId },
        data: { isIdentityVerified: true },
      });
    }

    return updatedDoc;
  }

  static async reviewLicenseDocument(licenseId: string, dto: ReviewDocDTO) {
    const license = await VerificationRepository.findLicenseById(licenseId);
    if (!license) {
      throw new NotFoundError('License document not found');
    }

    return VerificationRepository.updateLicenseStatus(licenseId, dto.status, dto.rejectionReason);
  }

  static async getPendingSubmissions() {
    const [identities, licenses] = await Promise.all([
      VerificationRepository.getPendingIdentityDocs(),
      VerificationRepository.getPendingLicenses(),
    ]);

    return { identities, licenses };
  }

  private static async triggerAiPrecheck(entityType: string, entityId: string) {
    // Simulated AI Document Pre-check (calculates initial risk score based on document heuristic)
    const riskScore = Math.floor(Math.random() * 20); // Low risk score (0-20) for standard submission
    await prisma.aIVerification.create({
      data: {
        entityType,
        entityId,
        riskScore,
        ocrData: JSON.stringify({ extractedStatus: 'VALID_FORMAT', timestamp: new Date().toISOString() }),
        warnings: JSON.stringify([]),
        recommendation: riskScore > 50 ? 'MANUAL_REVIEW_REQUIRED' : 'AUTO_VERIFICATION_RECOMMENDED',
      },
    });
  }
}
