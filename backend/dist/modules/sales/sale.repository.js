"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleRepository = void 0;
const database_1 = require("../../config/database");
class SaleRepository {
    static async createRequest(data) {
        return database_1.prisma.saleRequest.create({
            data,
            include: {
                property: { select: { id: true, title: true, price: true, city: true, areaName: true } },
                buyer: { select: { id: true, name: true, phone: true, email: true } },
                owner: { select: { id: true, name: true, phone: true, email: true } },
            },
        });
    }
    static async findById(id) {
        return database_1.prisma.saleRequest.findUnique({
            where: { id },
            include: {
                property: true,
                buyer: { select: { id: true, name: true, phone: true, email: true } },
                owner: { select: { id: true, name: true, phone: true, email: true } },
            },
        });
    }
    static async findBuyerRequests(buyerId) {
        return database_1.prisma.saleRequest.findMany({
            where: { buyerId },
            include: {
                property: { select: { id: true, title: true, price: true, city: true } },
                owner: { select: { name: true, phone: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async findOwnerRequests(ownerId) {
        return database_1.prisma.saleRequest.findMany({
            where: { ownerId },
            include: {
                property: { select: { id: true, title: true, price: true, city: true } },
                buyer: { select: { name: true, phone: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async updateStatus(id, status) {
        return database_1.prisma.saleRequest.update({
            where: { id },
            data: { status },
            include: { property: true, buyer: true, owner: true },
        });
    }
}
exports.SaleRepository = SaleRepository;
