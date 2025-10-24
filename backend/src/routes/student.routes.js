import { Router } from "express";
import {
  findAll,
  findOne,
  update,
  remove,
} from "../controllers/student.controller.js";
import { authenticate, authorize } from "../middlewares/auth.middleware.js";

const studentRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Student:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Student ID
 *         firstName:
 *           type: string
 *           description: Student's first name
 *         lastName:
 *           type: string
 *           description: Student's last name
 *         email:
 *           type: string
 *           description: Student's email address
 *         phone:
 *           type: string
 *           description: Student's phone number
 *         role:
 *           type: string
 *           enum: [student]
 *           description: User role
 *         status:
 *           type: string
 *           enum: [pending, active, inactive, blocked]
 *           description: Account status
 *         bio:
 *           type: string
 *           description: Student biography
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           description: Student's interests
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: Date of birth
 *         enrolledCourses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *           description: Currently enrolled courses
 *         completedCourses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 *           description: Completed courses
 *         points:
 *           type: number
 *           description: Gamification points
 *         level:
 *           type: number
 *           description: Student level
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     Course:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         category:
 *           type: string
 *         level:
 *           type: string
 *         coursePrice:
 *           type: number
 *         courseType:
 *           type: string
 *           enum: [free, paid]
 *     UpdateStudentInput:
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
 *         profileImage:
 *           type: string
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *         error:
 *           type: string
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *               message:
 *                 type: string
 */

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students with their enrolled courses
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of students retrieved successfully
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
 *                   example: 10
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Student'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentRouter.get("/", authenticate, authorize("teacher"), findAll);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information about a specific student
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad Request - Invalid student ID format
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
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentRouter.get("/:id", authenticate, findOne);

/**
 * @swagger
 * /students/{id}:
 *   put:
 *     summary: Update student profile
 *     description: Update student's personal information and profile settings
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateStudentInput'
 *           example:
 *             firstName: John
 *             lastName: Doe
 *             bio: Passionate learner interested in programming
 *             interests: ["JavaScript", "Python", "Web Development"]
 *             dateOfBirth: "2000-01-15"
 *     responses:
 *       200:
 *         description: Student profile updated successfully
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
 *                   example: Student updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/Student'
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
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentRouter.put("/:id", authenticate, update);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Deactivate student account
 *     description: Soft delete - Sets student status to 'inactive'
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *     responses:
 *       200:
 *         description: Student account deactivated successfully
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
 *                   example: Student removed successfully
 *                 data:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad Request - Invalid student ID format
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
 *         description: Student not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
studentRouter.delete("/:id", authenticate, remove);

export default studentRouter;
