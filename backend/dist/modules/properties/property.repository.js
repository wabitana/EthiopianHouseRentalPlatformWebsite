"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
class PropertyRepository {
    static async create(ownerId, data) {
        const { images, ...propertyData } = data;
        return database_1.prisma.property.create({
            data: {
                ...propertyData,
                ownerId,
                status: client_1.PropertyStatus.PENDING_REVIEW,
                images: images && images.length > 0
                    ? {
                        create: images.map((url, idx) => ({
                            url,
                            isPrimary: idx === 0,
                        })),
                    }
                    : undefined,
            },
            include: {
                images: true,
                owner: { select: { id: true, name: true, phone: true, isIdentityVerified: true } },
            },
        });
    }
    static async findById(id) {
        return database_1.prisma.property.findUnique({
            where: { id },
            include: {
                images: true,
                documents: true,
                owner: { select: { id: true, name: true, phone: true, email: true, isIdentityVerified: true } },
            },
        });
    }
    static async findMany(where = {}, skip = 0, limit = 10) {
        const [properties, total] = await Promise.all([
            database_1.prisma.property.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: { images: true, owner: { select: { name: true, phone: true } } },
            }),
            database_1.prisma.property.count({ where }),
        ]);
        return { properties, total };
    }
    static async update(id, data) {
        return database_1.prisma.property.update({
            where: { id },
            data,
            include: { images: true },
        });
    }
    static async countOwnerActiveProperties(ownerId) {
        return database_1.prisma.property.count({
            where: { ownerId, status: { in: [client_1.PropertyStatus.APPROVED, client_1.PropertyStatus.PUBLISHED, client_1.PropertyStatus.PENDING_REVIEW] } },
        });
    }
}
exports.PropertyRepository = PropertyRepository;
