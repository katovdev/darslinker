import { Router } from "express";
import { uploadImage, uploadCourseCover, uploadVideo, uploadDocument } from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import upload, { uploadSingleDocument } from "../middlewares/upload.middleware.js";
import fs from 'fs/promises';
import path from 'path';

const uploadRouter = Router();

/**
 * @swagger
 * /upload/image:
 *   post:
 *     summary: Upload profile image
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 */
uploadRouter.post("/image", authenticate, upload.single("file"), uploadImage);

/**
 * @swagger
 * /upload/course-cover:
 *   post:
 *     summary: Upload course cover image
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Course cover uploaded successfully
 */
uploadRouter.post("/course-cover", authenticate, upload.single("file"), uploadCourseCover);

/**
 * @swagger
 * /upload/video:
 *   post:
 *     summary: Upload video
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Video uploaded successfully
 */
// Add request logging middleware for video upload
uploadRouter.use("/video", (req, res, next) => {
  console.log("🎥 Video upload route hit:", {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.get('content-type'),
      'content-length': req.get('content-length'),
      'authorization': req.get('authorization') ? 'Bearer ***' : 'None'
    },
    timestamp: new Date().toISOString()
  });
  next();
});

uploadRouter.post("/video", authenticate, (req, res, next) => {
  // Check if client disconnected
  req.on('close', () => {
    if (!res.headersSent) {
      console.log('🛑 Client disconnected during upload');
    }
  });
  
  const middleware = upload.single("file");
  
  middleware(req, res, (err) => {
    if (err) {
      console.error("❌ Multer video upload error:", {
        error: err.message,
        code: err.code,
        field: err.field,
        stack: err.stack
      });
      return res.status(422).json({
        success: false,
        message: err.message || "File upload failed"
      });
    }
    
    console.log("✅ Multer video processing completed", {
      hasFile: !!req.file,
      fileName: req.file?.originalname,
      size: req.file?.size,
      mimetype: req.file?.mimetype
    });
    
    next();
  });
}, uploadVideo);

/**
 * @swagger
 * /upload/document:
 *   post:
 *     summary: Upload document (certificate, PDF, etc.)
 *     tags: [Upload]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 */
// Add request logging middleware
uploadRouter.use("/document", (req, res, next) => {
  console.log("🔍 Document upload route hit:", {
    method: req.method,
    url: req.url,
    headers: {
      'content-type': req.get('content-type'),
      'authorization': req.get('authorization') ? 'Bearer ***' : 'None'
    },
    timestamp: new Date().toISOString()
  });
  next();
});

uploadRouter.post("/document", authenticate, uploadSingleDocument, uploadDocument);

/**
 * @swagger
 * /upload/stream/{filename}:
 *   get:
 *     summary: Stream video file
 *     tags: [Upload]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       206:
 *         description: Partial content (video stream)
 *       404:
 *         description: Video not found
 */
uploadRouter.get("/stream/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const videoPath = path.join(process.cwd(), "uploads", filename);
    
    // Check if file exists
    const stat = await fs.stat(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      // Create read stream for the requested range
      const file = fs.createReadStream(videoPath, { start, end });
      
      // Set headers for partial content
      const head = {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(206, head);
      file.pipe(res);
    } else {
      // No range requested, send entire file
      const head = {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
      };
      
      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Video streaming error:", error);
    res.status(404).json({
      success: false,
      message: "Video not found"
    });
  }
});

export default uploadRouter;
