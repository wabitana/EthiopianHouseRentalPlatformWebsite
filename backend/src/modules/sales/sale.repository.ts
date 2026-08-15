import { prisma } from '../../config/database';
import { SaleRequest, SaleStatus } from '@prisma/client';

export class SaleRepository {
  static async createRequest(data: {
    propertyId: string;
    buyerId: string;
    ownerId: string;
    offerPrice?: number;
    message?: string;
  }): Promise<SaleRequest> {
    return prisma.saleRequest.create({
      data,
      include: {
        property: { select: { id: true, title: true, price: true, city: true, areaName: true } },
        buyer: { select: { id: true, name: true, phone: true, email: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  static async findById(id: string): Promise<SaleRequest | null> {
    return prisma.saleRequest.findUnique({
      where: { id },
      include: {
        property: true,
        buyer: { select: { id: true, name: true, phone: true, email: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  static async findBuyerRequests(buyerId: string): Promise<SaleRequest[]> {
    return prisma.saleRequest.findMany({
      where: { buyerId },
      include: {
        property: { select: { id: true, title: true, price: true, city: true } },
        owner: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findOwnerRequests(ownerId: string): Promise<SaleRequest[]> {
    return prisma.saleRequest.findMany({
      where: { ownerId },
      include: {
        property: { select: { id: true, title: true, price: true, city: true } },
        buyer: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(id: string, status: SaleStatus): Promise<SaleRequest> {
    return prisma.saleRequest.update({
      where: { id },
      data: { status },
      include: { property: true, buyer: true, owner: true },
    });
  }
}
