export type Role = 'ADMIN' | 'OWNER' | 'RENTER' | 'BUYER';

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  roles: Role[];
  avatarUrl?: string | null;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  isIdentityVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
