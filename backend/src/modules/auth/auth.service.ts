import { prisma } from '../../config/database';
import { PasswordService } from '../../services/password.service';
import { TokenService } from '../../services/token.service';
import { OtpService } from '../../services/otp.service';
import { ConflictError, UnauthorizedError, NotFoundError, BadRequestError } from '../../utils/errors';
import { RegisterDTO, LoginDTO, VerifyOtpDTO, AuthResponse } from './auth.types';
import { Role } from '@prisma/client';

export class AuthService {
  static async register(dto: RegisterDTO): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const normalizedPhone = dto.phone.trim();
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
      },
    });

    if (existingUser) {
      throw new ConflictError('User with this email or phone already exists');
    }

    const passwordHash = await PasswordService.hash(dto.password);
    const roles: Role[] = dto.roles && dto.roles.length > 0 ? dto.roles : [Role.RENTER];

    const user = await prisma.user.create({
      data: {
        name: dto.name,
        email: normalizedEmail,
        phone: normalizedPhone,
        passwordHash,
        roles,
      },
    });

    // Send OTP to email via Gmail SMTP upon registration
    await OtpService.sendOtp(user.email);
    if (user.phone) {
      await OtpService.sendOtp(user.phone);
    }

    const tokenPayload = { userId: user.id, email: user.email, roles: user.roles };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        isIdentityVerified: user.isIdentityVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async login(dto: LoginDTO): Promise<AuthResponse> {
    const normalizedInput = dto.emailOrPhone.trim().toLowerCase();
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: normalizedInput }, { phone: normalizedInput }],
      },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await PasswordService.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const tokenPayload = { userId: user.id, email: user.email, roles: user.roles };
    const accessToken = TokenService.generateAccessToken(tokenPayload);
    const refreshToken = TokenService.generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        roles: user.roles,
        avatarUrl: user.avatarUrl,
        isPhoneVerified: user.isPhoneVerified,
        isEmailVerified: user.isEmailVerified,
        isIdentityVerified: user.isIdentityVerified,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }

  static async verifyPhoneOtp(dto: VerifyOtpDTO): Promise<{ success: boolean; message: string }> {
    const isVerified = await OtpService.verifyOtp(dto.phoneOrEmail, dto.code);
    if (!isVerified) {
      throw new BadRequestError('Invalid or expired OTP code');
    }

    await prisma.user.updateMany({
      where: {
        OR: [{ phone: dto.phoneOrEmail }, { email: dto.phoneOrEmail }],
      },
      data: {
        isPhoneVerified: true,
        isEmailVerified: true,
      },
    });

    return { success: true, message: 'Verification successfully completed' };
  }

  static async refreshToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = TokenService.verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });

      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }

      const newTokenPayload = { userId: user.id, email: user.email, roles: user.roles };
      const newAccessToken = TokenService.generateAccessToken(newTokenPayload);
      const newRefreshToken = TokenService.generateRefreshToken(newTokenPayload);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (err) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }
  }

  static async sendOtp(phoneOrEmail: string): Promise<{ message: string }> {
    await OtpService.sendOtp(phoneOrEmail);
    return { message: 'OTP sent successfully' };
  }
}
