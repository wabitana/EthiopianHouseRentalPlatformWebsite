import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const uploadDir = path.join(__dirname, '../../uploads');
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
router.post('/', authenticateToken, upload.single('image'), (req, res) => {
  if (req.body && req.body.base64) {
    try {
      const base64Data = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
      const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
      return res.json({ url: `/uploads/${filename}`, filename });
    } catch (e) {
      return res.status(400).json({ error: 'Failed to save base64 image' });
    }
  }

  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({ url: fileUrl, filename: req.file.filename });
});

export default router;
