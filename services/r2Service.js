import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
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
    return key;
  } catch (error) {
    console.error('Error uploading file to R2:', error);
    throw new Error('فشل رفع الملف إلى خدمة التخزين السحابي.');
  }
};

const getPreSignedUrlForUpload = async (fileName, contentType, folder = '') => {
  const key = folder ? `${folder}/${fileName}` : fileName;
  const uploadParams = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return { signedUrl, key };
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('فشل إنشاء رابط للتخزين السحابي.');
  }
};

const getFileStream = async (key) => {
  const getParams = {
    Bucket: R2_BUCKET_NAME,
    Key: key,
  };

  try {
    const response = await s3Client.send(new GetObjectCommand(getParams));
    return response.Body;
  } catch (error) {
    console.error('Error getting file stream from R2:', error);
    throw new Error('فشل الحصول على الملف من خدمة التخزين السحابي.');
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

export { uploadFile, deleteFile, getPreSignedUrlForUpload, getFileStream };
