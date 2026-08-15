import { SaleRepository } from './sale.repository';
import { PropertyRepository } from '../properties/property.repository';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../utils/errors';
import { CreateSaleRequestDTO, RespondSaleRequestDTO } from './sale.types';
import { TransactionType, SaleStatus } from '@prisma/client';

export class SaleService {
  static async submitRequest(buyerId: string, dto: CreateSaleRequestDTO) {
    const property = await PropertyRepository.findById(dto.propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (property.transactionType !== TransactionType.SALE) {
      throw new BadRequestError('This property is listed for RENT, not for SALE');
    }

    if (property.ownerId === buyerId) {
      throw new BadRequestError('Owners cannot submit purchase offers on their own properties');
    }

    return SaleRepository.createRequest({
      propertyId: dto.propertyId,
      buyerId,
      ownerId: property.ownerId,
      offerPrice: dto.offerPrice || property.price,
      message: dto.message,
    });
  }

  static async getBuyerRequests(buyerId: string) {
    return SaleRepository.findBuyerRequests(buyerId);
  }

  static async getOwnerRequests(ownerId: string) {
    return SaleRepository.findOwnerRequests(ownerId);
  }

  static async respondToRequest(ownerId: string, requestId: string, dto: RespondSaleRequestDTO) {
    const request = await SaleRepository.findById(requestId);
    if (!request) {
      throw new NotFoundError('Purchase request not found');
    }

    if (request.ownerId !== ownerId) {
      throw new ForbiddenError('Only the property owner can accept or reject purchase offers');
    }

    return SaleRepository.updateStatus(requestId, dto.status);
  }
}
