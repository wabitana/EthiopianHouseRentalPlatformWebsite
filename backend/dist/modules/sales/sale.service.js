"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaleService = void 0;
const sale_repository_1 = require("./sale.repository");
const property_repository_1 = require("../properties/property.repository");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
class SaleService {
    static async submitRequest(buyerId, dto) {
        const property = await property_repository_1.PropertyRepository.findById(dto.propertyId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        if (property.transactionType !== client_1.TransactionType.SALE) {
            throw new errors_1.BadRequestError('This property is listed for RENT, not for SALE');
        }
        if (property.ownerId === buyerId) {
            throw new errors_1.BadRequestError('Owners cannot submit purchase offers on their own properties');
        }
        return sale_repository_1.SaleRepository.createRequest({
            propertyId: dto.propertyId,
            buyerId,
            ownerId: property.ownerId,
            offerPrice: dto.offerPrice || property.price,
            message: dto.message,
        });
    }
    static async getBuyerRequests(buyerId) {
        return sale_repository_1.SaleRepository.findBuyerRequests(buyerId);
    }
    static async getOwnerRequests(ownerId) {
        return sale_repository_1.SaleRepository.findOwnerRequests(ownerId);
    }
    static async respondToRequest(ownerId, requestId, dto) {
        const request = await sale_repository_1.SaleRepository.findById(requestId);
        if (!request) {
            throw new errors_1.NotFoundError('Purchase request not found');
        }
        if (request.ownerId !== ownerId) {
            throw new errors_1.ForbiddenError('Only the property owner can accept or reject purchase offers');
        }
        return sale_repository_1.SaleRepository.updateStatus(requestId, dto.status);
    }
}
exports.SaleService = SaleService;
