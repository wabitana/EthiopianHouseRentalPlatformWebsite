export type SaleStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'UNDER_REVIEW' | 'LEGAL_PROCESS' | 'COMPLETED' | 'CANCELLED';

export interface SaleRequest {
  id: string;
  propertyId: string;
  buyerId: string;
  ownerId: string;
  status: SaleStatus;
  offerPrice?: number | null;
  message?: string | null;
  createdAt: string;
}
