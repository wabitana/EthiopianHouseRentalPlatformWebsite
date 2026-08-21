import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
import { prisma } from '../prisma';

// Configure Cloudinary from process.env
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const apiKey = process.env.CLOUDINARY_API_KEY;
const apiSecret = process.env.CLOUDINARY_API_SECRET;

if (cloudName && apiKey && apiSecret) {
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
  });
  console.log(`☁️ Cloudinary configured for migration to cloud: ${cloudName}`);
} else {
  console.error('❌ Cloudinary environment variables are missing in .env!');
}

const uploadsDir = path.join(__dirname, '../../uploads');

async function uploadLocalFileToCloudinary(localPath: string, folder: string): Promise<string | null> {
  try {
    const filename = path.basename(localPath);
    const fullPath = path.join(uploadsDir, filename);

    if (!fs.existsSync(fullPath)) {
      console.warn(`⚠️ File not found on disk: ${fullPath}`);
      return null;
    }

    const res = await cloudinary.uploader.upload(fullPath, {
      folder: `delalaplatform/${folder}`,
    });
    return res.secure_url;
  } catch (err: any) {
    console.error(`❌ Cloudinary upload error for ${localPath}:`, err?.message || err);
    return null;
  }
}

async function migrateAllImagesToCloudinary() {
  console.log('🚀 Starting Database Image Migration to Cloudinary CDN...');

  // 1. Migrate Identity Documents
  const identityDocs = await prisma.identityDocument.findMany();
  console.log(`🔍 Checking ${identityDocs.length} Identity Documents...`);
  for (const doc of identityDocs) {
    if (doc.documentUrl && (doc.documentUrl.startsWith('/uploads/') || doc.documentUrl.includes('/uploads/'))) {
      const cdnUrl = await uploadLocalFileToCloudinary(doc.documentUrl, 'verification_docs');
      if (cdnUrl) {
        await prisma.identityDocument.update({
          where: { id: doc.id },
          data: { documentUrl: cdnUrl },
        });
        console.log(`✅ Migrated Identity Doc ${doc.id} -> ${cdnUrl}`);
      }
    }
  }

  // 2. Migrate House Properties Images
  const properties = await prisma.property.findMany();
  console.log(`🔍 Checking ${properties.length} Property Listings...`);
  for (const prop of properties) {
    let imagesArr: string[] = [];
    try {
      imagesArr = typeof prop.images === 'string' ? JSON.parse(prop.images) : prop.images || [];
    } catch (_) {
      imagesArr = [];
    }

    let updated = false;
    const newImagesArr: string[] = [];

    for (const img of imagesArr) {
      if (img && (img.startsWith('/uploads/') || img.includes('/uploads/'))) {
        const cdnUrl = await uploadLocalFileToCloudinary(img, 'property_images');
        if (cdnUrl) {
          newImagesArr.push(cdnUrl);
          updated = true;
        } else {
          newImagesArr.push(img);
        }
      } else {
        newImagesArr.push(img);
      }
    }

    if (updated) {
      await prisma.property.update({
        where: { id: prop.id },
        data: { images: JSON.stringify(newImagesArr) },
      });
      console.log(`✅ Migrated Property Images for ${prop.title}`);
    }
  }

  // 3. Migrate User Avatars
  const users = await prisma.user.findMany();
  console.log(`🔍 Checking ${users.length} Users...`);
  for (const user of users) {
    if (user.avatarUrl && (user.avatarUrl.startsWith('/uploads/') || user.avatarUrl.includes('/uploads/'))) {
      const cdnUrl = await uploadLocalFileToCloudinary(user.avatarUrl, 'user_avatars');
      if (cdnUrl) {
        await prisma.user.update({
          where: { id: user.id },
          data: { avatarUrl: cdnUrl },
        });
        console.log(`✅ Migrated User Avatar for ${user.name} -> ${cdnUrl}`);
      }
    }
  }

  console.log('🎉 Database Image Migration to Cloudinary Complete!');
}

migrateAllImagesToCloudinary()
  .catch((e) => console.error('Migration failed:', e))
  .finally(() => prisma.$disconnect());
