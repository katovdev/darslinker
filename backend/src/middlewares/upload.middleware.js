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
 * File filter for documents (images, PDFs, Word, Excel, PowerPoint, text files)
 * @param {Object} req - Express request object
 * @param {Object} file - Uploaded file
 * @param {Function} cb - Callback function
 */
const documentFileFilter = (req, file, cb) => {
  // Allowed formats for documents
  const allowedFormats = /jpeg|jpg|png|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
  const allowedMimetypes = [
    'image/jpeg', 
    'image/jpg', 
    'image/png', 
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
    'application/zip', // .zip
    'application/x-rar-compressed', // .rar
    'application/x-zip-compressed' // .zip alternative
  ];

  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check if file format is allowed
  if (allowedFormats.test(extname.slice(1)) && allowedMimetypes.includes(mimetype)) {
    return cb(null, true);
  }

  cb(
    new Error(
      "Invalid file type. Only images (JPEG, PNG), PDF, Word, Excel, PowerPoint, text files, and archives (ZIP, RAR) are allowed"
    )
  );
};

/**
 * Multer upload middleware configuration
 */
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB max file size
  },
  fileFilter: fileFilter,
});

/**
 * Multer upload middleware for documents (images, PDFs, Office files, archives)
 */
const uploadDocument = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size for documents
  },
  fileFilter: documentFileFilter,
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
 * Upload single document middleware (for certificates, etc.)
 */
export const uploadSingleDocument = (req, res, next) => {
  const middleware = uploadDocument.single("file");

  middleware(req, res, (err) => {
    if (err) {
      console.error("❌ Multer document upload error:", {
        error: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack
      });
    } else {
      console.log("✅ Multer document processing completed", {
        hasFile: !!req.file,
        fileName: req.file?.originalname,
        size: req.file?.size
      });
    }
    next(err);
  });
};

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
