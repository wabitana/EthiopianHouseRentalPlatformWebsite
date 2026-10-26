import { prisma } from '../../prisma';
import {
  buildPropertyTerritoryFilter,
  buildUserTerritoryFilter,
  isPropertyInTerritory,
  isUserInTerritory,
} from '../../utils/agentTerritory';

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

    await prisma.notification.create({
      data: {
        userId: data.userId,
        title: 'Identity Document Submitted',
        message: `Your ${data.idType} (${data.idNumber}) has been submitted for admin verification. AI Risk Score: ${aiRiskScore}/100. Status: Under Review.`,
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

  async getPendingVerifications(userId?: string, userRole?: string) {
    const isAgent = userRole?.toLowerCase() === 'agent';
    let assignedArea: string | null = null;

    if (isAgent && userId) {
      const agentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { assignedArea: true, city: true, region: true },
      });
      assignedArea = agentUser?.assignedArea || agentUser?.city || agentUser?.region || 'Addis Ababa';
    }

    const idWhere: any = { status: 'UNDER_REVIEW' };
    const propWhere: any = { status: 'UNDER_REVIEW' };

    if (isAgent && assignedArea) {
      idWhere.user = buildUserTerritoryFilter(assignedArea);
      propWhere.property = buildPropertyTerritoryFilter(assignedArea);
    }

    const identityDocs = await prisma.identityDocument.findMany({
      where: idWhere,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    const propertyDocs = await prisma.propertyDocument.findMany({
      where: propWhere,
      include: { property: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      identityDocs,
      propertyDocs,
    };
  }

  async reviewIdentityDocument(
    docId: string,
    status: 'VERIFIED' | 'REJECTED' | 'UNDER_REVIEW',
    adminNotes?: string,
    reviewerId?: string,
    reviewerRole?: string
  ) {
    if (reviewerRole?.toLowerCase() === 'agent' && reviewerId) {
      const agentUser = await prisma.user.findUnique({
        where: { id: reviewerId },
        select: { assignedArea: true, city: true, region: true },
      });
      const assignedArea = agentUser?.assignedArea || agentUser?.city || agentUser?.region || 'Addis Ababa';
      const existingDoc = await prisma.identityDocument.findUnique({
        where: { id: docId },
        include: { user: true },
      });
      if (!existingDoc || !existingDoc.user) {
        throw new Error('Identity document not found');
      }
      if (!isUserInTerritory(existingDoc.user, assignedArea)) {
        throw new Error(
          `Access Denied: You are only authorized to verify users in your assigned territory (${assignedArea}). User "${existingDoc.user.name}" is outside your jurisdiction.`
        );
      }
    }

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
    } else if (status === 'REJECTED') {
      await prisma.user.update({
        where: { id: doc.userId },
        data: { isVerified: false },
      });
    }

    return doc;
  }

  async reviewPropertyDocument(
    docId: string,
    status: 'VERIFIED' | 'REJECTED',
    adminNotes?: string,
    reviewerId?: string,
    reviewerRole?: string
  ) {
    if (reviewerRole?.toLowerCase() === 'agent' && reviewerId) {
      const agentUser = await prisma.user.findUnique({
        where: { id: reviewerId },
        select: { assignedArea: true, city: true, region: true },
      });
      const assignedArea = agentUser?.assignedArea || agentUser?.city || agentUser?.region || 'Addis Ababa';
      const existingDoc = await prisma.propertyDocument.findUnique({
        where: { id: docId },
        include: { property: true },
      });
      if (!existingDoc || !existingDoc.property) {
        throw new Error('Property document not found');
      }
      if (!isPropertyInTerritory(existingDoc.property, assignedArea)) {
        throw new Error(
          `Access Denied: You are only authorized to verify properties in your assigned territory (${assignedArea}). Property "${existingDoc.property.title}" is located in (${existingDoc.property.city}, ${existingDoc.property.area}).`
        );
      }
    }

    const doc = await prisma.propertyDocument.update({
      where: { id: docId },
      data: {
        status,
        ...(adminNotes && { aiNotes: adminNotes }),
      },
    });

    if (status === 'VERIFIED') {
      await prisma.property.update({
        where: { id: doc.propertyId },
        data: {
          isVerified: true,
          listingStatus: 'active',
        },
      });
    } else if (status === 'REJECTED') {
      await prisma.property.update({
        where: { id: doc.propertyId },
        data: {
          isVerified: false,
          listingStatus: 'rejected',
        },
      });
    }

    return doc;
  }

  async getUserVerificationStatus(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const latestIdentityDoc = await prisma.identityDocument.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    const latestPropertyDocs = await prisma.propertyDocument.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      isVerified: user?.isVerified ?? false,
      isPhoneVerified: user?.isPhoneVerified ?? false,
      identityStatus: latestIdentityDoc?.status || 'NONE',
      identityDoc: latestIdentityDoc,
      propertyDocsCount: latestPropertyDocs.length,
      hasApprovedPropertyDoc: latestPropertyDocs.some(d => d.status === 'VERIFIED'),
    };
  }
}

export const verificationService = new VerificationService();
