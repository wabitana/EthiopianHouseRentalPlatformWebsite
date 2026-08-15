import { RentalStatus } from '@prisma/client';

export interface CreateRentalRequestDTO {
  propertyId: string;
  message?: string;
  moveInDate?: string;
  durationMonths?: number;
}

export interface RespondRentalRequestDTO {
  status: RentalStatus; // ACCEPTED or REJECTED
}
