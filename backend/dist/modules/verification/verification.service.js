"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationService = void 0;
const verification_repository_1 = require("./verification.repository");
const database_1 = require("../../config/database");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
class VerificationService {
    static async submitIdentityDocument(userId, documentType, documentNumber, documentUrl) {
        const doc = await verification_repository_1.VerificationRepository.createIdentityDoc({
            userId,
            documentType,
            documentNumber,
            documentUrl,
        });
        // Create AI Pre-check hook entry
        await this.triggerAiPrecheck('IdentityDocument', doc.id);
        return doc;
    }
    static async submitOwnerLicense(ownerId, licenseNumber, documentUrl) {
        const license = await verification_repository_1.VerificationRepository.createLicense({
            ownerId,
            licenseNumber,
            documentUrl,
        });
        // Create AI Pre-check hook entry
        await this.triggerAiPrecheck('License', license.id);
        return license;
    }
    static async reviewIdentityDocument(docId, dto) {
        const doc = await verification_repository_1.VerificationRepository.findIdentityDocById(docId);
        if (!doc) {
            throw new errors_1.NotFoundError('Identity document not found');
        }
        const updatedDoc = await verification_repository_1.VerificationRepository.updateIdentityStatus(docId, dto.status, dto.rejectionReason);
        // If verified, set user.isIdentityVerified to true
        if (dto.status === client_1.VerificationStatus.VERIFIED) {
            await database_1.prisma.user.update({
                where: { id: doc.userId },
                data: { isIdentityVerified: true },
            });
        }
        return updatedDoc;
    }
    static async reviewLicenseDocument(licenseId, dto) {
        const license = await verification_repository_1.VerificationRepository.findLicenseById(licenseId);
        if (!license) {
            throw new errors_1.NotFoundError('License document not found');
        }
        return verification_repository_1.VerificationRepository.updateLicenseStatus(licenseId, dto.status, dto.rejectionReason);
    }
    static async getPendingSubmissions() {
        const [identities, licenses] = await Promise.all([
            verification_repository_1.VerificationRepository.getPendingIdentityDocs(),
            verification_repository_1.VerificationRepository.getPendingLicenses(),
        ]);
        return { identities, licenses };
    }
    static async triggerAiPrecheck(entityType, entityId) {
        // Simulated AI Document Pre-check (calculates initial risk score based on document heuristic)
        const riskScore = Math.floor(Math.random() * 20); // Low risk score (0-20) for standard submission
        await database_1.prisma.aIVerification.create({
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
exports.VerificationService = VerificationService;
