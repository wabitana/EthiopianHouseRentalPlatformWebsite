"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), '.env') });
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    API_PREFIX: process.env.API_PREFIX || '/api/v1',
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/ethiopian_property_db?schema=public',
    REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
    JWT_SECRET: process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || 'super_secret_refresh_key_change_in_production',
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
    OTP_TTL_SECONDS: parseInt(process.env.OTP_TTL_SECONDS || '300', 10), // 5 minutes
    UPLOAD_DIR: process.env.UPLOAD_DIR || path_1.default.join(process.cwd(), 'uploads'),
    CHAPA_SECRET_KEY: process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST_SIMULATION',
};
