import { Router } from "express";
import {
  create,
  findAll,
  gradeAssignment,
  submitAssignment,
} from "../controllers/assignment.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  createAssignmentSchema,
  assignmentQuerySchema,
  assignmentIdSchema,
  submitAssignmentSchema,
  gradeAssignmentSchema,
} from "../validations/assignment.validation.js";

const assignmentRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Assignment:
 *       type: object
 *       required:
 *         - courseId
 *         - title
 *         - dueDate
 *         - createdBy
 *         - maxGrade
 *       properties:
 *         _id:
 *           type: string
 *           description: Assignment ID (MongoDB ObjectId)
 *           example: "507f1f77bcf86cd799439011"
 *         courseId:
 *           type: string
 *           description: Course ID this assignment belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Assignment title
 *           example: "JavaScript Functions Homework"
 *         description:
 *           type: string
 *           description: Assignment description/instructions
 *           example: "Complete exercises on JavaScript functions including arrow functions, callbacks, and closures"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Assignment due date
 *           example: "2025-11-15T23:59:59.000Z"
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Array of resource URLs (documents, videos, etc.)
 *           example: ["https://example.com/resource1.pdf", "https://example.com/video1.mp4"]
 *         createdBy:
 *           type: string
 *           description: Teacher ID who created the assignment
 *           example: "507f1f77bcf86cd799439013"
 *         maxGrade:
 *           type: number
 *           minimum: 0
 *           description: Maximum grade for this assignment
 *           example: 100
 *         status:
 *           type: string
 *           enum: [pending, graded]
 *           default: pending
 *           description: Assignment status
 *           example: "pending"
 *         submissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Submission'
 *           description: Array of student submissions
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when assignment was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when assignment was last updated
 *
 *     Submission:
 *       type: object
 *       properties:
 *         studentId:
 *           type: string
 *           description: Student ID who submitted
 *           example: "507f1f77bcf86cd799439014"
 *         submittedAt:
 *           type: string
 *           format: date-time
 *           description: Submission timestamp
 *           example: "2025-11-10T14:30:00.000Z"
 *         files:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Submitted file URLs
 *           example: ["https://cloudinary.com/files/homework1.pdf"]
 *         grade:
 *           type: number
 *           description: Grade received (if graded)
 *           example: 95
 *         feedback:
 *           type: string
 *           description: Teacher feedback
 *           example: "Excellent work! Well structured code."
 *
 *     AssignmentInput:
 *       type: object
 *       required:
 *         - courseId
 *         - title
 *         - dueDate
 *         - createdBy
 *         - maxGrade
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course ID this assignment belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Assignment title
 *           example: "JavaScript Functions Homework"
 *         description:
 *           type: string
 *           description: Assignment description/instructions
 *           example: "Complete exercises on JavaScript functions including arrow functions, callbacks, and closures"
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Assignment due date (must be in the future)
 *           example: "2025-11-15T23:59:59.000Z"
 *         resources:
 *           type: array
 *           items:
 *             type: string
 *             format: uri
 *           description: Array of resource URLs
 *           example: ["https://example.com/resource1.pdf"]
 *         createdBy:
 *           type: string
 *           description: Teacher ID who is creating the assignment
 *           example: "507f1f77bcf86cd799439013"
 *         maxGrade:
 *           type: number
 *           minimum: 0
 *           description: Maximum grade for this assignment
 *           example: 100
 *
 *     AssignmentSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: "Assignment created successfully"
 *         assignment:
 *           $ref: '#/components/schemas/Assignment'
 *
 *     AssignmentsListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         count:
 *           type: number
 *           example: 25
 *         page:
 *           type: number
 *           example: 1
 *         totalPages:
 *           type: number
 *           example: 2
 *         assignments:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Assignment'
 *
 *     AssignmentErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "An error occurred while creating assignment"
 *         error:
 *           type: string
 *           example: "Validation error message"
 */

