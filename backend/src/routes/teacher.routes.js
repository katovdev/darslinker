import { Router } from "express";
import {
  findAll,
  findOne,
  update,
  remove,
} from "../controllers/teacher.controller.js";
import {
  authenticate,
  isOwnerOrAdmin,
} from "../middlewares/auth.middleware.js";

const teacherRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Teacher ID
 *         firstName:
 *           type: string
 *           description: Teacher's first name
 *         lastName:
 *           type: string
 *           description: Teacher's last name
 *         email:
 *           type: string
 *           description: Teacher's email address
 *         phone:
 *           type: string
 *           description: Teacher's phone number
 *         role:
 *           type: string
 *           enum: [teacher]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [pending, active, inactive, blocked]
 *           description: Account status
 *         bio:
 *           type: string
 *           description: Teacher biography
 *         specialization:
 *           type: string
 *           description: Teacher's subject specialization
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         ratingAverage:
 *           type: number
 *           description: Average rating from students
 *         reviewsCount:
 *           type: number
 *           description: Total number of reviews
 *         reviews:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               studentId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *               createdAt:
 *                 type: string
 *                 format: date-time
 *         certificates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               issuer:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               url:
 *                 type: string
 *         courseCount:
 *           type: number
 *           description: Number of courses created
 *         studentCount:
 *           type: number
 *           description: Number of enrolled students
 *         totalEarnings:
 *           type: number
 *           description: Total earnings accumulated
 *         balance:
 *           type: number
 *           description: Current account balance
 *         courses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *           description: Courses created by teacher
 *         paymentMethods:
 *           type: object
 *           properties:
 *             click:
 *               type: string
 *             payme:
 *               type: string
 *             uzum:
 *               type: string
 *             bankAccount:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     UpdateTeacherInput:
 *       type: object
 *       properties:
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         bio:
 *           type: string
 *         specialization:
 *           type: string
 *         profileImage:
 *           type: string
 *         certificates:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               issuer:
 *                 type: string
 *               issueDate:
 *                 type: string
 *                 format: date
 *               url:
 *                 type: string
 *         paymentMethods:
 *           type: object
 *           properties:
 *             click:
 *               type: string
 *             payme:
 *               type: string
 *             uzum:
 *               type: string
 *             bankAccount:
 *               type: string
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     description: Retrieve a list of all teachers with their courses and ratings
 *     tags: [Teachers]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of teachers retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
teacherRouter.get("/", authenticate, findAll);

/**
 * @swagger
 * /teachers/{id}:
 *   get:
 *     summary: Get teacher by ID
 *     description: Retrieve detailed information about a specific teacher including courses and reviews
 *     tags: [Teachers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad Request - Invalid teacher ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
teacherRouter.get("/:id", authenticate, findOne);

/**
 * @swagger
 * /teachers/{id}:
 *   put:
 *     summary: Update teacher profile
 *     description: Update teacher's personal information, specialization, and payment settings
 *     tags: [Teachers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateTeacherInput'
 *           example:
 *             firstName: Jane
 *             lastName: Smith
 *             bio: Experienced educator with 10+ years in web development
 *             specialization: Full Stack Web Development
 *             paymentMethods:
 *               click: "123456789"
 *               payme: "987654321"
 *     responses:
 *       200:
 *         description: Teacher profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Teacher updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad Request - Validation error or invalid ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot update other user's profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
teacherRouter.put("/:id", authenticate, isOwnerOrAdmin, update);

/**
 * @swagger
 * /teachers/{id}:
 *   delete:
 *     summary: Deactivate teacher account
 *     description: Soft delete - Sets teacher status to 'inactive' while preserving course and earnings data
 *     tags: [Teachers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher account deactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Teacher removed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad Request - Invalid teacher ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot delete other user's account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
teacherRouter.delete("/:id", authenticate, isOwnerOrAdmin, remove);

export default teacherRouter;
