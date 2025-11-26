import { Router } from "express";
import { uploadImage, uploadCourseCover, uploadVideo, uploadDocument } from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import upload, { uploadSingleDocument } from "../middlewares/upload.middleware.js";

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
uploadRouter.post("/video", authenticate, upload.single("file"), uploadVideo);

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

export default uploadRouter;
