import { Router } from "express";
import { createTeacherProfile, findAll, findOne, update, getDashboardStats, getLandingPageData, updateLandingPageSettings, publishLandingPage, getTeacherStudents, getQuizAnalytics, getAllTeachersForModerator, getTeacherDetailsForModerator } from "../controllers/teacher.controller.js";
import {
  authenticate,
  isOwnerOrAdmin,
} from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createTeacherProfileSchema,
  teacherIdSchema,
  teacherIdParamSchema,
  updateTeacherProfileSchema,
} from "../validations/teacher.validation.js";

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
 *     CreateTeacherProfileInput:
 *       type: object
 *       required:
 *         - specialization
 *       properties:
 *         profileImage:
 *           type: string
 *           description: Profile image URL
 *         specialization:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *           description: Teacher's subject or field specialization (required)
 *         bio:
 *           type: string
 *           minLength: 10
 *           maxLength: 1000
 *           description: Teacher biography or introduction
 *         city:
 *           type: string
 *           description: Teacher's city
 *         country:
 *           type: string
 *           description: Teacher's country
 */

/**
 * @swagger
 * /teachers/create-profile:
 *   post:
 *     summary: Create teacher profile
 *     description: Create a new teacher profile for the authenticated user. User must have teacher role and not have an existing profile.
 *     tags: [User Management - Teachers]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTeacherProfileInput'
 *           example:
 *             profileImage: https://example.com/images/teacher.jpg
 *             specialization: Mathematics and Physics
 *             bio: Experienced mathematics teacher with 10+ years of teaching experience
 *             city: Tashkent
 *             country: Uzbekistan
 *     responses:
 *       201:
 *         description: Teacher profile created successfully
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
 *                   example: Teacher profile created successfully
 *                 teacher:
 *                   $ref: '#/components/schemas/Teacher'
 *       400:
 *         description: Bad Request - Validation error or user is not a teacher
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
 *                   example: Only teachers can create teacher profiles
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Conflict - Teacher profile already exists
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
 *                   example: Teacher profile already exists for this user
 */
teacherRouter.post(
  "/create-profile",
  authenticate,
  validate(createTeacherProfileSchema),
  createTeacherProfile
);

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
teacherRouter.get(
  "/:id",
  validate(teacherIdSchema, "params"),
  findOne
);

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
teacherRouter.patch(
  "/:id",
  validate(teacherIdSchema, "params"),
  validate(updateTeacherProfileSchema),
  authenticate,
  isOwnerOrAdmin,
  update
);

/**
 * @swagger
 * /teachers/{id}/dashboard:
 *   get:
 *     summary: Get teacher dashboard statistics
 *     description: Retrieve comprehensive dashboard statistics for a teacher including course metrics, earnings, and recent activity
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
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     overview:
 *                       type: object
 *                       properties:
 *                         totalCourses:
 *                           type: number
 *                           example: 15
 *                         totalStudents:
 *                           type: number
 *                           example: 342
 *                         totalRevenue:
 *                           type: number
 *                           example: 25600.50
 *                         averageRating:
 *                           type: number
 *                           example: 4.7
 *                         activeCourses:
 *                           type: number
 *                           example: 12
 *                         draftCourses:
 *                           type: number
 *                           example: 3
 *                         currentBalance:
 *                           type: number
 *                           example: 3420.75
 *                     growth:
 *                       type: object
 *                       properties:
 *                         revenueGrowth:
 *                           type: number
 *                           example: 12.5
 *                         enrollmentGrowth:
 *                           type: number
 *                           example: 8.3
 *                         ratingTrend:
 *                           type: number
 *                           example: 0.2
 *                     recentCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                           description:
 *                             type: string
 *                           price:
 *                             type: number
 *                           enrollmentCount:
 *                             type: number
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                     monthlyEarnings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           month:
 *                             type: string
 *                             example: "2024-11"
 *                           earnings:
 *                             type: number
 *                             example: 4500.25
 *                           enrollments:
 *                             type: number
 *                             example: 45
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         _id:
 *                           type: string
 *                         firstName:
 *                           type: string
 *                         lastName:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                         specialization:
 *                           type: string
 *                         reviewsCount:
 *                           type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Cannot access other teacher's dashboard
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
teacherRouter.get(
  "/:id/dashboard",
  validate(teacherIdSchema, "params"),
  authenticate,
  isOwnerOrAdmin,
  getDashboardStats
);

/**
 * @swagger
 * /teachers/{id}/landing-page:
 *   get:
 *     summary: Get teacher's public landing page data
 *     description: Retrieve teacher's landing page information for public display
 *     tags: [User Management - Teachers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Landing page data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                     featuredCourses:
 *                       type: array
 *                     featuredTestimonials:
 *                       type: array
 *                     themeColor:
 *                       type: string
 *       404:
 *         description: Teacher not found or landing page not published
 */
