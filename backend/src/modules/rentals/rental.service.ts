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
      include: { property: true, renter: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateRentalStatus(requestId: string, userId: string, status: 'ACCEPTED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED') {
    const rentalReq = await prisma.rentalRequest.findUnique({
      where: { id: requestId },
      include: { property: true },
    });

    if (!rentalReq) throw new Error('Rental request not found');

    if (rentalReq.ownerId !== userId && rentalReq.renterId !== userId) {
      throw new Error('Not authorized to modify this rental request');
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
