import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storageConfig } from '../config/storage';
import { BadRequestError } from '../utils/errors';

// Ensure upload folders exist
if (!fs.existsSync(storageConfig.uploadDir)) {
  fs.mkdirSync(storageConfig.uploadDir, { recursive: true });
}

if (!fs.existsSync(storageConfig.privateUploadDir)) {
  fs.mkdirSync(storageConfig.privateUploadDir, { recursive: true });
}

const publicStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageConfig.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const privateStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageConfig.privateUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `private-${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (storageConfig.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new BadRequestError(`Invalid file type. Allowed: ${storageConfig.allowedMimeTypes.join(', ')}`));
  }
};

export const uploadPublic = multer({
  storage: publicStorage,
  limits: { fileSize: storageConfig.maxFileSize },
  fileFilter,
});

export const uploadPrivate = multer({
  storage: privateStorage,
  limits: { fileSize: storageConfig.maxFileSize },
  fileFilter,
});
