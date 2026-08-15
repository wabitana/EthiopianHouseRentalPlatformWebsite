"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationRepository = void 0;
const database_1 = require("../../config/database");
const client_1 = require("@prisma/client");
class VerificationRepository {
    static async createIdentityDoc(data) {
        return database_1.prisma.identityDocument.create({ data });
    }
    static async createLicense(data) {
        return database_1.prisma.license.create({ data });
    }
    static async findIdentityDocById(id) {
        return database_1.prisma.identityDocument.findUnique({ where: { id } });
    }
    static async findIdentityDocByUserId(userId) {
        return database_1.prisma.identityDocument.findFirst({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    static async findLicenseById(id) {
        return database_1.prisma.license.findUnique({ where: { id } });
    }
    static async updateIdentityStatus(id, status, rejectionReason) {
        return database_1.prisma.identityDocument.update({
            where: { id },
            data: {
                status,
                rejectionReason,
                verifiedAt: status === client_1.VerificationStatus.VERIFIED ? new Date() : null,
            },
        });
    }
    static async updateLicenseStatus(id, status, rejectionReason) {
        return database_1.prisma.license.update({
            where: { id },
            data: {
                status,
                rejectionReason,
                verifiedAt: status === client_1.VerificationStatus.VERIFIED ? new Date() : null,
            },
        });
    }
    static async getPendingIdentityDocs() {
        return database_1.prisma.identityDocument.findMany({
            where: { status: client_1.VerificationStatus.PENDING },
            include: { user: true },
            orderBy: { createdAt: 'asc' },
        });
    }
    static async getPendingLicenses() {
        return database_1.prisma.license.findMany({
            where: { status: client_1.VerificationStatus.PENDING },
            include: { owner: true },
            orderBy: { createdAt: 'asc' },
        });
    }
}
exports.VerificationRepository = VerificationRepository;
