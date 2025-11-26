import { Router } from "express";
import { uploadImage, uploadCourseCover, uploadVideo, uploadDocument } from "../controllers/upload.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

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
 *     summary: Upload document
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
uploadRouter.post("/document", authenticate, upload.single("file"), uploadDocument);

export default uploadRouter;
