"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyService = void 0;
const property_repository_1 = require("./property.repository");
const subscription_repository_1 = require("../subscriptions/subscription.repository");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
const pagination_1 = require("../../utils/pagination");
class PropertyService {
    static async createProperty(ownerId, dto) {
        // 1. Mandatory Business Rule Check: Active Subscription Requirement
        const activeSub = await subscription_repository_1.SubscriptionRepository.findActiveSubscription(ownerId);
        if (!activeSub) {
            throw new errors_1.ForbiddenError('An ACTIVE subscription is required before creating a property listing. Please subscribe to a plan first.');
        }
        // 2. Check Plan Max Listings Limit
        const currentListingsCount = await property_repository_1.PropertyRepository.countOwnerActiveProperties(ownerId);
        if (currentListingsCount >= activeSub.plan.maxListings) {
            throw new errors_1.ForbiddenError(`You have reached your subscription plan listing limit (${activeSub.plan.maxListings} listings max). Upgrade your plan to post more properties.`);
        }
        // 3. Create property in PENDING_REVIEW state
        return property_repository_1.PropertyRepository.create(ownerId, dto);
    }
    static async getPropertyDetails(id) {
        const property = await property_repository_1.PropertyRepository.findById(id);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        return property;
    }
    static async getPublishedProperties(page = 1, limit = 10) {
        const pagination = (0, pagination_1.parsePagination)({ page, limit });
        const { properties, total } = await property_repository_1.PropertyRepository.findMany({ status: client_1.PropertyStatus.PUBLISHED }, pagination.skip, pagination.limit);
        return {
            properties,
            meta: (0, pagination_1.formatPaginatedMeta)(total, pagination.page, pagination.limit),
        };
    }
    static async updateProperty(ownerId, propertyId, dto, isAdmin = false) {
        const property = await property_repository_1.PropertyRepository.findById(propertyId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        if (!isAdmin && property.ownerId !== ownerId) {
            throw new errors_1.ForbiddenError('You can only update properties that you own');
        }
        return property_repository_1.PropertyRepository.update(propertyId, dto);
    }
    static async updateStatus(propertyId, status) {
        const property = await property_repository_1.PropertyRepository.findById(propertyId);
        if (!property) {
            throw new errors_1.NotFoundError('Property not found');
        }
        return property_repository_1.PropertyRepository.update(propertyId, { status });
    }
}
exports.PropertyService = PropertyService;