/**
 * @swagger
 * /assignments:
 *   post:
 *     summary: Create a new assignment
 *     tags: [Homework & Assignment Management - Assignments]
 *     description: Creates a new assignment for a course. Teacher can assign homework with due date and resources
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssignmentInput'
 *           examples:
 *             fullAssignment:
 *               summary: Complete assignment with all fields
 *               value:
 *                 courseId: "507f1f77bcf86cd799439012"
 *                 title: "JavaScript Functions Homework"
 *                 description: "Complete exercises on JavaScript functions including arrow functions, callbacks, and closures. Submit a PDF with your solutions"
 *                 dueDate: "2025-11-15T23:59:59.000Z"
 *                 resources: ["https://example.com/functions-guide.pdf", "https://example.com/tutorial-video.mp4"]
 *                 createdBy: "507f1f77bcf86cd799439013"
 *                 maxGrade: 100
 *             minimalAssignment:
 *               summary: Minimal assignment (required fields only)
 *               value:
 *                 courseId: "507f1f77bcf86cd799439012"
 *                 title: "Array Methods Practice"
 *                 dueDate: "2025-11-20T23:59:59.000Z"
 *                 createdBy: "507f1f77bcf86cd799439013"
 *                 maxGrade: 50
 *     responses:
 *       200:
 *         description: Assignment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentSuccessResponse'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Assignment created successfully"
 *                   assignment:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId: "507f1f77bcf86cd799439012"
 *                     title: "JavaScript Functions Homework"
 *                     description: "Complete exercises on JavaScript functions..."
 *                     dueDate: "2025-11-15T23:59:59.000Z"
 *                     resources: ["https://example.com/functions-guide.pdf"]
 *                     createdBy: "507f1f77bcf86cd799439013"
 *                     maxGrade: 100
 *                     status: "pending"
 *                     submissions: []
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T10:30:00.000Z"
 *       400:
 *         description: Validation error or invalid courseId/teacherId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               invalidCourseId:
 *                 value:
 *                   success: false
 *                   message: "Invalid course ID format"
 *               dueDatePast:
 *                 value:
 *                   success: false
 *                   message: "Due date must be in the future"
 *               validationError:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while creating assignments"
 *                   error: "Validation error details"
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               courseNotFound:
 *                 value:
 *                   success: false
 *                   message: "Course not found"
 */
assignmentRouter.post("/", validate(createAssignmentSchema), create);

/**
 * @swagger
 * /assignments:
 *   get:
 *     summary: Get all assignments with filtering and pagination
 *     tags: [Homework & Assignment Management - Assignments]
 *     description: Retrieves a paginated list of all assignments with optional filtering by courseId, status, and search
 *     parameters:
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Filter assignments by course ID
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, graded]
 *         description: Filter by assignment status
 *         example: "pending"
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in assignment title and description
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
 *           enum: [createdAt, title, dueDate, maxGrade, status]
 *           default: "createdAt"
 *         description: Field to sort by
 *         example: "dueDate"
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: "desc"
 *         description: Sort order (ascending or descending)
 *         example: "asc"
 *     responses:
 *       200:
 *         description: Successfully retrieved assignments list
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentsListResponse'
 *             examples:
 *               withPagination:
 *                 summary: Paginated assignments list
 *                 value:
 *                   success: true
 *                   count: 25
 *                   page: 1
 *                   totalPages: 2
 *                   assignments:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       courseId:
 *                         _id: "507f1f77bcf86cd799439012"
 *                         title: "JavaScript Fundamentals"
 *                       title: "JavaScript Functions Homework"
 *                       description: "Complete exercises on functions..."
 *                       dueDate: "2025-11-15T23:59:59.000Z"
 *                       resources: ["https://example.com/resource1.pdf"]
 *                       createdBy: "507f1f77bcf86cd799439013"
 *                       maxGrade: 100
 *                       status: "pending"
 *                       submissions: []
 *                       createdAt: "2025-10-28T10:30:00.000Z"
 *                       updatedAt: "2025-10-28T10:30:00.000Z"
 *                     - _id: "507f1f77bcf86cd799439015"
 *                       courseId:
 *                         _id: "507f1f77bcf86cd799439012"
 *                         title: "JavaScript Fundamentals"
 *                       title: "Array Methods Practice"
 *                       description: "Practice array methods..."
 *                       dueDate: "2025-11-20T23:59:59.000Z"
 *                       createdBy: "507f1f77bcf86cd799439013"
 *                       maxGrade: 50
 *                       status: "pending"
 *                       submissions: []
 *                       createdAt: "2025-10-28T11:00:00.000Z"
 *                       updatedAt: "2025-10-28T11:00:00.000Z"
 *               filteredByCourse:
 *                 summary: Filtered by courseId
 *                 value:
 *                   success: true
 *                   count: 8
 *                   page: 1
 *                   totalPages: 1
 *                   assignments:
 *                     - _id: "507f1f77bcf86cd799439011"
 *                       courseId: "507f1f77bcf86cd799439012"
 *                       title: "JavaScript Functions Homework"
 *                       dueDate: "2025-11-15T23:59:59.000Z"
 *                       maxGrade: 100
 *                       status: "pending"
 *               filteredByStatus:
 *                 summary: Filtered by status (graded)
 *                 value:
 *                   success: true
 *                   count: 12
 *                   page: 1
 *                   totalPages: 1
 *                   assignments:
 *                     - _id: "507f1f77bcf86cd799439016"
 *                       title: "Completed Assignment"
 *                       status: "graded"
 *                       submissions:
 *                         - studentId: "507f1f77bcf86cd799439014"
 *                           grade: 95
 *                           feedback: "Excellent work!"
 *               emptyList:
 *                 summary: No assignments found
 *                 value:
 *                   success: true
 *                   count: 0
 *                   page: 1
 *                   totalPages: 0
 *                   assignments: []
 *       400:
 *         description: Validation error or invalid courseId format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               invalidCourseId:
 *                 value:
 *                   success: false
 *                   message: "Invalid course ID format"
 *               invalidStatus:
 *                 value:
 *                   success: false
 *                   message: "Status must be either 'pending' or 'graded'"
 *               error:
 *                 value:
 *                   success: false
 *                   message: "An error occurred while finding all assignments"
 *                   error: "Database error details"
 */
