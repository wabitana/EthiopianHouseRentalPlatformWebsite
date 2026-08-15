"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPrivate = exports.uploadPublic = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage_1 = require("../config/storage");
const errors_1 = require("../utils/errors");
// Ensure upload folders exist
if (!fs_1.default.existsSync(storage_1.storageConfig.uploadDir)) {
    fs_1.default.mkdirSync(storage_1.storageConfig.uploadDir, { recursive: true });
}
if (!fs_1.default.existsSync(storage_1.storageConfig.privateUploadDir)) {
    fs_1.default.mkdirSync(storage_1.storageConfig.privateUploadDir, { recursive: true });
}
const publicStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storage_1.storageConfig.uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const privateStorage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, storage_1.storageConfig.privateUploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `private-${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});
const fileFilter = (req, file, cb) => {
    if (storage_1.storageConfig.allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new errors_1.BadRequestError(`Invalid file type. Allowed: ${storage_1.storageConfig.allowedMimeTypes.join(', ')}`));
    }
};
exports.uploadPublic = (0, multer_1.default)({
    storage: publicStorage,
    limits: { fileSize: storage_1.storageConfig.maxFileSize },
    fileFilter,
});
exports.uploadPrivate = (0, multer_1.default)({
    storage: privateStorage,
    limits: { fileSize: storage_1.storageConfig.maxFileSize },
    fileFilter,
});
