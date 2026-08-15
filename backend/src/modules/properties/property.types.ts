import { TransactionType, PropertyStatus } from '@prisma/client';

export interface CreatePropertyDTO {
  title: string;
  description: string;
  propertyType: string;
  transactionType: TransactionType;
  price: number;
  area: number;
  bedrooms: number;
  bathrooms: number;
  city: string;
  areaName: string;
  neighborhood?: string;
  addressDetails?: string;
  images?: string[];
}

export interface UpdatePropertyDTO {
  title?: string;
  description?: string;
  price?: number;
  availability?: boolean;
  status?: PropertyStatus;
}
