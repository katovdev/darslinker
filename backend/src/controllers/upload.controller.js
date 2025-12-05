import { catchAsync } from "../middlewares/error.middleware.js";
import { ValidationError } from "../utils/error.utils.js";
import logger from "../../config/logger.js";
import { uploadImageToR2, uploadVideoToR2, uploadFileToR2 } from "../services/r2-upload.service.js";
import fs from 'fs/promises';

/**
 * Upload image to Cloudinary
 * @route POST /upload/image
 * @access Private
 */
export const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  try {
    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadImageToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("Image uploaded successfully to R2", {
      userId: req.user?.userId,
      imageUrl: url
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: url
    });
  } catch (error) {
    logger.error("Image upload failed", {
      error: error.message,
      userId: req.user?.userId
    });
    throw new ValidationError("Failed to upload image");
  }
});

/**
 * Upload course cover image
 * @route POST /upload/course-cover
 * @access Private
 */
export const uploadCourseCover = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  try {
    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadImageToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("Course cover uploaded successfully to R2", {
      userId: req.user?.userId,
      imageUrl: url
    });

    res.status(200).json({
      success: true,
      message: "Course cover uploaded successfully",
      url: url
    });
  } catch (error) {
    logger.error("Course cover upload failed", {
      error: error.message,
      userId: req.user?.userId
    });
    throw new ValidationError("Failed to upload course cover");
  }
});

/**
 * Upload video to Cloudinary
 * @route POST /upload/video
 * @access Private
 */
export const uploadVideo = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  try {
    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadVideoToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("Video uploaded successfully to R2", {
      userId: req.user?.userId,
      videoUrl: url
    });

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      url: url
    });
  } catch (error) {
    logger.error("Video upload failed", {
      error: error.message,
      userId: req.user?.userId
    });
    throw new ValidationError("Failed to upload video");
  }
});

/**
 * Upload document/file
 * @route POST /upload/document
 * @access Private
 */
export const uploadDocument = catchAsync(async (req, res) => {
  logger.info("📄 Document upload request received", {
    userId: req.user?.userId,
    hasFile: !!req.file,
    fileDetails: req.file ? {
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    } : null
  });

  if (!req.file) {
    logger.error("No file uploaded in document upload request", {
      userId: req.user?.userId
    });
    throw new ValidationError("No file uploaded");
  }

  try {
    logger.info("🚀 Starting R2 upload for document", {
      userId: req.user?.userId,
      fileName: req.file.originalname,
      filePath: req.file.path
    });

    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadFileToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("✅ Document uploaded successfully to R2", {
      userId: req.user?.userId,
      documentUrl: url,
      size: req.file.size
    });

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      url: url,
      size: req.file.size
    });
  } catch (error) {
    logger.error("❌ Document upload failed", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.userId,
      fileName: req.file?.originalname
    });
    throw new ValidationError("Failed to upload document: " + error.message);
  }
});
