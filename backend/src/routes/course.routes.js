import { Router } from "express";
import {
  create,
  findAll,
  findOne,
  remove,
  update,
  uploadImage,
  uploadVideo,
} from "../controllers/course.controller.js";
import { validate } from "../middlewares/validation.middleware.js";
import {
  courseIdSchema,
  createCourseSchema,
  updateCourseSchema,
} from "../validations/course.validation.js";
import {
  uploadSingleImage,
  uploadSingleVideo,
  handleUploadError,
} from "../middlewares/upload.middleware.js";

const courseRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       required:
 *         - title
 *         - shortDesciption
 *         - fullDescription
 *         - category
 *         - level
 *         - language
 *         - duration
 *         - courseImage
 *         - coursePrice
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId
 *           example: 507f1f77bcf86cd799439011
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Course title
 *           example: Complete JavaScript Bootcamp 2024
 *         shortDesciption:
 *           type: string
 *           minLength: 10
 *           maxLength: 300
 *           description: Short description of the course
 *           example: Learn modern JavaScript from scratch with hands-on projects and real-world applications
 *         fullDescription:
 *           type: string
 *           minLength: 50
 *           description: Detailed description of the course content, objectives, and outcomes
 *           example: This comprehensive JavaScript bootcamp covers everything from basics to advanced concepts. You'll learn ES6+, async programming, DOM manipulation, and build real-world projects.
 *         category:
 *           type: string
 *           description: Course category or subject area
 *           example: Programming
 *         level:
 *           type: string
 *           description: Difficulty level of the course
 *           enum: [beginner, intermediate, advanced]
 *           example: beginner
 *         language:
 *           type: string
 *           description: Language in which the course is taught
 *           example: English
 *         duration:
 *           type: string
 *           description: Course duration (e.g., "8 weeks", "40 hours")
 *           example: 40 hours
 *         courseImage:
 *           type: string
 *           format: uri
 *           description: URL to course thumbnail/cover image
 *           example: https://example.com/images/javascript-bootcamp.jpg
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: URL to course preview/introduction video
 *           example: https://example.com/videos/course-intro.mp4
 *         courseType:
 *           type: string
 *           enum: [paid, free]
 *           default: free
 *           description: Whether the course is free or paid
 *           example: paid
 *         coursePrice:
 *           type: number
 *           minimum: 0
 *           description: Course price (0 for free courses)
 *           example: 49.99
 *         discountPrice:
 *           type: number
 *           minimum: 0
 *           description: Discounted price if applicable
 *           example: 29.99
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when course was created
 *           example: 2024-01-15T10:30:00Z
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp when course was last updated
 *           example: 2024-01-15T10:30:00Z
 *
 *     CourseInput:
 *       type: object
 *       required:
 *         - title
 *         - shortDesciption
 *         - fullDescription
 *         - category
 *         - level
 *         - language
 *         - duration
 *         - courseImage
 *         - coursePrice
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Course title
 *           example: Complete JavaScript Bootcamp 2024
 *         shortDesciption:
 *           type: string
 *           minLength: 10
 *           maxLength: 300
 *           description: Short description of the course
 *           example: Learn modern JavaScript from scratch with hands-on projects and real-world applications
 *         fullDescription:
 *           type: string
 *           minLength: 50
 *           description: Detailed description of the course content
 *           example: This comprehensive JavaScript bootcamp covers everything from basics to advanced concepts. You'll learn ES6+, async programming, DOM manipulation, and build real-world projects.
 *         category:
 *           type: string
 *           description: Course category
 *           example: Programming
 *         level:
 *           type: string
 *           description: Difficulty level
 *           enum: [beginner, intermediate, advanced]
 *           example: beginner
 *         language:
 *           type: string
 *           description: Course language
 *           example: English
 *         duration:
 *           type: string
 *           description: Course duration
 *           example: 40 hours
 *         courseImage:
 *           type: string
 *           format: uri
 *           description: Course image URL
 *           example: https://example.com/images/javascript-bootcamp.jpg
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: Preview video URL
 *           example: https://example.com/videos/course-intro.mp4
 *         courseType:
 *           type: string
 *           enum: [paid, free]
 *           default: free
 *           description: Course type
 *           example: paid
 *         coursePrice:
 *           type: number
 *           minimum: 0
 *           description: Course price
 *           example: 49.99
 *         discountPrice:
 *           type: number
 *           minimum: 0
 *           description: Discount price
 *           example: 29.99
 *
 *     CourseUpdate:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           minLength: 3
 *           maxLength: 200
 *           description: Course title
 *           example: Complete JavaScript Bootcamp 2024 - Updated
 *         shortDesciption:
 *           type: string
 *           minLength: 10
 *           maxLength: 300
 *           description: Short description
 *           example: Updated course description
 *         fullDescription:
 *           type: string
 *           minLength: 50
 *           description: Full description
 *           example: Updated comprehensive course content description
 *         category:
 *           type: string
 *           description: Course category
 *           example: Web Development
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Difficulty level
 *           example: intermediate
 *         language:
 *           type: string
 *           description: Course language
 *           example: English
 *         duration:
 *           type: string
 *           description: Course duration
 *           example: 45 hours
 *         courseImage:
 *           type: string
 *           format: uri
 *           description: Course image URL
 *           example: https://example.com/images/javascript-bootcamp-v2.jpg
 *         videoUrl:
 *           type: string
 *           format: uri
 *           description: Preview video URL
 *           example: https://example.com/videos/course-intro-v2.mp4
 *         courseType:
 *           type: string
 *           enum: [paid, free]
 *           description: Course type
 *           example: paid
 *         coursePrice:
 *           type: number
 *           minimum: 0
 *           description: Course price
 *           example: 59.99
 *         discountPrice:
 *           type: number
 *           minimum: 0
 *           description: Discount price
 *           example: 39.99
 *
 *     CourseSuccessResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Operation completed successfully
 *         data:
 *           $ref: '#/components/schemas/Course'
 *
 *     CoursesListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: true
 *         message:
 *           type: string
 *           example: Courses retrieved successfully
 *         count:
 *           type: integer
 *           description: Total number of courses
 *           example: 25
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Course'
 */

