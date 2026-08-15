"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerificationController = void 0;
const verification_service_1 = require("./verification.service");
const response_1 = require("../../utils/response");
const errors_1 = require("../../utils/errors");
class VerificationController {
    static async uploadIdentity(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.BadRequestError('Document file is required');
            }
            const userId = req.user.userId;
            const { documentType, documentNumber } = req.body;
            const documentUrl = `/uploads/private_documents/${req.file.filename}`;
            const result = await verification_service_1.VerificationService.submitIdentityDocument(userId, documentType, documentNumber, documentUrl);
            (0, response_1.sendSuccess)(res, result, 'Identity document uploaded successfully for review', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadLicense(req, res, next) {
        try {
            if (!req.file) {
                throw new errors_1.BadRequestError('License document file is required');
            }
            const ownerId = req.user.userId;
            const { licenseNumber } = req.body;
            const documentUrl = `/uploads/private_documents/${req.file.filename}`;
            const result = await verification_service_1.VerificationService.submitOwnerLicense(ownerId, licenseNumber, documentUrl);
            (0, response_1.sendSuccess)(res, result, 'House ownership license document uploaded for review', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async getPending(req, res, next) {
        try {
            const pending = await verification_service_1.VerificationService.getPendingSubmissions();
            (0, response_1.sendSuccess)(res, pending, 'Pending verification submissions retrieved');
        }
        catch (error) {
            next(error);
        }
    }
    static async reviewIdentity(req, res, next) {
        try {
            const docId = req.params.id;
            const reviewed = await verification_service_1.VerificationService.reviewIdentityDocument(docId, req.body);
            (0, response_1.sendSuccess)(res, reviewed, 'Identity document review updated');
        }
        catch (error) {
            next(error);
        }
    }
    static async reviewLicense(req, res, next) {
        try {
            const licenseId = req.params.id;
            const reviewed = await verification_service_1.VerificationService.reviewLicenseDocument(licenseId, req.body);
            (0, response_1.sendSuccess)(res, reviewed, 'License document review updated');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.VerificationController = VerificationController;
