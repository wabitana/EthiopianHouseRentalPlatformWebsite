import { TransactionType } from '@prisma/client';

export interface SearchQueryDTO {
  query?: string;
  city?: string;
  areaName?: string;
  propertyType?: string;
  transactionType?: TransactionType;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  bathrooms?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest';
  page?: number;
  limit?: number;
}
