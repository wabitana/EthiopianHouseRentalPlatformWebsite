import { VerificationStatus } from '@prisma/client';

export interface SubmitIdentityDocDTO {
  documentType: string;
  documentNumber: string;
  documentUrl: string;
}

export interface SubmitLicenseDocDTO {
  licenseNumber: string;
  documentUrl: string;
}

export interface ReviewDocDTO {
  status: VerificationStatus;
  rejectionReason?: string;
}
