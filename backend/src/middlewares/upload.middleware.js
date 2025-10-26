import multer from "multer";
import path from "path";

/**
 * Multer storage configuration
 * Stores uploaded files in the 'uploads' directory temporarily
 */
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // process.cwd() returns backend directory
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

/**
 * File filter to accept only images and videos
 * @param {Object} req - Express request object
 * @param {Object} file - Uploaded file
 * @param {Function} cb - Callback function
 */
const fileFilter = (req, file, cb) => {
  // Allowed image formats
  const imageFormats = /png|jpg/;
  // Allowed video formats
  const videoFormats = /mp4|avi|mov|wmv|flv|webm/;

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if file is an image
  if (imageFormats.test(extname.slice(1)) && mimetype.startsWith("image/")) {
    return cb(null, true);
  }

  // Check if file is a video
  if (videoFormats.test(extname.slice(1)) && mimetype.startsWith("video/")) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type. Only images (PNG, JPG) and videos (MP4, AVI, MOV, WMV, FLV, WEBM) are allowed"
    )
  );
};

/**
 * Multer upload middleware configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 50MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * Upload single image middleware
 */
export const uploadSingleImage = upload.single("image");

/**
 * Upload multiple images middleware (max 10)
 */
export const uploadMultipleImages = upload.array("images", 10);

/**
 * Upload single video middleware
 */
export const uploadSingleVideo = upload.single("video");

/**
 * Upload course media (image and video)
 */
export const uploadCourseMedia = upload.fields([
  { name: "courseImage", maxCount: 1 },
  { name: "videoUrl", maxCount: 1 },
]);

/**
 * Error handling middleware for multer
 */
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size is too large. Maximum file size is 100MB",
      });
    }
    if (err.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded",
      });
    }
    return res.status(400).json({
      success: false,
      message: "File upload error: " + err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

export default upload;
