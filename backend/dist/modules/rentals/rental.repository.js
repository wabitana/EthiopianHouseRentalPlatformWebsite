"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalRepository = void 0;
const database_1 = require("../../config/database");
class RentalRepository {
    static async createRequest(data) {
        return database_1.prisma.rentalRequest.create({
            data,
            include: {
                property: { select: { id: true, title: true, price: true, city: true, areaName: true } },
                renter: { select: { id: true, name: true, phone: true, email: true } },
                owner: { select: { id: true, name: true, phone: true, email: true } },
            },
        });
    }
    static async findById(id) {
        return database_1.prisma.rentalRequest.findUnique({
            where: { id },
            include: {
                property: true,
                renter: { select: { id: true, name: true, phone: true, email: true } },
                owner: { select: { id: true, name: true, phone: true, email: true } },
            },
        });
    }
    static async findRenterRequests(renterId) {
        return database_1.prisma.rentalRequest.findMany({
            where: { renterId },
            include: {
                property: { select: { id: true, title: true, price: true, city: true } },
                owner: { select: { name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async findOwnerRequests(ownerId) {
        return database_1.prisma.rentalRequest.findMany({
            where: { ownerId },
            include: {
                property: { select: { id: true, title: true, price: true, city: true } },
                renter: { select: { name: true, phone: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async updateStatus(id, status) {
        return database_1.prisma.rentalRequest.update({
            where: { id },
            data: { status },
            include: { property: true, renter: true, owner: true },
        });
    }
}
exports.RentalRepository = RentalRepository;
