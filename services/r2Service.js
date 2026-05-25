import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';

dotenv.config();

const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY;
const R2_SECRET_KEY = process.env.R2_SECRET_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
const R2_ENDPOINT = process.env.R2_ENDPOINT;

if (!R2_ACCESS_KEY || !R2_SECRET_KEY || !R2_BUCKET_NAME || !R2_ENDPOINT) {
  console.error('R2 environment variables are not fully configured.');
  process.exit(1);
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

const uploadFile = async (fileBuffer, fileName, contentType, folder = '') => {
  const key = folder ? `${folder}/${fileName}` : fileName;
  const uploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
    Body: fileBuffer,
    ContentType: contentType,
  };

  try {
    await s3Client.send(new PutObjectCommand(uploadParams));
    return key; // Return the key instead of full URL
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error('فشل رفع الملف إلى خدمة التخزين السحابي.');
  }
};

const deleteFile = async (fileName) => {
  const deleteParams = {
    Bucket: R2_BUCKET_NAME,
    Key: fileName,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    return { success: true, message: 'تم حذف الملف بنجاح من R2.' };
  } catch (error) {
    console.error('Error deleting file from R2:', error);
    throw new Error('فشل حذف الملف من خدمة التخزين السحابي.');
  }
};

export { uploadFile, deleteFile };
