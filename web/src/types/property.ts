export type PropertyStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'SUSPENDED' | 'SOLD' | 'RENTED' | 'ARCHIVED';
export type ListingType = 'RENT' | 'SALE';
export type PropertyType = 'APARTMENT' | 'HOUSE' | 'VILLA' | 'STUDIO' | 'ROOM' | 'COMMERCIAL' | 'LAND';

export interface Property {
  id: string;
  title: string;
  description: string;
  propertyType: PropertyType;
  listingType: ListingType;
  price: number;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  city: string;
  subCity?: string;
  address?: string;
  status: PropertyStatus;
  ownerId: string;
  createdAt: string;
}
