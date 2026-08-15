"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SearchService = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../utils/pagination");
class SearchService {
    static async searchProperties(dto) {
        const pagination = (0, pagination_1.parsePagination)({ page: dto.page, limit: dto.limit });
        const where = {
            status: client_1.PropertyStatus.PUBLISHED,
        };
        if (dto.transactionType) {
            where.transactionType = dto.transactionType;
        }
        if (dto.propertyType) {
            where.propertyType = { equals: dto.propertyType, mode: 'insensitive' };
        }
        if (dto.city) {
            where.city = { contains: dto.city, mode: 'insensitive' };
        }
        if (dto.areaName) {
            where.areaName = { contains: dto.areaName, mode: 'insensitive' };
        }
        if (dto.minPrice !== undefined || dto.maxPrice !== undefined) {
            where.price = {
                ...(dto.minPrice !== undefined && { gte: dto.minPrice }),
                ...(dto.maxPrice !== undefined && { lte: dto.maxPrice }),
            };
        }
        if (dto.bedrooms !== undefined) {
            where.bedrooms = { gte: dto.bedrooms };
        }
        if (dto.bathrooms !== undefined) {
            where.bathrooms = { gte: dto.bathrooms };
        }
        if (dto.query) {
            where.OR = [
                { title: { contains: dto.query, mode: 'insensitive' } },
                { description: { contains: dto.query, mode: 'insensitive' } },
                { city: { contains: dto.query, mode: 'insensitive' } },
                { areaName: { contains: dto.query, mode: 'insensitive' } },
            ];
        }
        let orderBy = { createdAt: 'desc' };
        if (dto.sortBy === 'price_asc') {
            orderBy = { price: 'asc' };
        }
        else if (dto.sortBy === 'price_desc') {
            orderBy = { price: 'desc' };
        }
        const [properties, total] = await Promise.all([
            database_1.prisma.property.findMany({
                where,
                skip: pagination.skip,
                take: pagination.limit,
                orderBy,
                include: {
                    images: true,
                    owner: { select: { id: true, name: true, phone: true } },
                },
            }),
            database_1.prisma.property.count({ where }),
        ]);
        return {
            properties,
            meta: (0, pagination_1.formatPaginatedMeta)(total, pagination.page, pagination.limit),
        };
    }
}
exports.SearchService = SearchService;
