"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saleService = exports.SaleService = void 0;
const prisma_1 = require("../../prisma");
class SaleService {
    async createSaleRequest(data) {
        const property = await prisma_1.prisma.property.findUnique({ where: { id: data.propertyId } });
        if (!property)
            throw new Error('Property not found');
        if (property.transactionType !== 'SALE' && property.propertyType !== 'Sale') {
            // Allow sale requests for properties listed for sale
        }
        const saleReq = await prisma_1.prisma.saleRequest.create({
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
        await prisma_1.prisma.notification.create({
            data: {
                userId: property.providerId,
                title: 'New Property Purchase Offer Received',
                message: `A buyer submitted a purchase offer of ${data.offeredPriceETB.toLocaleString()} ETB for "${property.title}".`,
                type: 'INQUIRY',
            },
        });
        return saleReq;
    }
    async getUserSaleRequests(userId, role) {
        const where = role === 'provider' ? { ownerId: userId } : { buyerId: userId };
        return await prisma_1.prisma.saleRequest.findMany({
            where,
            include: { property: true, buyer: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateSaleStatus(requestId, userId, status) {
        const saleReq = await prisma_1.prisma.saleRequest.findUnique({
            where: { id: requestId },
            include: { property: true },
        });
        if (!saleReq)
            throw new Error('Sale request not found');
        if (saleReq.ownerId !== userId && saleReq.buyerId !== userId) {
            throw new Error('Not authorized to modify this sale request');
        }
        const updated = await prisma_1.prisma.saleRequest.update({
            where: { id: requestId },
            data: { status },
            include: { property: true },
        });
        if (status === 'COMPLETED') {
            await prisma_1.prisma.property.update({
                where: { id: saleReq.propertyId },
                data: { listingStatus: 'sold', availability: false },
            });
        }
        await prisma_1.prisma.notification.create({
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
exports.SaleService = SaleService;
exports.saleService = new SaleService();
