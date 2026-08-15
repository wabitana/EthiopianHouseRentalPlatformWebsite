"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("../../middleware/auth");
const router = (0, express_1.Router)();
const uploadDir = path_1.default.join(__dirname, '../../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `img-${uniqueSuffix}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage });
// POST /api/v1/upload
router.post('/', auth_1.authenticateToken, upload.single('image'), (req, res) => {
    if (req.body && req.body.base64) {
        try {
            const base64Data = req.body.base64.replace(/^data:image\/\w+;base64,/, '');
            const filename = `img-${Date.now()}-${Math.round(Math.random() * 1e9)}.jpg`;
            const filepath = path_1.default.join(uploadDir, filename);
            fs_1.default.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
            return res.json({ url: `/uploads/${filename}`, filename });
        }
        catch (e) {
            return res.status(400).json({ error: 'Failed to save base64 image' });
        }
    }
    if (!req.file) {
        return res.status(400).json({ error: 'No image file uploaded' });
    }
    const fileUrl = `/uploads/${req.file.filename}`;
    return res.json({ url: fileUrl, filename: req.file.filename });
});
exports.default = router;
