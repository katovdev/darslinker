import { catchAsync } from "../middlewares/error.middleware.js";
import { ValidationError } from "../utils/error.utils.js";
import logger from "../../config/logger.js";
import cloudinary from "../../config/cloudinary.js";

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
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "darslinker/profiles",
      transformation: [
        { width: 500, height: 500, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    logger.info("Image uploaded successfully", {
      userId: req.user?.userId,
      imageUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id
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
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "darslinker/courses",
      transformation: [
        { width: 1200, height: 630, crop: "limit" },
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    logger.info("Course cover uploaded successfully", {
      userId: req.user?.userId,
      imageUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: "Course cover uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id
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
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "darslinker/videos",
      resource_type: "video",
      transformation: [
        { quality: "auto" },
        { fetch_format: "auto" }
      ]
    });

    logger.info("Video uploaded successfully", {
      userId: req.user?.userId,
      videoUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      duration: result.duration
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
  if (!req.file) {
    throw new ValidationError("No file uploaded");
  }

  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "darslinker/documents",
      resource_type: "raw"
    });

    logger.info("Document uploaded successfully", {
      userId: req.user?.userId,
      documentUrl: result.secure_url
    });

    res.status(200).json({
      success: true,
      message: "Document uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes
    });
  } catch (error) {
    logger.error("Document upload failed", {
      error: error.message,
      userId: req.user?.userId
    });
    throw new ValidationError("Failed to upload document");
  }
});
