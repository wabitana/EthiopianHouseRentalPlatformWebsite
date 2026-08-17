"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const database_1 = require("../../config/database");
const password_service_1 = require("../../services/password.service");
const token_service_1 = require("../../services/token.service");
const otp_service_1 = require("../../services/otp.service");
const errors_1 = require("../../utils/errors");
const client_1 = require("@prisma/client");
class AuthService {
    static async register(dto) {
        const normalizedEmail = dto.email.trim().toLowerCase();
        const normalizedPhone = dto.phone.trim();
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [{ email: normalizedEmail }, { phone: normalizedPhone }],
            },
        });
        if (existingUser) {
            throw new errors_1.ConflictError('User with this email or phone already exists');
        }
        const passwordHash = await password_service_1.PasswordService.hash(dto.password);
        const roles = dto.roles && dto.roles.length > 0 ? dto.roles : [client_1.Role.RENTER];
        const user = await database_1.prisma.user.create({
            data: {
                name: dto.name,
                email: normalizedEmail,
                phone: normalizedPhone,
                passwordHash,
                roles,
            },
        });
        // Send OTP to email via Gmail SMTP upon registration
        await otp_service_1.OtpService.sendOtp(user.email);
        if (user.phone) {
            await otp_service_1.OtpService.sendOtp(user.phone);
        }
        const tokenPayload = { userId: user.id, email: user.email, roles: user.roles };
        const accessToken = token_service_1.TokenService.generateAccessToken(tokenPayload);
        const refreshToken = token_service_1.TokenService.generateRefreshToken(tokenPayload);
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
    static async login(dto) {
        const normalizedInput = dto.emailOrPhone.trim().toLowerCase();
        const user = await database_1.prisma.user.findFirst({
            where: {
                OR: [{ email: normalizedInput }, { phone: normalizedInput }],
            },
        });
        if (!user) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const isMatch = await password_service_1.PasswordService.compare(dto.password, user.passwordHash);
        if (!isMatch) {
            throw new errors_1.UnauthorizedError('Invalid credentials');
        }
        const tokenPayload = { userId: user.id, email: user.email, roles: user.roles };
        const accessToken = token_service_1.TokenService.generateAccessToken(tokenPayload);
        const refreshToken = token_service_1.TokenService.generateRefreshToken(tokenPayload);
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
    static async verifyPhoneOtp(dto) {
        const isVerified = await otp_service_1.OtpService.verifyOtp(dto.phoneOrEmail, dto.code);
        if (!isVerified) {
            throw new errors_1.BadRequestError('Invalid or expired OTP code');
        }
        await database_1.prisma.user.updateMany({
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
    static async refreshToken(refreshToken) {
        try {
            const payload = token_service_1.TokenService.verifyRefreshToken(refreshToken);
            const user = await database_1.prisma.user.findUnique({ where: { id: payload.userId } });
            if (!user) {
                throw new errors_1.UnauthorizedError('User no longer exists');
            }
            const newTokenPayload = { userId: user.id, email: user.email, roles: user.roles };
            const newAccessToken = token_service_1.TokenService.generateAccessToken(newTokenPayload);
            const newRefreshToken = token_service_1.TokenService.generateRefreshToken(newTokenPayload);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch (err) {
            throw new errors_1.UnauthorizedError('Invalid or expired refresh token');
        }
    }
    static async sendOtp(phoneOrEmail) {
        await otp_service_1.OtpService.sendOtp(phoneOrEmail);
        return { message: 'OTP sent successfully' };
    }
}
exports.AuthService = AuthService;
