export type SaleStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW' | 'LEGAL_PROCESS' | 'COMPLETED' | 'CANCELLED';

export interface SaleRequest {
  id: string;
  propertyId: string;
  buyerId: string;
  ownerId: string;
  status: SaleStatus;
  message?: string;
  createdAt: string;
}
