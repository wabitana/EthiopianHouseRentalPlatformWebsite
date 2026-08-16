import path from 'path';
import fs from 'fs';
import { config } from './env';

export const storageConfig = {
  uploadDir: config.storageDir,
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

// Ensure upload directory exists
if (!fs.existsSync(storageConfig.uploadDir)) {
  fs.mkdirSync(storageConfig.uploadDir, { recursive: true });
}
