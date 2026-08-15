import { prisma } from '../../config/database';

export class AnalyticsService {
  static async recordEvent(userId: string | undefined, eventType: string, propertyId?: string, metadata?: any) {
    return prisma.analyticsEvent.create({
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
      prisma.property.aggregate({
        _avg: { price: true },
        where: { transactionType: 'RENT', status: 'PUBLISHED' },
      }),
      prisma.property.aggregate({
        _avg: { price: true },
        where: { transactionType: 'SALE', status: 'PUBLISHED' },
      }),
      prisma.property.groupBy({
        by: ['city'],
        _count: { id: true },
        where: { status: 'PUBLISHED' },
      }),
      prisma.payment.aggregate({
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
