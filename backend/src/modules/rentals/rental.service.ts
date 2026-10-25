import { prisma } from '../../prisma';

export class RentalService {
  async createRentalRequest(data: {
    propertyId: string;
    renterId: string;
    proposedStartDate?: string;
    notes?: string;
  }) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new Error('Property not found');

    const rentalReq = await prisma.rentalRequest.create({
      data: {
        propertyId: data.propertyId,
        renterId: data.renterId,
        ownerId: property.providerId,
        status: 'PENDING',
        proposedStartDate: data.proposedStartDate ? new Date(data.proposedStartDate) : null,
        notes: data.notes,
      },
      include: { property: true },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'New Rental Request Received',
        message: `A seeker requested to rent "${property.title}". Log in to review and accept the agreement.`,
        type: 'INQUIRY',
      },
    });

    return rentalReq;
  }

  async getUserRentalRequests(userId: string, role: string) {
    const where = role === 'provider' ? { ownerId: userId } : { renterId: userId };

    return await prisma.rentalRequest.findMany({
      where,
      include: { property: true, renter: true, visit: true, agreement: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async scheduleTourVisit(data: {
    propertyId: string;
    renterId: string;
    visitDate: string;
    timeSlot: string;
    tourType: string;
    notes?: string;
    seekerPhone?: string;
    seekerName?: string;
  }) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new Error('Property not found');

    const renter = await prisma.user.findUnique({ where: { id: data.renterId } });
    const renterName = data.seekerName || renter?.name || 'House Seeker';
    const renterPhone = data.seekerPhone || renter?.phone || '';

    const visitDateTime = new Date(data.visitDate);

    // 1. Create a RentalRequest with visit metadata
    const rentalReq = await prisma.rentalRequest.create({
      data: {
        propertyId: data.propertyId,
        renterId: data.renterId,
        ownerId: property.providerId,
        status: 'PENDING',
        proposedStartDate: visitDateTime,
        notes: JSON.stringify({
          action: 'TOUR_VISIT',
          tourType: data.tourType,
          timeSlot: data.timeSlot,
          visitDate: data.visitDate,
          renterName,
          renterPhone,
          notes: data.notes || '',
        }),
      },
    });

    // 2. Create the HouseVisit entity
    const houseVisit = await prisma.houseVisit.create({
      data: {
        propertyId: data.propertyId,
        requestId: rentalReq.id,
        renterId: data.renterId,
        ownerId: property.providerId,
        visitDate: visitDateTime,
        status: 'PENDING',
      },
      include: { property: true },
    });

    // 3. Create an Inquiry conversation thread for real-time chat & coordination
    const formattedDate = visitDateTime.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const visitMessageText = `📅 TOUR BOOKING REQUEST:
Format: ${data.tourType}
Date: ${formattedDate}
Time Slot: ${data.timeSlot}
Visitor: ${renterName} (${renterPhone})
${data.notes ? `Notes: ${data.notes}` : ''}`;

    const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    const propertyImage = images && images.length > 0 ? images[0] : '';

    const initialChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: data.renterId,
      senderName: renterName,
      senderRole: 'seeker',
      text: visitMessageText,
      createdAt: new Date().toISOString(),
    };

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: data.propertyId,
        propertyTitle: property.title,
        propertyImage,
        seekerId: data.renterId,
        seekerName: renterName,
        seekerPhone: renterPhone,
        providerId: property.providerId,
        message: visitMessageText,
        messages: JSON.stringify([initialChatMessage]),
        status: 'new_inquiry',
      },
    });

    // 4. Send Provider Notification
    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: '📅 New Tour Visit Booked',
        message: `${renterName} booked a ${data.tourType} for "${property.title}" on ${formattedDate} (${data.timeSlot}).`,
        type: 'TOUR',
      },
    });

    // 5. Send Seeker Confirmation Notification
    await prisma.notification.create({
      data: {
        userId: data.renterId,
        title: '✅ Tour Visit Confirmed',
        message: `Your tour request for "${property.title}" on ${formattedDate} (${data.timeSlot}) has been dispatched to the landlord.`,
        type: 'TOUR',
      },
    });

    return {
      houseVisit,
      rentalRequest: rentalReq,
      inquiry,
    };
  }

  async createLeaseAgreementProposal(data: {
    propertyId: string;
    renterId: string;
    durationMonths: number;
    advanceMonths: number;
    depositAmount: number;
    monthlyRent: number;
    startDate: string;
    tenantName: string;
    tenantPhone: string;
    language: string;
    notes?: string;
  }) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new Error('Property not found');

    const startDate = new Date(data.startDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + (data.durationMonths || 12));

    // 1. Create RentalRequest
    const rentalReq = await prisma.rentalRequest.create({
      data: {
        propertyId: data.propertyId,
        renterId: data.renterId,
        ownerId: property.providerId,
        status: 'PENDING',
        proposedStartDate: startDate,
        notes: JSON.stringify({
          action: 'DIGITAL_LEASE_PROPOSAL',
          durationMonths: data.durationMonths,
          advanceMonths: data.advanceMonths,
          depositAmount: data.depositAmount,
          monthlyRent: data.monthlyRent,
          tenantName: data.tenantName,
          tenantPhone: data.tenantPhone,
          language: data.language,
          notes: data.notes || '',
        }),
      },
    });

    // 2. Create RentalAgreement
    const agreement = await prisma.rentalAgreement.create({
      data: {
        requestId: rentalReq.id,
        renterId: data.renterId,
        ownerId: property.providerId,
        rentAmount: data.monthlyRent,
        startDate,
        endDate,
        renterConfirmed: true,
        ownerConfirmed: false,
        status: 'RENTER_CONFIRMED',
      },
    });

    // 3. Create Inquiry Thread with Contract Terms
    const images = typeof property.images === 'string' ? JSON.parse(property.images) : property.images;
    const propertyImage = images && images.length > 0 ? images[0] : '';
    const formattedStartDate = startDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const formattedEndDate = endDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });

    const contractSummary = `📜 FORMAL DIGITAL LEASE PROPOSAL:
Property: ${property.title}
Tenant: ${data.tenantName} (${data.tenantPhone})
Monthly Rent: ${data.monthlyRent.toLocaleString()} ETB
Duration: ${data.durationMonths} Months (${formattedStartDate} – ${formattedEndDate})
Advance Payment: Every ${data.advanceMonths} Months
Security Deposit: ${data.depositAmount.toLocaleString()} ETB
Language: ${data.language.toUpperCase()}
Status: Proposed by Tenant (Pending Landlord Approval)`;

    const initialChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      senderId: data.renterId,
      senderName: data.tenantName,
      senderRole: 'seeker',
      text: contractSummary,
      createdAt: new Date().toISOString(),
    };

    const inquiry = await prisma.inquiry.create({
      data: {
        propertyId: data.propertyId,
        propertyTitle: property.title,
        propertyImage,
        seekerId: data.renterId,
        seekerName: data.tenantName,
        seekerPhone: data.tenantPhone,
        providerId: property.providerId,
        message: contractSummary,
        messages: JSON.stringify([initialChatMessage]),
        status: 'contract_proposal',
      },
    });

    // 4. Notifications
    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: '📜 Digital Lease Agreement Proposed',
        message: `${data.tenantName} submitted a ${data.durationMonths}-month digital lease proposal for "${property.title}". Review and confirm.`,
        type: 'CONTRACT',
      },
    });

    await prisma.notification.create({
      data: {
        userId: data.renterId,
        title: '📜 Digital Contract Dispatched',
        message: `Your digital lease agreement proposal for "${property.title}" has been sent to the landlord.`,
        type: 'CONTRACT',
      },
    });

    return {
      agreement,
      rentalRequest: rentalReq,
      inquiry,
    };
  }

  async getUserVisits(userId: string) {
    return await prisma.houseVisit.findMany({
      where: {
        OR: [{ renterId: userId }, { ownerId: userId }],
      },
      include: {
        property: true,
        request: { include: { renter: true } },
      },
      orderBy: { visitDate: 'asc' },
    });
  }

  async updateRentalStatus(
    requestId: string,
    userId: string,
    status: 'ACCEPTED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED',
    userRole?: string
  ) {
    const rentalReq = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { property: true },
    });

    if (!rentalReq) throw new Error('Rental request not found');

    const isAdmin = userRole === 'admin';

    // Must be either the owner, the renter, or a platform administrator
    if (!isAdmin && rentalReq.ownerId !== userId && rentalReq.renterId !== userId) {
      throw new Error('Not authorized to modify this rental request');
    }

    // Prevent modifications on already terminal states
    if (rentalReq.status === 'COMPLETED' || rentalReq.status === 'TERMINATED') {
      throw new Error(`Cannot modify a rental request that is already ${rentalReq.status.toLowerCase()}`);
    }

    // Only property owner (or admin) can accept, activate, or complete rental requests
    if (!isAdmin && ['ACCEPTED', 'ACTIVE', 'COMPLETED'].includes(status) && rentalReq.ownerId !== userId) {
      throw new Error('Only the property owner can accept or activate a rental request');
    }

    const updated = await prisma.rentalRequest.update({
      where: { id: requestId },
      data: { status },
      include: { property: true },
    });

    if (status === 'ACTIVE' || status === 'ACCEPTED') {
      await prisma.property.update({
        where: { id: rentalReq.propertyId },
        data: { listingStatus: 'rented', availability: false },
      });
    }

    await prisma.notification.create({
      data: {
        userId: rentalReq.renterId,
        title: `Rental Request Status Updated: ${status}`,
        message: `Your rental request for "${rentalReq.property.title}" status is now ${status}. (Rent payment is handled offline).`,
        type: 'SYSTEM',
      },
    });

    return updated;
  }
}

export const rentalService = new RentalService();
