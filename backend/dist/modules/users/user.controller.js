"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const user_service_1 = require("./user.service");
const response_1 = require("../../utils/response");
const property_repository_1 = require("../properties/property.repository");
class UserController {
    static async getMe(req, res, next) {
        try {
            const userId = req.user.userId;
            const user = await user_service_1.UserService.getProfile(userId);
            (0, response_1.sendSuccess)(res, user, 'Profile fetched successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getMyProperties(req, res, next) {
        try {
            const ownerId = req.user.userId;
            const result = await property_repository_1.PropertyRepository.findMany({ ownerId });
            (0, response_1.sendSuccess)(res, { properties: result.properties, total: result.total }, 'My properties retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateMe(req, res, next) {
        try {
            const userId = req.user.userId;
            const updated = await user_service_1.UserService.updateProfile(userId, req.body);
            (0, response_1.sendSuccess)(res, updated, 'Profile updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async updateRoles(req, res, next) {
        try {
            const targetUserId = req.params.id;
            const updated = await user_service_1.UserService.updateUserRoles(targetUserId, req.body);
            (0, response_1.sendSuccess)(res, updated, 'User roles updated successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async getAllUsers(req, res, next) {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const result = await user_service_1.UserService.getAllUsers(page, limit);
            (0, response_1.sendSuccess)(res, result.users, 'Users retrieved successfully', 200, result.meta);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.UserController = UserController;
