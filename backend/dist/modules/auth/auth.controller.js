"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("./auth.service");
const response_1 = require("../../utils/response");
class AuthController {
    static async register(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.register(req.body);
            (0, response_1.sendSuccess)(res, result, 'User registered successfully', 201);
        }
        catch (error) {
            next(error);
        }
    }
    static async login(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.login(req.body);
            (0, response_1.sendSuccess)(res, result, 'User logged in successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async verifyPhone(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.verifyPhoneOtp(req.body);
            (0, response_1.sendSuccess)(res, result, 'Phone verified successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async refreshToken(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.refreshToken(req.body.refreshToken);
            (0, response_1.sendSuccess)(res, result, 'Token refreshed successfully');
        }
        catch (error) {
            next(error);
        }
    }
    static async sendOtp(req, res, next) {
        try {
            const result = await auth_service_1.AuthService.sendOtp(req.body.phoneOrEmail);
            (0, response_1.sendSuccess)(res, result, 'OTP sent successfully');
        }
        catch (error) {
            next(error);
        }
    }
}
exports.AuthController = AuthController;
