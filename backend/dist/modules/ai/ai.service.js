"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const database_1 = require("../../config/database");
class AiService {
    static async analyzeDocument(entityType, entityId) {
        const aiVerification = await database_1.prisma.aIVerification.findFirst({
            where: { entityType, entityId },
            orderBy: { createdAt: 'desc' },
        });
        if (!aiVerification) {
            // Generate initial AI risk assessment
            const riskScore = 15; // Low risk default simulation score
            return database_1.prisma.aIVerification.create({
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
exports.AiService = AiService;
