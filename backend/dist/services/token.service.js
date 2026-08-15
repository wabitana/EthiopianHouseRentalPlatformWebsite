"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TokenService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
class TokenService {
    static generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        });
    }
    static generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, env_1.env.REFRESH_TOKEN_SECRET, {
            expiresIn: env_1.env.REFRESH_TOKEN_EXPIRES_IN,
        });
    }
    static verifyAccessToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    static verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, env_1.env.REFRESH_TOKEN_SECRET);
    }
}
exports.TokenService = TokenService;
