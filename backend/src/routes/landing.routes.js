import { Router } from "express";
import { 
  getLandingSettings, 
  updateLandingSettings, 
  getPublicLandingPage,
  checkUrlAvailability
} from "../controllers/landing.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";

const landingRouter = Router();

/**
 * @swagger
 * /landing/public/{teacherId}:
 *   get:
 *     summary: Get public landing page data
 *     tags: [Landing]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landing page data retrieved successfully
 *       404:
 *         description: Teacher not found
 */
landingRouter.get("/check-url/:customUrl", checkUrlAvailability);
landingRouter.get("/public/:teacherId", getPublicLandingPage);

/**
 * @swagger
 * /landing/{teacherId}:
 *   get:
 *     summary: Get landing page settings
 *     tags: [Landing]
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Landing settings retrieved successfully
 *       404:
 *         description: Teacher not found
 */
landingRouter.get("/:teacherId", getLandingSettings);

/**
 * @swagger
 * /landing/{teacherId}:
 *   put:
 *     summary: Update landing page settings
 *     tags: [Landing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               subtitle:
 *                 type: string
 *               description:
 *                 type: string
 *               primaryColor:
 *                 type: string
 *               backgroundColor:
 *                 type: string
 *               textColor:
 *                 type: string
 *               showCourses:
 *                 type: boolean
 *               showAbout:
 *                 type: boolean
 *               aboutText:
 *                 type: string
 *     responses:
 *       200:
 *         description: Landing settings updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
landingRouter.put("/:teacherId", authenticate, updateLandingSettings);

/**
 * @swagger
 * /landing/check-url/{customUrl}:
 *   get:
 *     summary: Check if custom URL (subdomain) is available
 *     tags: [Landing]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: customUrl
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: URL availability checked successfully
 *       400:
 *         description: Bad request (invalid format)
 */
landingRouter.get("/check-url/:customUrl", authenticate, checkUrlAvailability);

export default landingRouter;