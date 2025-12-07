import { Router } from "express";
import {
  submitLessonAssignment,
  getTeacherSubmissions,
  gradeSubmission,
  getStudentSubmission,
} from "../controllers/submission.controller.js";

const submissionRouter = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     LessonSubmission:
 *       type: object
 *       required:
 *         - courseId
 *         - lessonId
 *         - studentId
 *         - fileUrl
 *         - fileName
 *         - lessonTitle
 *       properties:
 *         courseId:
 *           type: string
 *           description: Course ID
 *           example: "507f1f77bcf86cd799439011"
 *         lessonId:
 *           type: string
 *           description: Lesson ID within the course
 *           example: "507f1f77bcf86cd799439012"
 *         studentId:
 *           type: string
 *           description: Student ID
 *           example: "507f1f77bcf86cd799439013"
 *         fileUrl:
 *           type: string
 *           description: URL of the submitted file
 *           example: "https://r2.dev/files/assignment.pdf"
 *         fileName:
 *           type: string
 *           description: Original name of the submitted file
 *           example: "my_assignment.pdf"
 *         lessonTitle:
 *           type: string
 *           description: Title of the lesson/assignment
 *           example: "JavaScript Functions Assignment"
 *         instructions:
 *           type: string
 *           description: Assignment instructions
 *           example: "Complete the exercises in the attached PDF"
 */

/**
 * @swagger
 * /submissions/lesson-assignment:
 *   post:
 *     summary: Submit a lesson assignment
 *     tags: [Homework & Assignment Management - Submissions]
 *     description: Allows a student to submit an assignment for a lesson
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LessonSubmission'
 *     responses:
 *       201:
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
 *                 submission:
 *                   type: object
 *                   description: The created submission with populated references
 *       400:
 *         description: Validation error
 *       404:
 *         description: Course or lesson not found
 *       409:
 *         description: Assignment already submitted
 */
submissionRouter.post("/lesson-assignment", submitLessonAssignment);

/**
 * @swagger
 * /submissions/teacher/{teacherId}:
 *   get:
 *     summary: Get submissions for a teacher
 *     tags: [Homework & Assignment Management - Submissions]
 *     description: Retrieve all assignment submissions for a specific teacher
 *     parameters:
 *       - in: path
 *         name: teacherId
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [submitted, graded]
 *         description: Filter by submission status
 *       - in: query
 *         name: courseId
 *         schema:
 *           type: string
 *         description: Filter by course ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 20
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Submissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 submissions:
 *                   type: array
 *                   items:
 *                     type: object
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     total:
 *                       type: number
 *                     pages:
 *                       type: number
 */
submissionRouter.get("/teacher/:teacherId", getTeacherSubmissions);

/**
 * @swagger
 * /submissions/{id}/grade:
 *   patch:
 *     summary: Grade a submission
 *     tags: [Homework & Assignment Management - Submissions]
 *     description: Allows a teacher to grade a student's submission
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Submission ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - grade
 *             properties:
 *               grade:
 *                 type: number
 *                 minimum: 0
 *                 description: Grade for the submission
 *                 example: 95
 *               feedback:
 *                 type: string
 *                 description: Optional feedback for the student
 *                 example: "Excellent work! Well structured and clear."
 *     responses:
 *       200:
 *         description: Submission graded successfully
 *       404:
 *         description: Submission not found
 */
submissionRouter.patch("/:id/grade", gradeSubmission);

/**
 * @swagger
 * /submissions/student/{studentId}/lesson/{lessonId}:
 *   get:
 *     summary: Get student submission for a lesson
 *     tags: [Homework & Assignment Management - Submissions]
 *     description: Get a specific student's submission for a lesson
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Student ID
 *       - in: path
 *         name: lessonId
 *         required: true
 *         schema:
 *           type: string
 *         description: Lesson ID
 *     responses:
 *       200:
 *         description: Submission retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 submission:
 *                   type: object
 *                   description: The submission or null if not found
 */
submissionRouter.get("/student/:studentId/lesson/:lessonId", getStudentSubmission);

export default submissionRouter;