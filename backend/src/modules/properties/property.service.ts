import { PropertyRepository } from './property.repository';
import { SubscriptionRepository } from '../subscriptions/subscription.repository';
import { ForbiddenError, NotFoundError } from '../../utils/errors';
import { CreatePropertyDTO, UpdatePropertyDTO } from './property.types';
import { PropertyStatus } from '@prisma/client';
import { parsePagination, formatPaginatedMeta } from '../../utils/pagination';

export class PropertyService {
  static async createProperty(ownerId: string, dto: CreatePropertyDTO) {
    // 1. Mandatory Business Rule Check: Active Subscription Requirement
    const activeSub = await SubscriptionRepository.findActiveSubscription(ownerId);
    if (!activeSub) {
      throw new ForbiddenError('An ACTIVE subscription is required before creating a property listing. Please subscribe to a plan first.');
    }

    // 2. Check Plan Max Listings Limit
    const currentListingsCount = await PropertyRepository.countOwnerActiveProperties(ownerId);
    if (currentListingsCount >= activeSub.plan.maxListings) {
      throw new ForbiddenError(`You have reached your subscription plan listing limit (${activeSub.plan.maxListings} listings max). Upgrade your plan to post more properties.`);
    }

    // 3. Create property in PENDING_REVIEW state
    return PropertyRepository.create(ownerId, dto);
  }

  static async getPropertyDetails(id: string) {
    const property = await PropertyRepository.findById(id);
    if (!property) {
      throw new NotFoundError('Property not found');
    }
    return property;
  }

  static async getPublishedProperties(page = 1, limit = 10) {
    const pagination = parsePagination({ page, limit });
    const { properties, total } = await PropertyRepository.findMany(
      { status: PropertyStatus.PUBLISHED },
      pagination.skip,
      pagination.limit
    );

    return {
      properties,
      meta: formatPaginatedMeta(total, pagination.page, pagination.limit),
    };
  }

  static async updateProperty(ownerId: string, propertyId: string, dto: UpdatePropertyDTO, isAdmin = false) {
    const property = await PropertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    if (!isAdmin && property.ownerId !== ownerId) {
      throw new ForbiddenError('You can only update properties that you own');
    }

    return PropertyRepository.update(propertyId, dto);
  }

  static async updateStatus(propertyId: string, status: PropertyStatus) {
    const property = await PropertyRepository.findById(propertyId);
    if (!property) {
      throw new NotFoundError('Property not found');
    }

    return PropertyRepository.update(propertyId, { status });
  }
}
