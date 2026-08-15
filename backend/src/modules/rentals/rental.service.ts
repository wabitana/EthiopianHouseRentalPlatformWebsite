import { RentalRepository } from './rental.repository';
import { PropertyRepository } from '../properties/property.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateRentalRequestDTO, RespondRentalRequestDTO } from './rental.types';
import { TransactionType, RentalStatus } from '@prisma/client';

export class RentalService {
  static async submitRequest(renterId: string, dto: CreateRentalRequestDTO) {
    const property = await PropertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.transactionType !== TransactionType.RENT) {
      throw new BadRequestError('This property is listed for SALE, not for RENT');
    }

    if (property.ownerId === renterId) {
      throw new BadRequestError('Owners cannot send rental requests for their own properties');
    }

    const moveInDate = dto.moveInDate ? new Date(dto.moveInDate) : undefined;

    return RentalRepository.createRequest({
      propertyId: dto.propertyId,
      renterId,
      ownerId: property.ownerId,
      message: dto.message,
      moveInDate,
      durationMonths: dto.durationMonths || 12,
    });
  }

  static async getRenterRequests(renterId: string) {
    return RentalRepository.findRenterRequests(renterId);
  }

  static async getOwnerRequests(ownerId: string) {
    return RentalRepository.findOwnerRequests(ownerId);
  }

  static async respondToRequest(ownerId: string, requestId: string, dto: RespondRentalRequestDTO) {
    const request = await RentalRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Rental request not found');
    }

    if (request.ownerId !== ownerId) {
      throw new ForbiddenError('Only the property owner can accept or reject rental requests');
    }

    return RentalRepository.updateStatus(requestId, dto.status);
  }
}
