export type RentalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'ACTIVE' | 'COMPLETED' | 'TERMINATED';

export interface RentalRequest {
  id: string;
  propertyId: string;
  renterId: string;
  ownerId: string;
  status: RentalStatus;
  message?: string;
  createdAt: string;
}