/**
 * @swagger
 * /courses:
 *   post:
 *     summary: Create a new course
 *     description: Create a new course with all required information including title, descriptions, pricing, and media. This endpoint is typically used by teachers or administrators to add new courses to the platform.
 *     tags: [Course Management - Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseInput'
 *           examples:
 *             paidCourse:
 *               summary: Create paid course
 *               value:
 *                 title: Complete JavaScript Bootcamp 2024
 *                 shortDesciption: Learn modern JavaScript from scratch with hands-on projects
 *                 fullDescription: This comprehensive JavaScript bootcamp covers everything from basics to advanced concepts. You'll learn ES6+, async programming, DOM manipulation, and build 10+ real-world projects including a full-stack web application.
 *                 category: Programming
 *                 level: beginner
 *                 language: English
 *                 duration: 40 hours
 *                 courseImage: https://example.com/images/javascript-bootcamp.jpg
 *                 videoUrl: https://example.com/videos/js-intro.mp4
 *                 courseType: paid
 *                 coursePrice: 49.99
 *                 discountPrice: 29.99
 *             freeCourse:
 *               summary: Create free course
 *               value:
 *                 title: Introduction to Web Development
 *                 shortDesciption: Start your journey into web development with this beginner-friendly course
 *                 fullDescription: Learn the fundamentals of web development including HTML, CSS, and basic JavaScript. Perfect for absolute beginners who want to understand how websites work.
 *                 category: Web Development
 *                 level: beginner
 *                 language: English
 *                 duration: 10 hours
 *                 courseImage: https://example.com/images/web-dev-intro.jpg
 *                 courseType: free
 *                 coursePrice: 0
 *             advancedCourse:
 *               summary: Create advanced course
 *               value:
 *                 title: Advanced React Patterns and Best Practices
 *                 shortDesciption: Master advanced React concepts and architectural patterns
 *                 fullDescription: Deep dive into advanced React patterns including render props, higher-order components, custom hooks, state management with Redux and Context API, performance optimization, and testing strategies.
 *                 category: Frontend Development
 *                 level: advanced
 *                 language: English
 *                 duration: 30 hours
 *                 courseImage: https://example.com/images/advanced-react.jpg
 *                 videoUrl: https://example.com/videos/react-advanced-intro.mp4
 *                 courseType: paid
 *                 coursePrice: 79.99
 *     responses:
 *       201:
 *         description: Course created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseSuccessResponse'
 *             example:
 *               success: true
 *               message: Course created successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 title: Complete JavaScript Bootcamp 2024
 *                 shortDesciption: Learn modern JavaScript from scratch with hands-on projects
 *                 fullDescription: This comprehensive JavaScript bootcamp covers everything from basics to advanced concepts.
 *                 category: Programming
 *                 level: beginner
 *                 language: English
 *                 duration: 40 hours
 *                 courseImage: https://example.com/images/javascript-bootcamp.jpg
 *                 videoUrl: https://example.com/videos/js-intro.mp4
 *                 courseType: paid
 *                 coursePrice: 49.99
 *                 discountPrice: 29.99
 *                 createdAt: 2024-01-15T10:30:00Z
 *                 updatedAt: 2024-01-15T10:30:00Z
 *       400:
 *         description: Bad request - Missing required fields or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   success: false
 *                   message: An error occurred while creating course
 *                   error: Course title is required
 *               invalidPrice:
 *                 summary: Invalid course price
 *                 value:
 *                   success: false
 *                   message: An error occurred while creating course
 *                   error: Course price must be a positive number
 *               invalidLevel:
 *                 summary: Invalid course level
 *                 value:
 *                   success: false
 *                   message: An error occurred while creating course
 *                   error: Course level must be one of beginner, intermediate, or advanced
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication token required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: You do not have permission to create courses
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while creating course
 *               error: Detailed error message
 */
