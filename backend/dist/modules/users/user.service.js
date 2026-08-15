"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const user_repository_1 = require("./user.repository");
const errors_1 = require("../../utils/errors");
const pagination_1 = require("../../utils/pagination");
class UserService {
    static async getProfile(userId) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        return this.mapToResponse(user);
    }
    static async updateProfile(userId, dto) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updated = await user_repository_1.UserRepository.update(userId, dto);
        return this.mapToResponse(updated);
    }
    static async updateUserRoles(userId, dto) {
        const user = await user_repository_1.UserRepository.findById(userId);
        if (!user) {
            throw new errors_1.NotFoundError('User not found');
        }
        const updated = await user_repository_1.UserRepository.update(userId, { roles: dto.roles });
        return this.mapToResponse(updated);
    }
    static async getAllUsers(page = 1, limit = 10) {
        const pagination = (0, pagination_1.parsePagination)({ page, limit });
        const { users, total } = await user_repository_1.UserRepository.findAll(pagination.skip, pagination.limit);
        return {
            users: users.map(this.mapToResponse),
            meta: (0, pagination_1.formatPaginatedMeta)(total, pagination.page, pagination.limit),
        };
    }
    static mapToResponse(user) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            roles: user.roles,
            avatarUrl: user.avatarUrl,
            isPhoneVerified: user.isPhoneVerified,
            isEmailVerified: user.isEmailVerified,
            isIdentityVerified: user.isIdentityVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
        };
    }
}
exports.UserService = UserService;
