"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const database_1 = require("../../config/database");
class AnalyticsService {
    static async recordEvent(userId, eventType, propertyId, metadata) {
        return database_1.prisma.analyticsEvent.create({
            data: {
                userId: userId || null,
                eventType,
                propertyId: propertyId || null,
                metadata: metadata ? JSON.stringify(metadata) : null,
            },
        });
    }
    static async getPlatformAnalytics() {
        const [avgRent, avgSale, propertiesByCity, totalRevenue] = await Promise.all([
            database_1.prisma.property.aggregate({
                _avg: { price: true },
                where: { transactionType: 'RENT', status: 'PUBLISHED' },
            }),
            database_1.prisma.property.aggregate({
                _avg: { price: true },
                where: { transactionType: 'SALE', status: 'PUBLISHED' },
            }),
            database_1.prisma.property.groupBy({
                by: ['city'],
                _count: { id: true },
                where: { status: 'PUBLISHED' },
            }),
            database_1.prisma.payment.aggregate({
                _sum: { amount: true },
                where: { status: 'SUCCESS' },
            }),
        ]);
        return {
            averageRentETB: Math.round(avgRent._avg.price || 0),
            averageSaleETB: Math.round(avgSale._avg.price || 0),
            popularLocations: propertiesByCity.map((c) => ({ city: c.city, count: c._count.id })),
            totalSubscriptionRevenueETB: totalRevenue._sum.amount || 0,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
