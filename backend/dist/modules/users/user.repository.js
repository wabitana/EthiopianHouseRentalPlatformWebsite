"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const database_1 = require("../../config/database");
class UserRepository {
    static async findById(id) {
        return database_1.prisma.user.findUnique({ where: { id } });
    }
    static async findByEmail(email) {
        return database_1.prisma.user.findUnique({ where: { email } });
    }
    static async update(id, data) {
        return database_1.prisma.user.update({
            where: { id },
            data,
        });
    }
    static async findAll(skip = 0, limit = 10) {
        const [users, total] = await Promise.all([
            database_1.prisma.user.findMany({
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            database_1.prisma.user.count(),
        ]);
        return { users, total };
    }
}
exports.UserRepository = UserRepository;
