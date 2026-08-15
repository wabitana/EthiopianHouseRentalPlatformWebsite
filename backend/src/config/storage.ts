import fs from 'fs';
import path from 'path';
import { env } from './env';

export interface StorageConfig {
  uploadDir: string;
  privateUploadDir: string;
  maxFileSize: number; // in bytes
  allowedMimeTypes: string[];
}

export const storageConfig: StorageConfig = {
  uploadDir: env.UPLOAD_DIR,
  privateUploadDir: path.join(env.UPLOAD_DIR, 'private_documents'),
  maxFileSize: 10 * 1024 * 1024, // 10MB limit
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

export function ensureStorageDirectories(): void {
  if (!fs.existsSync(storageConfig.uploadDir)) {
    fs.mkdirSync(storageConfig.uploadDir, { recursive: true });
  }

  if (!fs.existsSync(storageConfig.privateUploadDir)) {
    fs.mkdirSync(storageConfig.privateUploadDir, { recursive: true });
  }

  console.log('✅ Storage directories verified.');
}
