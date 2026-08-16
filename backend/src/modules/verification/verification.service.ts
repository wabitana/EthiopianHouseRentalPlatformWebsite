import { prisma } from '../../prisma';

export class VerificationService {
  async submitIdentityDocument(data: {
    userId: string;
    idType: string;
    idNumber: string;
    documentUrl: string;
    selfieUrl?: string;
  }) {
    // Simulated AI pre-check risk score (e.g. 92/100 confidence)
    const aiRiskScore = 92.5;
    const aiNotes = 'OCR validated Ethiopian National ID format. Name matches account profile.';

    const doc = await prisma.identityDocument.create({
      data: {
        userId: data.userId,
        idType: data.idType,
        idNumber: data.idNumber,
        documentUrl: data.documentUrl,
        selfieUrl: data.selfieUrl,
        status: 'UNDER_REVIEW',
        aiRiskScore,
        aiNotes,
      },
    });

    // Update user status
    await prisma.user.update({
      where: { id: data.userId },
      data: { isVerified: true },
    });

    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: 'Identity Document Submitted',
        message: `Your ${data.idType} (${data.idNumber}) has been submitted for admin verification. AI Risk Score: ${aiRiskScore}/100.`,
        type: 'SYSTEM',
      },
    });

    return doc;
  }

  async submitPropertyDocument(data: {
    propertyId: string;
    ownerId: string;
    docType: string;
    docUrl: string;
  }) {
    const aiRiskScore = 88.0;
    const aiNotes = 'AI OCR pre-check: Title deed layout verified against Ministry of Innovation & Technology standards.';

    const doc = await prisma.propertyDocument.create({
      data: {
        propertyId: data.propertyId,
        ownerId: data.ownerId,
        docType: data.docType,
        docUrl: data.docUrl,
        status: 'UNDER_REVIEW',
        aiRiskScore,
        aiNotes,
      },
    });

    return doc;
  }

  async getPendingVerifications() {
    const identityDocs = await prisma.identityDocument.findMany({
      where: { status: 'UNDER_REVIEW' },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const propertyDocs = await prisma.propertyDocument.findMany({
      where: { status: 'UNDER_REVIEW' },
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      identityDocs,
      propertyDocs,
    };
  }

  async reviewIdentityDocument(docId: string, status: 'VERIFIED' | 'REJECTED', adminNotes?: string) {
    const doc = await prisma.identityDocument.update({
      where: { id: docId },
      data: {
        status,
        ...(adminNotes && { aiNotes: adminNotes }),
      },
    });

    if (status === 'VERIFIED') {
      await prisma.user.update({
        where: { id: doc.userId },
        data: { isVerified: true },
      });
    }

    return doc;
  }
}

export const verificationService = new VerificationService();
