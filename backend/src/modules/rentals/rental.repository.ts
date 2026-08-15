import { prisma } from '../../config/database';
import { RentalRequest, RentalStatus } from '@prisma/client';

export class RentalRepository {
  static async createRequest(data: {
    propertyId: string;
    renterId: string;
    ownerId: string;
    message?: string;
    moveInDate?: Date;
    durationMonths?: number;
  }): Promise<RentalRequest> {
    return prisma.rentalRequest.create({
      data,
      include: {
        property: { select: { id: true, title: true, price: true, city: true, areaName: true } },
        renter: { select: { id: true, name: true, phone: true, email: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  static async findById(id: string): Promise<RentalRequest | null> {
    return prisma.rentalRequest.findUnique({
      where: { id },
      include: {
        property: true,
        renter: { select: { id: true, name: true, phone: true, email: true } },
        owner: { select: { id: true, name: true, phone: true, email: true } },
      },
    });
  }

  static async findRenterRequests(renterId: string): Promise<RentalRequest[]> {
    return prisma.rentalRequest.findMany({
      where: { renterId },
      include: {
        property: { select: { id: true, title: true, price: true, city: true } },
        owner: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findOwnerRequests(ownerId: string): Promise<RentalRequest[]> {
    return prisma.rentalRequest.findMany({
      where: { ownerId },
      include: {
        property: { select: { id: true, title: true, price: true, city: true } },
        renter: { select: { name: true, phone: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async updateStatus(id: string, status: RentalStatus): Promise<RentalRequest> {
    return prisma.rentalRequest.update({
      where: { id },
      data: { status },
      include: { property: true, renter: true, owner: true },
    });
  }
}
