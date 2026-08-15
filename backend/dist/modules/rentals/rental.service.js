"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RentalService = void 0;
const rental_repository_1 = require("./rental.repository");
const property_repository_1 = require("../properties/property.repository");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
class RentalService {
    static async submitRequest(renterId, dto) {
        const property = await property_repository_1.PropertyRepository.findById(dto.propertyId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        if (property.transactionType !== client_1.TransactionType.RENT) {
            throw new errors_1.BadRequestError('This property is listed for SALE, not for RENT');
        }
        if (property.ownerId === renterId) {
            throw new errors_1.BadRequestError('Owners cannot send rental requests for their own properties');
        }
        const moveInDate = dto.moveInDate ? new Date(dto.moveInDate) : undefined;
        return rental_repository_1.RentalRepository.createRequest({
            propertyId: dto.propertyId,
            renterId,
            ownerId: property.ownerId,
            message: dto.message,
            moveInDate,
            durationMonths: dto.durationMonths || 12,
        });
    }
    static async getRenterRequests(renterId) {
        return rental_repository_1.RentalRepository.findRenterRequests(renterId);
    }
    static async getOwnerRequests(ownerId) {
        return rental_repository_1.RentalRepository.findOwnerRequests(ownerId);
    }
    static async respondToRequest(ownerId, requestId, dto) {
        const request = await rental_repository_1.RentalRepository.findById(requestId);
        if (!request) {
            throw new errors_1.NotFoundError('Rental request not found');
        }
        if (request.ownerId !== ownerId) {
            throw new errors_1.ForbiddenError('Only the property owner can accept or reject rental requests');
        }
        return rental_repository_1.RentalRepository.updateStatus(requestId, dto.status);
    }
}
exports.RentalService = RentalService;
