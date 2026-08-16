import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Configure Cloudinary using environmental variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Uploads a local file to Cloudinary and deletes the local temporary file
   * @param localPath Local filesystem path of the file
   * @param folder Target folder name on Cloudinary
   */
  static async uploadFile(localPath: string, folder: string = 'delala'): Promise<string> {
    try {
      const result = await cloudinary.uploader.upload(localPath, {
        folder,
        resource_type: 'auto', // Automatically handles pdf, images, raw docs
      });

      // Cleanup local temp file
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }

      return result.secure_url;
    } catch (error) {
      // Always cleanup local file on error
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
      console.error('Cloudinary upload failure:', error);
      throw new Error('Failed to upload asset to storage provider');
    }
  }
}
