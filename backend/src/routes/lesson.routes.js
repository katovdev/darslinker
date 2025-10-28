import { Router } from "express";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createLessonSchema,
  lessonIdSchema,
  getLessonsByModuleSchema,
  updateLessonSchema,
} from "../validations/lesson.validation.js";
import {
  create,
  findAll,
  findByModule,
  findOne,
  remove,
  update,
} from "../controllers/lesson.controller.js";

const lessonRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Lesson:
 *       type: object
 *       required:
 *         - moduleId
 *         - title
 *         - durationMinutes
 *       properties:
 *         _id:
 *           type: string
 *           description: Lesson ID (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         moduleId:
 *           type: string
 *           description: Module ID this lesson belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Lesson title
 *           example: "Variables and Data Types"
 *         content:
 *           type: string
 *           maxLength: 10000
 *           description: Lesson content/description
 *           example: "In this lesson, we will learn about JavaScript variables..."
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL to lesson video
 *           example: "https://cloudinary.com/videos/lesson-123.mp4"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of lesson in the module
 *           example: 1
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of lesson in minutes
 *           example: 45
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when lesson was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when lesson was last updated
 *
 *     LessonInput:
 *       type: object
 *       required:
 *         - moduleId
 *         - title
 *         - durationMinutes
 *       properties:
 *         moduleId:
 *           type: string
 *           description: Module ID this lesson belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Lesson title
 *           example: "Variables and Data Types"
 *         content:
 *           type: string
 *           maxLength: 10000
 *           description: Lesson content/description
 *           example: "In this lesson, we will learn about JavaScript variables, including var, let, and const..."
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL to lesson video
 *           example: "https://cloudinary.com/videos/lesson-123.mp4"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of lesson in the module
 *           example: 1
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of lesson in minutes
 *           example: 45
 *
 *     LessonUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Lesson title
 *           example: "Advanced Variables and Scoping"
 *         content:
 *           type: string
 *           maxLength: 10000
 *           description: Lesson content/description
 *           example: "Updated lesson content with more detailed explanations..."
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL to lesson video
 *           example: "https://cloudinary.com/videos/lesson-updated.mp4"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of lesson in the module
 *           example: 2
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of lesson in minutes
 *           example: 60
 *
 *     LessonSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Lesson created successfully"
 *         lesson:
 *           $ref: '#/components/schemas/Lesson'
 *
 *     LessonsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *           example: 15
 *         page:
 *           type: number
 *           example: 1
 *         totalPages:
 *           type: number
 *           example: 2
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *
 *     LessonsByModuleResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *           example: 8
 *         lessons:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Lesson'
 *
 *     LessonErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred while creating lesson"
 *         error:
 *           type: string
 *           example: "Validation error message"
 */

/**
 * @swagger
 * /lessons:
 *   post:
 *     summary: Create a new lesson
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Creates a new lesson for a module. Requires valid moduleId and lesson details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonInput'
 *           examples:
 *             fullLesson:
 *               summary: Complete lesson with all fields
 *               value:
 *                 moduleId: "507f1f77bcf86cd799439012"
 *                 title: "Variables and Data Types"
 *                 content: "In this lesson, we will learn about JavaScript variables, including var, let, and const. We'll explore different data types and when to use each variable declaration."
 *                 videoUrl: "https://cloudinary.com/videos/js-variables.mp4"
 *                 order: 1
 *                 durationMinutes: 45
 *             minimalLesson:
 *               summary: Minimal lesson (required fields only)
 *               value:
 *                 moduleId: "507f1f77bcf86cd799439012"
 *                 title: "Introduction to JavaScript"
 *                 durationMinutes: 30
 *     responses:
 *       200:
 *         description: Lesson created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Lesson created successfully"
 *                   lesson:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     moduleId: "507f1f77bcf86cd799439012"
 *                     title: "Variables and Data Types"
 *                     content: "In this lesson, we will learn about JavaScript variables..."
 *                     videoUrl: "https://cloudinary.com/videos/js-variables.mp4"
 *                     order: 1
 *                     durationMinutes: 45
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid moduleId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               invalidModuleId:
 *                 value:
 *                   success: false
 *                   message: "Invalid module ID format"
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while creating lessons"
 *                   error: "Validation error details"
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               moduleNotFound:
 *                 value:
 *                   success: false
 *                   message: "Module not found"
 */
lessonRouter.post("/", validate(createLessonSchema), create);

/**
 * @swagger
 * /lessons:
 *   get:
 *     summary: Get all lessons with filtering and pagination
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Retrieves a paginated list of all lessons with optional filtering by moduleId and search
 *     parameters:
 *       - in: query
 *         name: moduleId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter lessons by module ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in lesson title and content
 *         example: "JavaScript"
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [order, title, durationMinutes, createdAt]
 *           default: "order"
 *         description: Field to sort by
 *         example: "order"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "asc"
 *         description: Sort order (ascending or descending)
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Successfully retrieved lessons list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonsListResponse'
 *             examples:
 *               withPagination:
 *                 summary: Paginated lessons list
 *                 value:
 *                   success: true
 *                   count: 15
 *                   page: 1
 *                   totalPages: 2
 *                   lessons:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       moduleId: "507f1f77bcf86cd799439012"
 *                       title: "Variables and Data Types"
 *                       content: "Learn about variables..."
 *                       videoUrl: "https://cloudinary.com/videos/lesson1.mp4"
 *                       order: 1
 *                       durationMinutes: 45
 *                       createdAt: "2025-10-28T10:30:00.000Z"
 *                       updatedAt: "2025-10-28T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       moduleId: "507f1f77bcf86cd799439012"
 *                       title: "Functions in JavaScript"
 *                       content: "Learn about functions..."
 *                       videoUrl: "https://cloudinary.com/videos/lesson2.mp4"
 *                       order: 2
 *                       durationMinutes: 50
 *                       createdAt: "2025-10-28T11:00:00.000Z"
 *                       updatedAt: "2025-10-28T11:00:00.000Z"
 *               filteredByModule:
 *                 summary: Filtered by moduleId
 *                 value:
 *                   success: true
 *                   count: 5
 *                   page: 1
 *                   totalPages: 1
 *                   lessons:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       moduleId: "507f1f77bcf86cd799439012"
 *                       title: "Variables and Data Types"
 *                       order: 1
 *                       durationMinutes: 45
 *               emptyList:
 *                 summary: No lessons found
 *                 value:
 *                   success: true
 *                   count: 0
 *                   page: 1
 *                   totalPages: 0
 *                   lessons: []
 *       400:
 *         description: Validation error or invalid moduleId format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               invalidModuleId:
 *                 value:
 *                   success: false
 *                   message: "Invalid module ID format"
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while finding all lessons"
 *                   error: "Database error details"
 */
lessonRouter.get("/", findAll);

/**
 * @swagger
 * /lessons/module/{moduleId}:
 *   get:
 *     summary: Get all lessons by module ID
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Retrieves all lessons belonging to a specific module, sorted by order
 *     parameters:
 *       - in: path
 *         name: moduleId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Module ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Successfully retrieved lessons for the module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonsByModuleResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   count: 8
 *                   lessons:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       moduleId: "507f1f77bcf86cd799439012"
 *                       title: "Variables and Data Types"
 *                       content: "Learn about variables..."
 *                       videoUrl: "https://cloudinary.com/videos/lesson1.mp4"
 *                       order: 1
 *                       durationMinutes: 45
 *                       createdAt: "2025-10-28T10:30:00.000Z"
 *                       updatedAt: "2025-10-28T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       moduleId: "507f1f77bcf86cd799439012"
 *                       title: "Functions in JavaScript"
 *                       content: "Learn about functions..."
 *                       videoUrl: "https://cloudinary.com/videos/lesson2.mp4"
 *                       order: 2
 *                       durationMinutes: 50
 *                       createdAt: "2025-10-28T11:00:00.000Z"
 *                       updatedAt: "2025-10-28T11:00:00.000Z"
 *               emptyModule:
 *                 value:
 *                   success: true
 *                   count: 0
 *                   lessons: []
 *       400:
 *         description: Invalid module ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid module ID format"
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Module not found"
 */
lessonRouter.get(
  "/module/:moduleId",
  validate(getLessonsByModuleSchema, "params"),
  findByModule
);

/**
 * @swagger
 * /lessons/{id}:
 *   get:
 *     summary: Get a single lesson by ID
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Retrieves detailed information about a specific lesson with populated module data
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Lesson ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved lesson
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 lesson:
 *                   $ref: '#/components/schemas/Lesson'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   lesson:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     moduleId:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       courseId: "507f1f77bcf86cd799439013"
 *                       title: "Introduction to JavaScript"
 *                       description: "Learn JavaScript basics"
 *                       order: 1
 *                       durationMinutes: 240
 *                     title: "Variables and Data Types"
 *                     content: "In this lesson, we will learn about JavaScript variables..."
 *                     videoUrl: "https://cloudinary.com/videos/lesson1.mp4"
 *                     order: 1
 *                     durationMinutes: 45
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T10:30:00.000Z"
 *       400:
 *         description: Invalid lesson ID format or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid lesson ID format"
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while finding lesson"
 *                   error: "Error details"
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Lesson not found"
 */
lessonRouter.get("/:id", validate(lessonIdSchema, "params"), findOne);

/**
 * @swagger
 * /lessons/{id}:
 *   patch:
 *     summary: Update a lesson
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Updates an existing lesson. At least one field must be provided for update. Prevents duplicate lesson titles within the same module.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Lesson ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonUpdate'
 *           examples:
 *             updateTitle:
 *               summary: Update title only
 *               value:
 *                 title: "Advanced Variables and Scoping"
 *             updateContent:
 *               summary: Update content and video
 *               value:
 *                 content: "Updated lesson with more detailed explanations and examples..."
 *                 videoUrl: "https://cloudinary.com/videos/lesson-updated.mp4"
 *             updateMultipleFields:
 *               summary: Update multiple fields
 *               value:
 *                 title: "Complete Guide to JavaScript Variables"
 *                 content: "Comprehensive guide covering all variable types..."
 *                 order: 3
 *                 durationMinutes: 60
 *             updateOrder:
 *               summary: Update order and duration
 *               value:
 *                 order: 5
 *                 durationMinutes: 75
 *     responses:
 *       200:
 *         description: Lesson updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Lesson updated successfully"
 *                   lesson:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     moduleId:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       title: "Introduction to JavaScript"
 *                     title: "Advanced Variables and Scoping"
 *                     content: "Updated lesson with more detailed explanations..."
 *                     videoUrl: "https://cloudinary.com/videos/lesson-updated.mp4"
 *                     order: 3
 *                     durationMinutes: 60
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T15:45:00.000Z"
 *       400:
 *         description: Validation error or invalid lesson ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while updating lesson"
 *                   error: "At least one field must be provided for update"
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid lesson ID format"
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Lesson not found"
 *       409:
 *         description: Duplicate lesson title in the same module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               duplicate:
 *                 value:
 *                   success: false
 *                   message: "A lesson with this title already exists in this module"
 */
lessonRouter.patch(
  "/:id",
  validate(lessonIdSchema, "params"),
  validate(updateLessonSchema),
  update
);

/**
 * @swagger
 * /lessons/{id}:
 *   delete:
 *     summary: Delete a lesson
 *     tags: [Module & Lesson Management - Lessons]
 *     description: Permanently deletes a lesson from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Lesson ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Lesson deleted successfully
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
 *                   example: "Lesson deleted successfully"
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Lesson deleted successfully"
 *       400:
 *         description: Invalid lesson ID format or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid lesson ID format"
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while deleting lesson"
 *                   error: "Error details"
 *       404:
 *         description: Lesson not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LessonErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Lesson not found"
 */
lessonRouter.delete("/:id", validate(lessonIdSchema, "params"), remove);

export default lessonRouter;
