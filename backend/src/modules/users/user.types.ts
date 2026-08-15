import { Role } from '@prisma/client';

export interface UpdateProfileDTO {
  name?: string;
  phone?: string;
  avatarUrl?: string;
}

export interface UpdateRolesDTO {
  roles: Role[];
}

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
  createdAt: Date;
  updatedAt: Date;
}