assignmentRouter.get("/", findAll);

/**
 * @swagger
 * /assignments/{id}/submit:
 *   post:
 *     summary: Submit an assignment
 *     tags: [Homework & Assignment Management - Assignments]
 *     description: Allows a student to submit an assignment by providing files. Validates due date and prevents duplicate submissions.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Assignment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - files
 *             properties:
 *               studentId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Student ID who is submitting
 *                 example: "507f1f77bcf86cd799439014"
 *               files:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of submitted file URLs
 *                 example: ["https://cloudinary.com/files/homework1.pdf", "https://cloudinary.com/files/homework2.pdf"]
 *           examples:
 *             singleFile:
 *               summary: Submit with single file
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 files: ["https://cloudinary.com/files/homework.pdf"]
 *             multipleFiles:
 *               summary: Submit with multiple files
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 files: [
 *                   "https://cloudinary.com/files/homework1.pdf",
 *                   "https://cloudinary.com/files/homework2.pdf",
 *                   "https://cloudinary.com/files/screenshots.zip"
 *                 ]
 *     responses:
 *       200:
 *         description: Assignment submitted successfully
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
 *                   example: "Assignment submitted successfully"
 *                 assignment:
 *                   $ref: '#/components/schemas/Assignment'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Assignment submitted successfully"
 *                   assignment:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       title: "JavaScript Fundamentals"
 *                     title: "JavaScript Functions Homework"
 *                     description: "Complete exercises on functions..."
 *                     dueDate: "2025-11-15T23:59:59.000Z"
 *                     createdBy:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                     maxGrade: 100
 *                     status: "pending"
 *                     submissions:
 *                       - studentId:
 *                           _id: "507f1f77bcf86cd799439014"
 *                           firstName: "Alice"
 *                           lastName: "Smith"
 *                         submittedAt: "2025-10-28T14:30:00.000Z"
 *                         files: ["https://cloudinary.com/files/homework1.pdf"]
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T14:30:00.000Z"
 *       400:
 *         description: Validation error or due date passed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               invalidAssignmentId:
 *                 value:
 *                   success: false
 *                   message: "Invalid assignment ID format"
 *               invalidStudentId:
 *                 value:
 *                   success: false
 *                   message: "Invalid student ID format"
 *               noFiles:
 *                 value:
 *                   success: false
 *                   message: "At least one file is required for submission"
 *               deadlinePassed:
 *                 value:
 *                   success: false
 *                   message: "Assignment submission deadline has passed"
 *               invalidFileUrl:
 *                 value:
 *                   success: false
 *                   message: "Invalid file URL"
 *       404:
 *         description: Assignment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               notFound:
 *                 value:
 *                   success: false
 *                   message: "Assignment not found"
 *       409:
 *         description: Student already submitted this assignment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               alreadySubmitted:
 *                 value:
 *                   success: false
 *                   message: "You have already submitted this assignment. Cannot submit again."
 */
assignmentRouter.post(
  "/:id/submit",
  validate(assignmentIdSchema, "params"),
  validate(submitAssignmentSchema),
  submitAssignment
);

