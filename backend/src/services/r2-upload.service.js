import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import r2Client, { R2_BUCKET_NAME, R2_PUBLIC_URL } from '../../config/r2.config.js';
import crypto from 'crypto';
import path from 'path';

/**
 * Upload file to Cloudflare R2
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} originalName - Original filename
 * @param {string} mimetype - File MIME type
 * @param {string} folder - Folder path in bucket (e.g., 'videos', 'images')
 * @returns {Promise<string>} - Public URL of uploaded file
 */
export async function uploadToR2(fileBuffer, originalName, mimetype, folder = 'uploads') {
  try {
    console.log('🚀 Starting R2 upload...');
    console.log('📁 Folder:', folder);
    console.log('📄 Original filename:', originalName);
    console.log('📦 File size:', fileBuffer.length, 'bytes');
    console.log('🔧 MIME type:', mimetype);
    
    // Generate unique filename
    const fileExt = path.extname(originalName);
    const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExt}`;
    const key = `${folder}/${fileName}`;

    console.log('🔑 R2 Key:', key);
    console.log('🪣 R2 Bucket:', R2_BUCKET_NAME);

    // Upload to R2
    const upload = new Upload({
      client: r2Client,
      params: {
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: fileBuffer,
        ContentType: mimetype,
      },
    });

    console.log('⏳ Uploading to Cloudflare R2...');
    await upload.done();

    // Return public URL
    const publicUrl = `${R2_PUBLIC_URL}/${key}`;
    console.log('✅ SUCCESS! File uploaded to Cloudflare R2');
    console.log('🌐 Public URL:', publicUrl);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    return publicUrl;
  } catch (error) {
    console.error('❌ CLOUDFLARE R2 UPLOAD ERROR:', error.message);
    console.error('❌ Error details:', error);
    throw new Error('Failed to upload file to R2: ' + error.message);
  }
}

/**
 * Delete file from R2
 * @param {string} fileUrl - Public URL of file
 * @returns {Promise<boolean>}
 */
export async function deleteFromR2(fileUrl) {
  try {
    // Extract key from URL
    const key = fileUrl.replace(`${R2_PUBLIC_URL}/`, '');

    const command = new DeleteObjectCommand({
      Bucket: R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
    console.log('✅ File deleted from R2:', key);
    
    return true;
  } catch (error) {
    console.error('❌ R2 delete error:', error);
    return false;
  }
}

/**
 * Upload video to R2
 */
export async function uploadVideoToR2(fileBuffer, originalName, mimetype) {
  return uploadToR2(fileBuffer, originalName, mimetype, 'videos');
}

/**
 * Upload image to R2
 */
export async function uploadImageToR2(fileBuffer, originalName, mimetype) {
  return uploadToR2(fileBuffer, originalName, mimetype, 'images');
}

/**
 * Upload file to R2
 */
export async function uploadFileToR2(fileBuffer, originalName, mimetype) {
  return uploadToR2(fileBuffer, originalName, mimetype, 'files');
}
