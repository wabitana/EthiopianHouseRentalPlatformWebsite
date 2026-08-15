import { Role } from '@prisma/client';

export interface RegisterDTO {
  name: string;
  email: string;
  phone: string;
  password: string;
  roles?: Role[];
}

export interface LoginDTO {
  emailOrPhone: string;
  password: string;
}

export interface VerifyOtpDTO {
  phoneOrEmail: string;
  code: string;
}

export interface RefreshTokenDTO {
  refreshToken: string;
}

export interface AuthResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    roles: Role[];
    avatarUrl?: string | null;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isIdentityVerified: boolean;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
