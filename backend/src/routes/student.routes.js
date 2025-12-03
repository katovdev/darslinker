import { Router } from "express";
import {
  createStudentProfile,
  findAll,
  findOne,
  update,
  remove,
  saveQuizResult,
} from "../controllers/student.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createStudentProfileSchema,
  studentIdSchema,
  updateStudentProfileSchema,
} from "../validations/student.validation.js";

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
 *         profileImage:
 *           type: string
 *         firstName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         lastName:
 *           type: string
 *           minLength: 2
 *           maxLength: 50
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         dateOfBirth:
 *           type: string
 *           format: date
 *         bio:
 *           type: string
 *         interests:
 *           type: array
 *           items:
 *             type: string
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
 *     CreateStudentProfileInput:
 *       type: object
 *       properties:
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         bio:
 *           type: string
 *           minLength: 10
 *           maxLength: 500
 *           description: Student biography or introduction
 *         interests:
 *           type: array
 *           items:
 *             type: string
 *           maxItems: 10
 *           description: Student's interests (max 10)
 */

/**
 * @swagger
 * /students/create-profile:
 *   post:
 *     summary: Create student profile
 *     description: Create a new student profile for the authenticated user. User must have student role and not have an existing profile.
 *     tags: [User Management - Students]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateStudentProfileInput'
 *           example:
 *             profileImage: https://example.com/images/student.jpg
 *             bio: Passionate learner interested in programming and web development
 *             interests: ["JavaScript", "Python", "Web Development", "Machine Learning"]
 *     responses:
 *       201:
 *         description: Student profile created successfully
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
 *                   example: Student profile created successfully
 *                 student:
 *                   $ref: '#/components/schemas/Student'
 *       400:
 *         description: Bad Request - Validation error or user is not a student
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
 *                   example: Only students can create student profiles
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Student profile already exists
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
 *                   example: Student profile already exists for this user
 */
studentRouter.post(
  "/create-profile",
  authenticate,
  validate(createStudentProfileSchema),
  createStudentProfile
);

/**
 * @swagger
 * /students:
 *   get:
 *     summary: Get all students
 *     description: Retrieve a list of all students with their enrolled courses
 *     tags: [User Management - Students]
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
studentRouter.get("/", authenticate, findAll);

/**
 * @swagger
 * /students/{id}:
 *   get:
 *     summary: Get student by ID
 *     description: Retrieve detailed information about a specific student
 *     tags: [User Management - Students]
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
studentRouter.get(
  "/:id",
  validate(studentIdSchema, "params"),
  authenticate,
  findOne
);

/**
 * @swagger
 * /students/{id}:
 *   patch:
 *     summary: Update student profile
 *     description: Update student's personal information and profile settings
 *     tags: [User Management - Students]
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
 *             profileImage: https://example.com/images/jane-smith.jpg
 *             firstName: John
 *             lastName: Doe
 *             email: john.doe@example.com
 *             phone: +998907654321
 *             dateOfBirth: "2000-01-15"
 *             bio: Passionate learner interested in programming
 *             interests: ["JavaScript", "Python", "Web Development"]
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
studentRouter.patch(
  "/:id",
  validate(studentIdSchema, "params"),
  validate(updateStudentProfileSchema),
  authenticate,
  update
);

/**
 * @swagger
 * /students/{id}:
 *   delete:
 *     summary: Delete student account
 *     description: Delete - student account
 *     tags: [User Management - Students]
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
 *         description: Student account deleted successfully
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
studentRouter.delete(
  "/:id",
  validate(studentIdSchema, "params"),
  authenticate,
  remove
);

/**
 * @swagger
 * /students/{id}/quiz-result:
 *   post:
 *     summary: Save quiz result for student
 *     tags: [Students]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               lessonId:
 *                 type: string
 *               courseId:
 *                 type: string
 *               attemptNumber:
 *                 type: number
 *               score:
 *                 type: number
 *               totalQuestions:
 *                 type: number
 *               correctAnswers:
 *                 type: number
 *               passed:
 *                 type: boolean
 *               answers:
 *                 type: array
 *               timeElapsed:
 *                 type: number
 *     responses:
 *       200:
 *         description: Quiz result saved successfully
 */
// Public endpoint - no authentication required for quiz results
studentRouter.post("/:id/quiz-result", saveQuizResult);

export default studentRouter;