courseRouter.post("/", validate(createCourseSchema), create);

/**
 * @swagger
 * /courses:
 *   get:
 *     summary: Get all courses
 *     description: Retrieve a list of all courses available on the platform. Supports filtering, sorting, and pagination (to be implemented). Returns course catalog with essential information for browsing.
 *     tags: [Course Management - Courses]
 *     security: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter courses by category
 *         example: Programming
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter courses by difficulty level
 *         example: beginner
 *       - in: query
 *         name: courseType
 *         schema:
 *           type: string
 *           enum: [paid, free, active, draft, archived]
 *         description: Filter by course type (paid, free, active, draft, archived)
 *         example: free
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter courses by language
 *         example: English
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search courses by title or description
 *         example: JavaScript
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of courses per page
 *         example: 20
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [createdAt, title, coursePrice]
 *           default: createdAt
 *         description: Field to sort by
 *         example: createdAt
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order (ascending or descending)
 *         example: desc
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CoursesListResponse'
 *             example:
 *               success: true
 *               message: Courses retrieved successfully
 *               count: 25
 *               data:
 *                 - _id: 507f1f77bcf86cd799439011
 *                   title: Complete JavaScript Bootcamp 2024
 *                   shortDesciption: Learn modern JavaScript from scratch
 *                   fullDescription: Comprehensive JavaScript course
 *                   category: Programming
 *                   level: beginner
 *                   language: English
 *                   duration: 40 hours
 *                   courseImage: https://example.com/images/js-bootcamp.jpg
 *                   videoUrl: https://example.com/videos/js-intro.mp4
 *                   courseType: paid
 *                   coursePrice: 49.99
 *                   discountPrice: 29.99
 *                   createdAt: 2024-01-15T10:30:00Z
 *                   updatedAt: 2024-01-15T10:30:00Z
 *                 - _id: 507f1f77bcf86cd799439012
 *                   title: Introduction to Web Development
 *                   shortDesciption: Start your web development journey
 *                   fullDescription: Learn HTML, CSS, and basic JavaScript
 *                   category: Web Development
 *                   level: beginner
 *                   language: English
 *                   duration: 10 hours
 *                   courseImage: https://example.com/images/web-dev.jpg
 *                   courseType: free
 *                   coursePrice: 0
 *                   createdAt: 2024-01-14T09:20:00Z
 *                   updatedAt: 2024-01-14T09:20:00Z
 *       400:
 *         description: Bad request - Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidLevel:
 *                 summary: Invalid level filter
 *                 value:
 *                   success: false
 *                   message: An error occurred while finding all courses
 *                   error: Invalid level value. Must be beginner, intermediate, or advanced
 *               invalidPage:
 *                 summary: Invalid page number
 *                 value:
 *                   success: false
 *                   message: An error occurred while finding all courses
 *                   error: Page number must be a positive integer
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while finding all courses
 *               error: Detailed error message
 */
courseRouter.get("/", findAll);

