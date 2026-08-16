export type TransactionType = 'RENT' | 'SALE';
export type PropertyStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'SOLD' | 'RENTED' | 'ARCHIVED';

export interface PropertyImage {
  id: string;
  url: string;
  isPrimary: boolean;
}

export interface Property {
  id: string;
  ownerId: string;
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
  neighborhood?: string | null;
  addressDetails?: string | null;
  availability: boolean;
  status: PropertyStatus;
  viewsCount: number;
  createdAt: string;
  updatedAt: string;
  images?: PropertyImage[];
  owner?: {
    id?: string;
    name: string;
    phone: string;
    isIdentityVerified?: boolean;
  };
}
