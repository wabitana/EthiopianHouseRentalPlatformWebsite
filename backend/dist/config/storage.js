"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storageConfig = void 0;
exports.ensureStorageDirectories = ensureStorageDirectories;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const env_1 = require("./env");
exports.storageConfig = {
    uploadDir: env_1.env.UPLOAD_DIR,
    privateUploadDir: path_1.default.join(env_1.env.UPLOAD_DIR, 'private_documents'),
    maxFileSize: 10 * 1024 * 1024, // 10MB limit
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};
function ensureStorageDirectories() {
    if (!fs_1.default.existsSync(exports.storageConfig.uploadDir)) {
        fs_1.default.mkdirSync(exports.storageConfig.uploadDir, { recursive: true });
    }
    if (!fs_1.default.existsSync(exports.storageConfig.privateUploadDir)) {
        fs_1.default.mkdirSync(exports.storageConfig.privateUploadDir, { recursive: true });
    }
    console.log('✅ Storage directories verified.');
}