teacherRouter.get(
  "/:id/landing-page",
  validate(teacherIdSchema, "params"),
  getLandingPageData
);

/**
 * @swagger
 * /teachers/{id}/landing-page:
 *   put:
 *     summary: Update teacher's landing page settings
 *     description: Update landing page configuration and content
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
 *             type: object
 *             properties:
 *               featuredCourses:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 6
 *               featuredTestimonials:
 *                 type: array
 *                 items:
 *                   type: string
 *                 maxItems: 5
 *               themeColor:
 *                 type: string
 *                 pattern: '^#[0-9A-Fa-f]{6}$'
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   linkedin:
 *                     type: string
 *                   github:
 *                     type: string
 *                   website:
 *                     type: string
 *                   telegram:
 *                     type: string
 *     responses:
 *       200:
 *         description: Landing page settings updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot update other user's landing page
 *       404:
 *         description: Teacher not found
 */
teacherRouter.put(
  "/:id/landing-page",
  validate(teacherIdSchema, "params"),
  authenticate,
  isOwnerOrAdmin,
  updateLandingPageSettings
);

/**
 * @swagger
 * /teachers/{id}/landing-page/publish:
 *   post:
 *     summary: Publish or unpublish teacher's landing page
 *     description: Toggle the published status of teacher's landing page
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
 *             type: object
 *             properties:
 *               isPublished:
 *                 type: boolean
 *                 description: Whether to publish or unpublish the landing page
 *     responses:
 *       200:
 *         description: Landing page publish status updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Teacher not found
 */
teacherRouter.post(
  "/:id/landing-page/publish",
  validate(teacherIdSchema, "params"),
  authenticate,
  isOwnerOrAdmin,
  publishLandingPage
);

/**
 * @swagger
 * /teachers/{id}/students:
 *   get:
 *     summary: Get students registered through teacher's landing page
 *     description: Retrieve all students who registered through the specific teacher's landing page
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
 *         description: Students retrieved successfully
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
 *                   example: Students retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     teacher:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                     students:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           uniqueId:
 *                             type: string
 *                             description: 5-digit unique identifier
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           fullName:
 *                             type: string
 *                           phone:
 *                             type: string
 *                           registrationDate:
 *                             type: string
 *                             format: date-time
 *                           studentId:
 *                             type: string
 *                     totalStudents:
 *                       type: number
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Cannot access other teacher's students
 *       404:
 *         description: Teacher not found
 */
teacherRouter.get(
  "/:id/students",
  validate(teacherIdSchema, "params"),
  authenticate,
  isOwnerOrAdmin,
  getTeacherStudents
);

/**
 * @swagger
 * /teachers/{teacherId}/quiz-analytics:
 *   get:
 *     summary: Get quiz analytics for teacher's courses
 *     description: Retrieve quiz results and analytics for all students in teacher's courses. Shows only the latest attempt for each student per quiz.
 *     tags: [User Management - Teachers]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by specific course ID (optional)
 *       - in: query
 *         name: lessonId
 *         schema:
 *           type: string
 *         description: Filter by specific lesson ID (optional)
 *     responses:
 *       200:
 *         description: Quiz analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           title:
 *                             type: string
 *                     analytics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           studentId:
 *                             type: string
 *                           studentName:
 *                             type: string
 *                           courseId:
 *                             type: string
 *                           lessonId:
 *                             type: string
 *                           attemptNumber:
 *                             type: number
 *                           score:
 *                             type: number
 *                           totalQuestions:
 *                             type: number
 *                           correctAnswers:
 *                             type: number
 *                           passed:
 *                             type: boolean
 *                           timeElapsed:
 *                             type: number
 *                           date:
 *                             type: string
 *                             format: date-time
 *                     summary:
 *                       type: object
 *                       properties:
 *                         totalAttempts:
 *                           type: number
 *                         uniqueStudents:
 *                           type: number
 *                         averageScore:
 *                           type: number
 *                         passRate:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Teacher not found
 */
teacherRouter.get(
  "/:teacherId/quiz-analytics",
  validate(teacherIdParamSchema, "params"),
  getQuizAnalytics
);

/**
 * @swagger
 * /teachers/moderator/all:
 *   get:
 *     summary: Get all teachers for moderator panel
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Teachers fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Teacher'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Moderator access required
 */
teacherRouter.get("/moderator/all", authenticate, getAllTeachersForModerator);

/**
 * @swagger
 * /teachers/moderator/{id}/details:
 *   get:
 *     summary: Get detailed teacher information for moderator
 *     tags: [Teachers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *     responses:
 *       200:
 *         description: Teacher details fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Teacher'
 *       404:
 *         description: Teacher not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin/Moderator access required
 */
teacherRouter.get("/moderator/:id/details", authenticate, getTeacherDetailsForModerator);

export default teacherRouter;
