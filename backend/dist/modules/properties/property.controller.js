"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PropertyController = void 0;
const property_service_1 = require("./property.service");
const response_1 = require("../../utils/response");
class PropertyController {
    static async create(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const result = await property_service_1.PropertyService.createProperty(ownerId, req.body);
            (0, response_1.sendSuccess)(res, result, 'Property submitted for admin review successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getById(req, res, next) {
        try {
            const property = await property_service_1.PropertyService.getPropertyDetails(req.params.id);
            (0, response_1.sendSuccess)(res, property, 'Property details retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async getPublished(req, res, next) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await property_service_1.PropertyService.getPublishedProperties(page, limit);
            (0, response_1.sendSuccess)(res, result.properties, 'Published properties retrieved', 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
    static async update(req, res, next) {
        try {
            const userId = req.user.userId;
            const isAdmin = req.user.roles.includes('ADMIN');
            const updated = await property_service_1.PropertyService.updateProperty(userId, req.params.id, req.body, isAdmin);
            (0, response_1.sendSuccess)(res, updated, 'Property updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateStatus(req, res, next) {
        try {
            const updated = await property_service_1.PropertyService.updateStatus(req.params.id, req.body.status);
            (0, response_1.sendSuccess)(res, updated, 'Property status updated by admin');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.PropertyController = PropertyController;
