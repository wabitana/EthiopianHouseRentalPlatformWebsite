import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { authenticateToken } from '../../middleware/auth';

const router = Router();

// Configure Cloudinary if keys exist in process.env
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log(`☁️ Cloudinary CDN configured successfully for cloud: ${cloudName}`);
}

const uploadDir = path.join(__dirname, '../../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({ storage });

// POST /api/v1/upload
router.post('/', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    // 1. Handle Base64 Image Upload
    if (req.body && req.body.base64) {
      const base64Str = req.body.base64;

      if (isCloudinaryConfigured) {
        const result = await cloudinary.uploader.upload(base64Str, {
          folder: 'delalaplatform/verification_docs',
        });
        return res.json({ url: result.secure_url, filename: result.public_id, cdn: true });
      }

      // Fallback: Save locally if Cloudinary is not configured
      const base64Data = base64Str.replace(/^data:image\/\w+;base64,/, '');
      const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
      return res.json({ url: `/uploads/${filename}`, filename, cdn: false });
    }

    // 2. Handle Multipart File Upload
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    if (isCloudinaryConfigured) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: 'delalaplatform/property_images',
      });
      // Remove temporary file from local disk
      try {
        fs.unlinkSync(req.file.path);
      } catch (_) {}

      return res.json({ url: result.secure_url, filename: result.public_id, cdn: true });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl, filename: req.file.filename, cdn: false });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to upload image' });
  }
});

export default router;
