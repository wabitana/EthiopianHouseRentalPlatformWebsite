import { SaleStatus } from '@prisma/client';

export interface CreateSaleRequestDTO {
  propertyId: string;
  offerPrice?: number;
  message?: string;
}

export interface RespondSaleRequestDTO {
  status: SaleStatus;
}
