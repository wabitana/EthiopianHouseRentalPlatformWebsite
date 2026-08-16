import { prisma } from '../../prisma';

export class SaleService {
  async createSaleRequest(data: {
    propertyId: string;
    buyerId: string;
    offeredPriceETB: number;
    notes?: string;
  }) {
    const property = await prisma.property.findUnique({ where: { id: data.propertyId } });
    if (!property) throw new Error('Property not found');

    if (property.transactionType !== 'SALE' && property.propertyType !== 'Sale') {
      // Allow sale requests for properties listed for sale
    }

    const saleReq = await prisma.saleRequest.create({
      data: {
        propertyId: data.propertyId,
        buyerId: data.buyerId,
        ownerId: property.providerId,
        offeredPriceETB: Number(data.offeredPriceETB),
        status: 'PENDING',
        notes: data.notes,
      },
      include: { property: true },
    });

    await prisma.notification.create({
      data: {
        userId: property.providerId,
        title: 'New Property Purchase Offer Received',
        message: `A buyer submitted a purchase offer of ${data.offeredPriceETB.toLocaleString()} ETB for "${property.title}".`,
        type: 'INQUIRY',
      },
    });

    return saleReq;
  }

  async getUserSaleRequests(userId: string, role: string) {
    const where = role === 'provider' ? { ownerId: userId } : { buyerId: userId };

    return await prisma.saleRequest.findMany({
      where,
      include: { property: true, buyer: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateSaleStatus(requestId: string, userId: string, status: 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW' | 'LEGAL_PROCESS' | 'COMPLETED') {
    const saleReq = await prisma.saleRequest.findUnique({
      where: { id: requestId },
      include: { property: true },
    });

    if (!saleReq) throw new Error('Sale request not found');

    if (saleReq.ownerId !== userId && saleReq.buyerId !== userId) {
      throw new Error('Not authorized to modify this sale request');
    }

    const updated = await prisma.saleRequest.update({
      where: { id: requestId },
      data: { status },
      include: { property: true },
    });

    if (status === 'COMPLETED') {
      await prisma.property.update({
        where: { id: saleReq.propertyId },
        data: { listingStatus: 'sold', availability: false },
      });
    }

    await prisma.notification.create({
      data: {
        userId: saleReq.buyerId,
        title: `Property Sale Progress Updated: ${status}`,
        message: `Your purchase offer status for "${saleReq.property.title}" is now ${status}. (Government tax & legal title transfer handled offline).`,
        type: 'SYSTEM',
      },
    });

    return updated;
  }
}

export const saleService = new SaleService();
