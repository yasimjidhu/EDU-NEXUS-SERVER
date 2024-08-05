import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  async uploadToCloudinary(file: any): Promise<string> {
    const result = await cloudinary.uploader.upload(file.path, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
    return result.secure_url;
  }
}
