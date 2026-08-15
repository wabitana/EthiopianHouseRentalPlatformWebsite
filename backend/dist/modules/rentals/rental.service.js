"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rentalService = exports.RentalService = void 0;
const prisma_1 = require("../../prisma");
class RentalService {
    async createRentalRequest(data) {
        const property = await prisma_1.prisma.property.findUnique({ where: { id: data.propertyId } });
        if (!property)
            throw new Error('Property not found');
        const rentalReq = await prisma_1.prisma.rentalRequest.create({
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
        await prisma_1.prisma.notification.create({
            data: {
                userId: property.providerId,
                title: 'New Rental Request Received',
                message: `A seeker requested to rent "${property.title}". Log in to review and accept the agreement.`,
                type: 'INQUIRY',
            },
        });
        return rentalReq;
    }
    async getUserRentalRequests(userId, role) {
        const where = role === 'provider' ? { ownerId: userId } : { renterId: userId };
        return await prisma_1.prisma.rentalRequest.findMany({
            where,
            include: { property: true, renter: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateRentalStatus(requestId, userId, status) {
        const rentalReq = await prisma_1.prisma.rentalRequest.findUnique({
            where: { id: requestId },
            include: { property: true },
        });
        if (!rentalReq)
            throw new Error('Rental request not found');
        if (rentalReq.ownerId !== userId && rentalReq.renterId !== userId) {
            throw new Error('Not authorized to modify this rental request');
        }
        const updated = await prisma_1.prisma.rentalRequest.update({
            where: { id: requestId },
            data: { status },
            include: { property: true },
        });
        if (status === 'ACTIVE' || status === 'ACCEPTED') {
            await prisma_1.prisma.property.update({
                where: { id: rentalReq.propertyId },
                data: { listingStatus: 'rented', availability: false },
            });
        }
        await prisma_1.prisma.notification.create({
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
exports.RentalService = RentalService;
exports.rentalService = new RentalService();