/**
 * @swagger
 * /courses/{id}:
 *   get:
 *     summary: Get a single course by ID
 *     description: Retrieve detailed information about a specific course using its unique MongoDB ObjectId. Returns complete course information including all metadata, pricing, and media URLs.
 *     tags: [Course Management - Courses]
 *     security: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the course
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Course found and retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseSuccessResponse'
 *             example:
 *               success: true
 *               message: Course retrieved successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 title: Complete JavaScript Bootcamp 2024
 *                 shortDesciption: Learn modern JavaScript from scratch with hands-on projects
 *                 fullDescription: This comprehensive JavaScript bootcamp covers everything from basics to advanced concepts. You'll learn ES6+, async programming, DOM manipulation, and build real-world projects.
 *                 category: Programming
 *                 level: beginner
 *                 language: English
 *                 duration: 40 hours
 *                 courseImage: https://example.com/images/javascript-bootcamp.jpg
 *                 videoUrl: https://example.com/videos/js-intro.mp4
 *                 courseType: paid
 *                 coursePrice: 49.99
 *                 discountPrice: 29.99
 *                 createdAt: 2024-01-15T10:30:00Z
 *                 updatedAt: 2024-01-15T10:30:00Z
 *       400:
 *         description: Bad request - Invalid course ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while finding only one course
 *               error: Invalid course ID format. Must be a valid MongoDB ObjectId
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Course not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while finding only one course
 *               error: Detailed error message
 */
courseRouter.get("/:id", validate(courseIdSchema, "params"), findOne);

/**
 * @swagger
 * /courses/{id}:
 *   patch:
 *     summary: Update a course
 *     description: Update an existing course's information. Only provided fields will be updated, other fields remain unchanged. This endpoint allows partial updates to course details including pricing, descriptions, media, and metadata.
 *     tags: [Course Management - Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the course to update
 *         example: 507f1f77bcf86cd799439011
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CourseUpdate'
 *           examples:
 *             updatePrice:
 *               summary: Update course pricing
 *               value:
 *                 coursePrice: 59.99
 *                 discountPrice: 39.99
 *             updateContent:
 *               summary: Update course content information
 *               value:
 *                 title: Complete JavaScript Bootcamp 2024 - Updated
 *                 fullDescription: This comprehensive JavaScript bootcamp now includes TypeScript and Node.js modules
 *                 duration: 50 hours
 *             updateLevel:
 *               summary: Update course level and category
 *               value:
 *                 level: intermediate
 *                 category: Full Stack Development
 *             updateMedia:
 *               summary: Update course media
 *               value:
 *                 courseImage: https://example.com/images/new-course-image.jpg
 *                 videoUrl: https://example.com/videos/new-intro.mp4
 *             updateMultiple:
 *               summary: Update multiple fields
 *               value:
 *                 title: Advanced JavaScript Mastery 2024
 *                 shortDesciption: Master JavaScript with advanced techniques
 *                 level: advanced
 *                 duration: 60 hours
 *                 coursePrice: 79.99
 *                 discountPrice: 49.99
 *     responses:
 *       200:
 *         description: Course updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CourseSuccessResponse'
 *             example:
 *               success: true
 *               message: Course updated successfully
 *               data:
 *                 _id: 507f1f77bcf86cd799439011
 *                 title: Complete JavaScript Bootcamp 2024 - Updated
 *                 shortDesciption: Learn modern JavaScript from scratch with hands-on projects
 *                 fullDescription: This comprehensive JavaScript bootcamp now includes TypeScript and Node.js modules
 *                 category: Programming
 *                 level: beginner
 *                 language: English
 *                 duration: 50 hours
 *                 courseImage: https://example.com/images/javascript-bootcamp.jpg
 *                 videoUrl: https://example.com/videos/js-intro.mp4
 *                 courseType: paid
 *                 coursePrice: 59.99
 *                 discountPrice: 39.99
 *                 createdAt: 2024-01-15T10:30:00Z
 *                 updatedAt: 2024-01-15T14:25:00Z
 *       400:
 *         description: Bad request - Invalid course ID or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidId:
 *                 summary: Invalid course ID
 *                 value:
 *                   success: false
 *                   message: An error occurred while updating courses
 *                   error: Invalid course ID format
 *               invalidPrice:
 *                 summary: Invalid price value
 *                 value:
 *                   success: false
 *                   message: An error occurred while updating courses
 *                   error: Course price must be a positive number
 *               invalidLevel:
 *                 summary: Invalid level value
 *                 value:
 *                   success: false
 *                   message: An error occurred while updating courses
 *                   error: Course level must be one of beginner, intermediate, or advanced
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication token required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: You do not have permission to update this course
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Course not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while updating courses
 *               error: Detailed error message
 */
courseRouter.patch(
  "/:id",
  validate(courseIdSchema, "params"),
  validate(updateCourseSchema),
  update
);

// Also support PUT method for course updates
courseRouter.put(
  "/:id",
  validate(courseIdSchema, "params"),
  validate(updateCourseSchema),
  update
);

