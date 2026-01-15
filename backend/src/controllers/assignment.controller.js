import logger from "../../config/logger.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/error.utils.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import prisma from "../lib/prisma.js";

/**
 * Create a new assignment
 * @route POST /assignments
 * @access Private (Teacher)
 */
const create = catchAsync(async (req, res) => {
  const {
    courseId,
    title,
    description,
    dueDate,
    resources,
    createdBy,
    maxGrade,
  } = req.body;

  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  const assignment = await prisma.assignment.create({
    data: {
      courseId,
      title,
      description,
      dueDate: dueDate ? new Date(dueDate) : null,
      resources,
      createdBy,
      maxGrade: Number(maxGrade),
      status: "pending",
      submissions: [],
    },
  });

  logger.info("Assignment created successfully", {
    assignmentId: assignment.id,
    courseId,
    title: assignment.title,
    createdBy,
  });

  res.status(200).json({
    success: true,
    message: "Assignment created successfully",
    assignment,
  });
});

/**
 * Get all assignments with filtering and pagination
 * @route GET /assignments
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const {
    courseId,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "asc",
  } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const where = {};
  if (courseId) {
    where.courseId = courseId;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const totalCount = await prisma.assignment.count({ where });

  const assignments = await prisma.assignment.findMany({
    where,
    orderBy: { [sortBy]: order === "asc" ? "asc" : "desc" },
    skip,
    take: limitNumber,
  });

  res.status(200).json({
    success: true,
    count: totalCount,
    page: pageNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    assignments,
  });
});

/**
 * Submit assignment
 * @route POST /assignments/:id/submit
 * @access Private (Student)
 */
const submitAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { studentId, files } = req.body;

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) {
    throw new NotFoundError("Assignment not found");
  }

  const currentDate = new Date();
  const dueDate = assignment.dueDate ? new Date(assignment.dueDate) : null;

  if (dueDate && currentDate > dueDate) {
    throw new BadRequestError("Assignment submission has passed");
  }

  const submissions = Array.isArray(assignment.submissions)
    ? assignment.submissions
    : [];

  const existingSubmission = submissions.find(
    (sub) => sub.studentId?.toString?.() === studentId
  );
  if (existingSubmission) {
    throw new ConflictError(
      "You have already submitted this assignment. Cannot submit again"
    );
  }

  const updatedSubmissions = [
    ...submissions,
    {
      studentId,
      files,
      submittedAt: new Date(),
    },
  ];

  const updatedAssignment = await prisma.assignment.update({
    where: { id },
    data: { submissions: updatedSubmissions },
  });

  logger.info("Assignment submitted by student", {
    assignmentId: id,
    studentId,
    filesCount: files?.length || 0,
  });

  res.status(200).json({
    success: true,
    message: "Assignment submitted successfully",
    assignment: updatedAssignment,
  });
});

/**
 * Grade assignment submission
 * @route PATCH /assignments/:id/grade
 * @access Private (Teacher)
 */
const gradeAssignment = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { studentId, grade, feedback } = req.body;

  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment) {
    throw new NotFoundError("Assignment not found");
  }

  const submissions = Array.isArray(assignment.submissions)
    ? assignment.submissions
    : [];

  const submissionIndex = submissions.findIndex(
    (sub) => sub.studentId?.toString?.() === studentId
  );

  if (submissionIndex === -1) {
    throw new NotFoundError("Student submission not found for this assignment");
  }

  if (grade > assignment.maxGrade) {
    throw new BadRequestError(
      `Grade cannot exceed maximum grade of ${assignment.maxGrade}`
    );
  }

  const updatedSubmissions = [...submissions];
  updatedSubmissions[submissionIndex] = {
    ...updatedSubmissions[submissionIndex],
    grade,
    feedback: feedback || "",
  };

  const allGraded = updatedSubmissions.every(
    (sub) => sub.grade !== undefined && sub.grade !== null
  );

  const updatedAssignment = await prisma.assignment.update({
    where: { id },
    data: {
      submissions: updatedSubmissions,
      status: allGraded ? "graded" : assignment.status,
    },
  });

  logger.info("Assignment graded by teacher", {
    assignmentId: id,
    studentId,
    grade,
    maxGrade: assignment.maxGrade,
  });

  res.status(200).json({
    success: true,
    message: "Assignment graded successfully",
    assignment: updatedAssignment,
  });
});

export { create, findAll, submitAssignment, gradeAssignment };
