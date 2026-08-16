"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudinaryService = void 0;
const cloudinary_1 = require("cloudinary");
const fs_1 = __importDefault(require("fs"));
// Configure Cloudinary using environmental variables
cloudinary_1.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
class CloudinaryService {
    /**
     * Uploads a local file to Cloudinary and deletes the local temporary file
     * @param localPath Local filesystem path of the file
     * @param folder Target folder name on Cloudinary
     */
    static async uploadFile(localPath, folder = 'delala') {
        try {
            const result = await cloudinary_1.v2.uploader.upload(localPath, {
                folder,
                resource_type: 'auto', // Automatically handles pdf, images, raw docs
            });
            // Cleanup local temp file
            if (fs_1.default.existsSync(localPath)) {
                fs_1.default.unlinkSync(localPath);
            }
            return result.secure_url;
        }
        catch (error) {
            // Always cleanup local file on error
            if (fs_1.default.existsSync(localPath)) {
                fs_1.default.unlinkSync(localPath);
            }
            console.error('Cloudinary upload failure:', error);
            throw new Error('Failed to upload asset to storage provider');
        }
    }
}
exports.CloudinaryService = CloudinaryService;