/**
 * @swagger
 * /courses/{id}:
 *   delete:
 *     summary: Delete a course
 *     description: Permanently delete a course from the platform. This action cannot be undone. Typically restricted to course owners, teachers, or administrators. Consider implementing soft delete or archiving for production systems.
 *     tags: [Course Management - Courses]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           pattern: '^[0-9a-fA-F]{24}$'
 *         description: MongoDB ObjectId of the course to delete
 *         example: 507f1f77bcf86cd799439011
 *     responses:
 *       200:
 *         description: Course deleted successfully
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
 *                   example: Course deleted successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     deletedId:
 *                       type: string
 *                       example: 507f1f77bcf86cd799439011
 *             example:
 *               success: true
 *               message: Course deleted successfully
 *               data:
 *                 deletedId: 507f1f77bcf86cd799439011
 *       400:
 *         description: Bad request - Invalid course ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while deleting courses
 *               error: Invalid course ID format. Must be a valid MongoDB ObjectId
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication token required
 *       403:
 *         description: Forbidden - Insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noPermission:
 *                 summary: User lacks permission
 *                 value:
 *                   success: false
 *                   message: You do not have permission to delete this course
 *               enrolledStudents:
 *                 summary: Course has enrolled students
 *                 value:
 *                   success: false
 *                   message: Cannot delete course with enrolled students
 *       404:
 *         description: Course not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Course not found
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while deleting courses
 *               error: Detailed error message
 */
courseRouter.delete("/:id", validate(courseIdSchema, "params"), remove);

/**
 * @swagger
 * /courses/upload-image:
 *   post:
 *     summary: Upload course image
 *     description: Upload a course image file to Cloudinary. Returns the secure URL of the uploaded image. This endpoint should be called before creating or updating a course to get the image URL
 *     tags: [Course Management - Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Course image file (PNG, JPG)
 *     responses:
 *       200:
 *         description: Image uploaded successfully
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
 *                   example: Image uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Cloudinary secure URL of uploaded image
 *                       example: https://res.cloudinary.com/demo/image/upload/v1234567890/courses/image.jpg
 *                     public_id:
 *                       type: string
 *                       description: Cloudinary public ID for the uploaded image
 *                       example: courses/image
 *       400:
 *         description: Bad request - No file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noFile:
 *                 summary: No file provided
 *                 value:
 *                   success: false
 *                   message: No image file provided
 *               invalidFileType:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   message: Invalid file type. Only images (PNG, JPG) are allowed
 *               fileTooLarge:
 *                 summary: File size too large
 *                 value:
 *                   success: false
 *                   message: File size is too large. Maximum file size is 5MB
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication token required
 *       500:
 *         description: Internal server error - Upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while uploading image
 *               error: Detailed error message
 */
courseRouter.post(
  "/upload-image",
  uploadSingleImage,
  handleUploadError,
  uploadImage
);

/**
 * @swagger
 * /courses/upload-video:
 *   post:
 *     summary: Upload course video
 *     description: Upload a course preview/intro video file to Cloudinary. Returns the secure URL of the uploaded video. This endpoint should be called before creating or updating a course to get the video URL.
 *     tags: [Course Management - Courses]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - video
 *             properties:
 *               video:
 *                 type: string
 *                 format: binary
 *                 description: Course video file (MP4, AVI, MOV, WMV, FLV, WEBM)
 *     responses:
 *       200:
 *         description: Video uploaded successfully
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
 *                   example: Video uploaded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     url:
 *                       type: string
 *                       format: uri
 *                       description: Cloudinary secure URL of uploaded video
 *                       example: https://res.cloudinary.com/demo/video/upload/v1234567890/course-videos/video.mp4
 *                     public_id:
 *                       type: string
 *                       description: Cloudinary public ID for the uploaded video
 *                       example: course-videos/video
 *       400:
 *         description: Bad request - No file provided or invalid file type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noFile:
 *                 summary: No file provided
 *                 value:
 *                   success: false
 *                   message: No video file provided
 *               invalidFileType:
 *                 summary: Invalid file type
 *                 value:
 *                   success: false
 *                   message: Invalid file type. Only videos (MP4, AVI, MOV, WMV, FLV, WEBM) are allowed.
 *               fileTooLarge:
 *                 summary: File size too large
 *                 value:
 *                   success: false
 *                   message: File size is too large. Maximum file size is 50MB.
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: Authentication token required
 *       500:
 *         description: Internal server error - Upload failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: An error occurred while uploading video
 *               error: Detailed error message
 */
courseRouter.post(
  "/upload-video",
  uploadSingleVideo,
  handleUploadError,
  uploadVideo
);

export default courseRouter;
