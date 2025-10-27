import { Router } from "express";
import {
  create,
  findAll,
  findOne,
  findByCourse,
  remove,
  update,
} from "../controllers/module.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createModuleSchema,
  updateModuleSchema,
  moduleIdSchema,
  getModulesByCourseSchema,
} from "../validations/module.validation.js";

const moduleRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Module:
 *       type: object
 *       required:
 *         - courseId
 *         - title
 *         - durationMinutes
 *       properties:
 *         _id:
 *           type: string
 *           description: Module ID (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         courseId:
 *           type: string
 *           description: Course ID this module belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Module title
 *           example: "Introduction to JavaScript"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Module description
 *           example: "Learn the fundamentals of JavaScript programming"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of module in the course
 *           example: 1
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of module in minutes
 *           example: 120
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when module was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when module was last updated
 *
 *     ModuleInput:
 *       type: object
 *       required:
 *         - courseId
 *         - title
 *         - durationMinutes
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course ID this module belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Module title
 *           example: "Introduction to JavaScript"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Module description
 *           example: "Learn the fundamentals of JavaScript programming"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of module in the course
 *           example: 1
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of module in minutes
 *           example: 120
 *
 *     ModuleUpdate:
 *       type: object
 *       minProperties: 1
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course ID this module belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Module title
 *           example: "Advanced JavaScript Concepts"
 *         description:
 *           type: string
 *           maxLength: 1000
 *           description: Module description
 *           example: "Deep dive into advanced JavaScript topics"
 *         order:
 *           type: number
 *           minimum: 0
 *           description: Order of module in the course
 *           example: 2
 *         durationMinutes:
 *           type: number
 *           minimum: 0
 *           description: Duration of module in minutes
 *           example: 150
 *
 *     ModuleSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Module created successfully"
 *         module:
 *           $ref: '#/components/schemas/Module'
 *
 *     ModulesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         modules:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Module'
 *
 *     ModuleErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred while creating module"
 *         error:
 *           type: string
 *           example: "Validation error message"
 */

/**
 * @swagger
 * /modules:
 *   post:
 *     summary: Create a new module
 *     tags: [Module & Lesson Management - Modules]
 *     description: Creates a new module for a course. Requires valid courseId and module details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuleInput'
 *           examples:
 *             basicModule:
 *               summary: Basic module
 *               value:
 *                 courseId: "507f1f77bcf86cd799439012"
 *                 title: "Introduction to JavaScript"
 *                 description: "Learn the fundamentals of JavaScript programming"
 *                 order: 1
 *                 durationMinutes: 120
 *             minimalModule:
 *               summary: Minimal module (required fields only)
 *               value:
 *                 courseId: "507f1f77bcf86cd799439012"
 *                 title: "JavaScript Basics"
 *                 durationMinutes: 90
 *     responses:
 *       200:
 *         description: Module created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Module created successfully"
 *                   module:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId: "507f1f77bcf86cd799439012"
 *                     title: "Introduction to JavaScript"
 *                     description: "Learn the fundamentals of JavaScript programming"
 *                     order: 1
 *                     durationMinutes: 120
 *                     createdAt: "2025-10-26T10:30:00.000Z"
 *                     updatedAt: "2025-10-26T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid courseId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               invalidCourseId:
 *                 value:
 *                   success: false
 *                   message: "Invalid student ID format"
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while creating modules"
 *                   error: "Validation error details"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               courseNotFound:
 *                 value:
 *                   success: false
 *                   message: "Course with this ID is not available"
 */
moduleRouter.post("/", validate(createModuleSchema), create);

/**
 * @swagger
 * /modules:
 *   get:
 *     summary: Get all modules
 *     tags: [Module & Lesson Management - Modules]
 *     description: Retrieves a list of all modules in the system
 *     responses:
 *       200:
 *         description: Successfully retrieved modules list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModulesListResponse'
 *             examples:
 *               multipleModules:
 *                 value:
 *                   success: true
 *                   modules:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       courseId: "507f1f77bcf86cd799439012"
 *                       title: "Introduction to JavaScript"
 *                       description: "Learn the fundamentals of JavaScript"
 *                       order: 1
 *                       durationMinutes: 120
 *                       createdAt: "2025-10-26T10:30:00.000Z"
 *                       updatedAt: "2025-10-26T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       courseId: "507f1f77bcf86cd799439012"
 *                       title: "Advanced JavaScript"
 *                       description: "Deep dive into advanced topics"
 *                       order: 2
 *                       durationMinutes: 180
 *                       createdAt: "2025-10-26T11:00:00.000Z"
 *                       updatedAt: "2025-10-26T11:00:00.000Z"
 *               emptyList:
 *                 value:
 *                   success: true
 *                   modules: []
 *       400:
 *         description: Error occurred while fetching modules
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while finding all modules"
 *                   error: "Database error details"
 */
moduleRouter.get("/", findAll);

/**
 * @swagger
 * /modules/course/{courseId}:
 *   get:
 *     summary: Get all modules by course ID
 *     tags: [Module & Lesson Management - Modules]
 *     description: Retrieves all modules belonging to a specific course, sorted by order
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Course ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Successfully retrieved modules for the course
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
 *                   example: "Modules retrieved successfully"
 *                 count:
 *                   type: number
 *                   example: 5
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Module'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Modules retrieved successfully"
 *                   count: 2
 *                   data:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       courseId: "507f1f77bcf86cd799439012"
 *                       title: "Introduction to JavaScript"
 *                       description: "Learn the fundamentals of JavaScript"
 *                       order: 1
 *                       durationMinutes: 120
 *                       createdAt: "2025-10-26T10:30:00.000Z"
 *                       updatedAt: "2025-10-26T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439013"
 *                       courseId: "507f1f77bcf86cd799439012"
 *                       title: "Advanced JavaScript"
 *                       description: "Deep dive into advanced topics"
 *                       order: 2
 *                       durationMinutes: 180
 *                       createdAt: "2025-10-26T11:00:00.000Z"
 *                       updatedAt: "2025-10-26T11:00:00.000Z"
 *               emptyCourse:
 *                 value:
 *                   success: true
 *                   message: "Modules retrieved successfully"
 *                   count: 0
 *                   data: []
 *       400:
 *         description: Invalid course ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid course ID format"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Course not found"
 */
moduleRouter.get(
  "/course/:courseId",
  validate(getModulesByCourseSchema, "params"),
  findByCourse
);

/**
 * @swagger
 * /modules/{id}:
 *   get:
 *     summary: Get a single module by ID
 *     tags: [Module & Lesson Management - Modules]
 *     description: Retrieves detailed information about a specific module
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Module ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved module
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Module found successfully"
 *                   module:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId: "507f1f77bcf86cd799439012"
 *                     title: "Introduction to JavaScript"
 *                     description: "Learn the fundamentals of JavaScript programming"
 *                     order: 1
 *                     durationMinutes: 120
 *                     createdAt: "2025-10-26T10:30:00.000Z"
 *                     updatedAt: "2025-10-26T10:30:00.000Z"
 *       400:
 *         description: Invalid module ID format or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while finding only one module"
 *                   error: "Error details"
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Module not found"
 */
moduleRouter.get("/:id", validate(moduleIdSchema, "params"), findOne);

/**
 * @swagger
 * /modules/{id}:
 *   patch:
 *     summary: Update a module
 *     tags: [Module & Lesson Management - Modules]
 *     description: Updates an existing module. At least one field must be provided for update.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Module ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ModuleUpdate'
 *           examples:
 *             updateTitle:
 *               summary: Update title only
 *               value:
 *                 title: "Advanced JavaScript Concepts"
 *             updateMultipleFields:
 *               summary: Update multiple fields
 *               value:
 *                 title: "Complete JavaScript Guide"
 *                 description: "Comprehensive guide from basics to advanced"
 *                 order: 3
 *                 durationMinutes: 200
 *             updateOrder:
 *               summary: Update order only
 *               value:
 *                 order: 5
 *     responses:
 *       200:
 *         description: Module updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Module updated successfully"
 *                   module:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId: "507f1f77bcf86cd799439012"
 *                     title: "Advanced JavaScript Concepts"
 *                     description: "Deep dive into advanced JavaScript topics"
 *                     order: 3
 *                     durationMinutes: 200
 *                     createdAt: "2025-10-26T10:30:00.000Z"
 *                     updatedAt: "2025-10-26T14:30:00.000Z"
 *       400:
 *         description: Validation error or invalid module ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while updating modules"
 *                   error: "At least one field must be provided for update"
 *               invalidId:
 *                 value:
 *                   success: false
 *                   message: "Invalid module ID format"
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Module not found"
 */
moduleRouter.patch(
  "/:id",
  validate(moduleIdSchema, "params"),
  validate(updateModuleSchema),
  update
);

/**
 * @swagger
 * /modules/{id}:
 *   delete:
 *     summary: Delete a module
 *     tags: [Module & Lesson Management - Modules]
 *     description: Permanently deletes a module from the system
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Module ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Module deleted successfully
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
 *                   example: "Module deleted successfully"
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Module deleted successfully"
 *       400:
 *         description: Invalid module ID format or error occurred
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while deleting modules"
 *                   error: "Error details"
 *       404:
 *         description: Module not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ModuleErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Module not found"
 */
moduleRouter.delete("/:id", validate(moduleIdSchema, "params"), remove);

export default moduleRouter;
