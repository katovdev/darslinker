import { Router } from "express";
import { findAll, findOne, update } from "../controllers/teacher.controller.js";
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
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Teacher's first name
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *           description: Teacher's last name
 *         specialization:
 *           type: string
 *           description: Teacher's subject or field specialization
 *         bio: 
 *           type: string
 *           description: Teacher biography or introduction
 *         city:
 *           type: string
 *           description: Teacher's city
 *         country:
 *           type: string
 *           description: Teacher's country
 *         email:
 *           type: string
 *           format: email
 *           description: Teacher's email address (must be unique)
 *         phone:
 *           type: string
 *           description: Teacher's phone number (must be unique)
 *         telegram username:
 *           type: string
 *           description: Teacher's telegram username
 *         paymentMethods:
 *           type: object
 *           description: Payment methods for receiving earnings
 *           properties:
 *             click:
 *               type: string
 *               description: Click payment account number
 *             payme:
 *               type: string
 *               description: Payme payment account number
 *             uzum:
 *               type: string
 *               description: Uzum payment account number
 *             bankAccount:
 *               type: string
 *               description: Bank account number
 */

/**
 * @swagger
 * /teachers:
 *   get:
 *     summary: Get all teachers
 *     description: Retrieve a list of all teachers with their courses and ratings
 *     tags: [User Management - Teachers]
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
 *     tags: [User Management - Teachers]
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
 *   patch:
 *     summary: Update teacher profile
 *     description: Update teacher's personal information, specialization, and payment settings
 *     tags: [User Management - Teachers]
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
 *             profileImage: https://example.com/images/jane-smith.jpg
 *             firstName: Jane
 *             lastName: Smith
 *             specialization: Full Stack Web Development
 *             bio: Experienced educator with 10+ years in web development
 *             city: Tashkent
 *             country: Uzbekistan
 *             email: jane.smith@example.com
 *             phone: "+998901234567"
 *             telegram_username: https://t.me/john_teacher
 *             paymentMethods:
 *               click: "123456789"
 *               payme: "987654321"
 *               uzum: "555444333"
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
 *                   example: Teacher profile updated successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad Request - Validation error, invalid ID format, or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Validation failed
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       field:
 *                         type: string
 *                       message:
 *                         type: string
 *             examples:
 *               invalidId:
 *                 summary: Invalid ID format
 *                 value:
 *                   success: false
 *                   message: Invalid teacher ID format
 *               invalidCertificates:
 *                 summary: Invalid certificates format
 *                 value:
 *                   success: false
 *                   message: Certificates must be an array
 *               invalidPaymentMethods:
 *                 summary: Invalid payment methods format
 *                 value:
 *                   success: false
 *                   message: Payment methods must be an object
 *               validationError:
 *                 summary: Field validation errors
 *                 value:
 *                   success: false
 *                   message: Validation failed
 *                   errors:
 *                     - field: firstName
 *                       message: First name must be at least 2 characters
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
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Teacher not found
 *       409:
 *         description: Conflict - Email or phone already in use by another user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *             examples:
 *               emailInUse:
 *                 summary: Email already exists
 *                 value:
 *                   success: false
 *                   message: This email is already in use by another user
 *               phoneInUse:
 *                 summary: Phone already exists
 *                 value:
 *                   success: false
 *                   message: This phone number is already in use by another user
 *       500:
 *         description: Internal Server Error - An unexpected error occurred
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: An error occurred while updating teacher profile
 *                 error:
 *                   type: string
 */
teacherRouter.patch("/:id", authenticate, isOwnerOrAdmin, update);

export default teacherRouter;
