import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/error.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  handleValidationResult,
  validateAndFindById,
  validateObjectId,
} from "../utils/model.utils.js";

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

  const findCourse = await validateAndFindById(Course, courseId, "Course");
  const findCourseData = handleValidationResult(findCourse);

  const assignment = await Assignment.create({
    courseId,
    title,
    description,
    dueDate,
    resources,
    createdBy,
    maxGrade: Number(maxGrade),
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

  const filter = {};

  if (courseId) {
    const validation = validateObjectId(courseId, "Course");
    const validationData = handleValidationResult(validation);
    filter.courseId = courseId;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const totalCount = await Assignment.countDocuments(filter);

  const assignments = await Assignment.find(filter)
    .populate("courseId")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean();

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

  const findAssignment = await validateAndFindById(
    Assignment,
    id,
    "Assignment"
  );
  const findAssignmentData = handleValidationResult(findAssignment);

  const currentDate = new Date();
  const dueDate = new Date(findAssignmentData.dueDate);

  if (currentDate > dueDate) {
    throw new BadRequestError("Assignment submission has passed");
  }

  const existingSubmission = findAssignmentData.submissions.find(
    (sub) => sub.studentId.toString() === studentId
  );
  if (existingSubmission) {
    throw new ConflictError(
      "You have already submitted this assignment. Cannot submit again"
    );
  }

  const updatedAssignment = await Assignment.findByIdAndUpdate(
    id,
    {
      $push: { submissions: { studentId, files, submittedAt: new Date() } },
    },
    { new: true, runValidators: true }
  ).populate("courseId createdBy submissions.studentId");

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

  const findAssignment = await validateAndFindById(
    Assignment,
    id,
    "Assignment"
  );
  const findAssignmentData = handleValidationResult(findAssignment);

  const submissionIndex = findAssignmentData.submissions.findIndex(
    (sub) => sub.studentId.toString() === studentId
  );

  if (submissionIndex === -1) {
    throw new NotFoundError("Student submission not found for this assignment");
  }

  if (grade > findAssignmentData.maxGrade) {
    throw new BadRequestError(
      `Grade cannot exceed maximum grade of ${findAssignmentData.maxGrade}`
    );
  }

  const updatedAssignment = await Assignment.findOneAndUpdate(
    {
      _id: id,
      "submissions.studentId": studentId,
    },
    {
      $set: {
        "submissions.$.grade": grade,
        "submissions.$.feedback": feedback || "",
      },
    },
    { new: true, runValidators: true }
  ).populate("courseId createdBy submissions.studentId");

  const allGraded = updatedAssignment.submissions.every(
    (sub) => sub.grade !== undefined && sub.grade !== null
  );

  if (allGraded && updatedAssignment.status !== "graded") {
    updatedAssignment.status = "graded";
    await updatedAssignment.save();
  }

  res.status(200).json({
    success: true,
    message: "Assignment graded successfully",
    assignment: updatedAssignment,
  });
});

export { create, findAll, submitAssignment, gradeAssignment };
