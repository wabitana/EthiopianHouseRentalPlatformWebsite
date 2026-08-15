"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config({ path: path_1.default.join(__dirname, '../../.env') });
exports.config = {
    env: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    databaseUrl: process.env.DATABASE_URL || '',
    jwtSecret: process.env.JWT_SECRET || 'ethiopian-property-platform-jwt-secret-key-2026',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
    redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
    storageDir: path_1.default.join(__dirname, '../../uploads'),
    aiApiKey: process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY || '',
};