/**
 * @swagger
 * /assignments/{id}/grade:
 *   patch:
 *     summary: Grade a student's assignment submission
 *     tags: [Homework & Assignment Management - Assignments]
 *     description: Allows a teacher to grade a student's assignment submission with a grade and optional feedback. Automatically updates assignment status to "graded" when all submissions are graded.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: Assignment ID (MongoDB ObjectId)
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - grade
 *             properties:
 *               studentId:
 *                 type: string
 *                 pattern: '^[0-9a-fA-F]{24}$'
 *                 description: Student ID whose submission to grade
 *                 example: "507f1f77bcf86cd799439014"
 *               grade:
 *                 type: number
 *                 minimum: 0
 *                 description: Grade to assign (cannot exceed maxGrade)
 *                 example: 95
 *               feedback:
 *                 type: string
 *                 description: Optional feedback/comments for the student
 *                 example: "Excellent work! Well structured code and clear explanations."
 *           examples:
 *             withFeedback:
 *               summary: Grade with detailed feedback
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 grade: 95
 *                 feedback: "Excellent work! Well structured code and clear explanations. Minor improvement needed in error handling."
 *             withoutFeedback:
 *               summary: Grade without feedback
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 grade: 85
 *             perfectScore:
 *               summary: Perfect score with praise
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 grade: 100
 *                 feedback: "Outstanding work! Perfect implementation of all requirements."
 *             needsImprovement:
 *               summary: Low score with constructive feedback
 *               value:
 *                 studentId: "507f1f77bcf86cd799439014"
 *                 grade: 65
 *                 feedback: "Good effort, but needs improvement in algorithm efficiency and code documentation. Please review the lecture materials on Big O notation."
 *     responses:
 *       200:
 *         description: Assignment graded successfully
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
 *                   example: "Assignment graded successfully"
 *                 assignment:
 *                   $ref: '#/components/schemas/Assignment'
 *             examples:
 *               success:
 *                 value:
 *                   success: true
 *                   message: "Assignment graded successfully"
 *                   assignment:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     courseId:
 *                       _id: "507f1f77bcf86cd799439012"
 *                       title: "JavaScript Fundamentals"
 *                     title: "JavaScript Functions Homework"
 *                     description: "Complete exercises on functions..."
 *                     dueDate: "2025-11-15T23:59:59.000Z"
 *                     createdBy:
 *                       _id: "507f1f77bcf86cd799439013"
 *                       firstName: "John"
 *                       lastName: "Doe"
 *                     maxGrade: 100
 *                     status: "graded"
 *                     submissions:
 *                       - studentId:
 *                           _id: "507f1f77bcf86cd799439014"
 *                           firstName: "Alice"
 *                           lastName: "Smith"
 *                         submittedAt: "2025-10-28T14:30:00.000Z"
 *                         files: ["https://cloudinary.com/files/homework1.pdf"]
 *                         grade: 95
 *                         feedback: "Excellent work! Well structured code."
 *                     createdAt: "2025-10-28T10:30:00.000Z"
 *                     updatedAt: "2025-10-28T16:45:00.000Z"
 *               statusChangedToGraded:
 *                 summary: Status automatically changed to graded
 *                 value:
 *                   success: true
 *                   message: "Assignment graded successfully"
 *                   assignment:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     status: "graded"
 *                     submissions:
 *                       - studentId: "507f1f77bcf86cd799439014"
 *                         grade: 95
 *                         feedback: "Excellent!"
 *                       - studentId: "507f1f77bcf86cd799439015"
 *                         grade: 88
 *                         feedback: "Good work!"
 *                       - studentId: "507f1f77bcf86cd799439016"
 *                         grade: 92
 *                         feedback: "Very good!"
 *       400:
 *         description: Validation error or grade exceeds maxGrade
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               invalidAssignmentId:
 *                 value:
 *                   success: false
 *                   message: "Invalid assignment ID format"
 *               invalidStudentId:
 *                 value:
 *                   success: false
 *                   message: "Invalid student ID format"
 *               gradeRequired:
 *                 value:
 *                   success: false
 *                   message: "Grade is required"
 *               gradeNegative:
 *                 value:
 *                   success: false
 *                   message: "Grade cannot be negative"
 *               gradeExceedsMax:
 *                 value:
 *                   success: false
 *                   message: "Grade cannot exceed maximum grade of 100"
 *       404:
 *         description: Assignment or student submission not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AssignmentErrorResponse'
 *             examples:
 *               assignmentNotFound:
 *                 value:
 *                   success: false
 *                   message: "Assignment not found"
 *               submissionNotFound:
 *                 value:
 *                   success: false
 *                   message: "Student submission not found for this assignment"
 */
assignmentRouter.patch(
  "/:id/grade",
  validate(assignmentIdSchema, "params"),
  validate(gradeAssignmentSchema),
  gradeAssignment
);

export default assignmentRouter;
