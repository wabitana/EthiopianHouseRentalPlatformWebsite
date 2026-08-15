import { prisma } from '../../config/database';

export class AiService {
  static async analyzeDocument(entityType: string, entityId: string) {
    const aiVerification = await prisma.aIVerification.findFirst({
      where: { entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });

    if (!aiVerification) {
      // Generate initial AI risk assessment
      const riskScore = 15; // Low risk default simulation score
      return prisma.aIVerification.create({
        data: {
          entityType,
          entityId,
          riskScore,
          ocrData: JSON.stringify({ extractedStatus: 'VALID_IMAGE_QUALITY', detectedLanguage: 'AMHARIC_ENGLISH' }),
          warnings: JSON.stringify([]),
          recommendation: 'MANUAL_ADMIN_REVIEW_RECOMMENDED',
        },
      });
    }

    return aiVerification;
  }
}
