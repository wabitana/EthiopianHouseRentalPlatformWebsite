"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpService = void 0;
const redis_1 = require("../config/redis");
const env_1 = require("../config/env");
class OtpService {
    static generateOtpCode() {
        // Generate a 6-digit random numeric OTP code
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    static async sendOtp(phoneOrEmail) {
        const otp = this.generateOtpCode();
        const key = `otp:${phoneOrEmail}`;
        await redis_1.redisClient.set(key, otp, env_1.env.OTP_TTL_SECONDS);
        console.log(`📱 [OTP SIMULATION] Code for ${phoneOrEmail} is: ${otp}`);
        return otp;
    }
    static async verifyOtp(phoneOrEmail, code) {
        const key = `otp:${phoneOrEmail}`;
        const storedOtp = await redis_1.redisClient.get(key);
        if (!storedOtp)
            return false;
        if (storedOtp === code) {
            await redis_1.redisClient.del(key); // Single-use OTP pattern
            return true;
        }
        return false;
    }
}
exports.OtpService = OtpService;
