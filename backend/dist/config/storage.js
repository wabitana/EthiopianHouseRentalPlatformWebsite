"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageConfig = void 0;
const fs_1 = __importDefault(require("fs"));
const env_1 = require("./env");
exports.storageConfig = {
    uploadDir: env_1.config.storageDir,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};
// Ensure upload directory exists
if (!fs_1.default.existsSync(exports.storageConfig.uploadDir)) {
    fs_1.default.mkdirSync(exports.storageConfig.uploadDir, { recursive: true });
}
