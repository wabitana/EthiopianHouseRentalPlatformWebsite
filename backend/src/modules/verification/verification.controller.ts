import { Request, Response, NextFunction } from 'express';
import { VerificationService } from './verification.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';
import { CloudinaryService } from '../../services/cloudinary.service';

export class VerificationController {
  static async uploadIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('Document file is required');
      }

      const userId = req.user!.userId;
      const { documentType, documentNumber } = req.body;
      const documentUrl = await CloudinaryService.uploadFile(req.file.path, 'identities');

      const result = await VerificationService.submitIdentityDocument(
        userId,
        documentType,
        documentNumber,
        documentUrl
      );

      sendSuccess(res, result, 'Identity document uploaded successfully for review', 201);
    } catch (error) {
      next(error);
    }
  }

  static async uploadLicense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        throw new BadRequestError('License document file is required');
      }

      const ownerId = req.user!.userId;
      const { licenseNumber } = req.body;
      const documentUrl = await CloudinaryService.uploadFile(req.file.path, 'identities');

      const result = await VerificationService.submitOwnerLicense(
        ownerId,
        licenseNumber,
        documentUrl
      );

      sendSuccess(res, result, 'House ownership license document uploaded for review', 201);
    } catch (error) {
      next(error);
    }
  }

  static async getPending(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const pending = await VerificationService.getPendingSubmissions();
      sendSuccess(res, pending, 'Pending verification submissions retrieved');
    } catch (error) {
      next(error);
    }
  }

  static async reviewIdentity(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const docId = req.params.id;
      const reviewed = await VerificationService.reviewIdentityDocument(docId, req.body);
      sendSuccess(res, reviewed, 'Identity document review updated');
    } catch (error) {
      next(error);
    }
  }

  static async reviewLicense(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const licenseId = req.params.id;
      const reviewed = await VerificationService.reviewLicenseDocument(licenseId, req.body);
      sendSuccess(res, reviewed, 'License document review updated');
    } catch (error) {
      next(error);
    }
  }
}
