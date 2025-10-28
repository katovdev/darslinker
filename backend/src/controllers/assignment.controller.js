import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";

import { validateAndFindById, validateObjectId } from "../utils/model.utils.js";

/**
 * Create a new assignment
 * @route POST /assignments
 * @access Private (Teacher)
 */
async function create(req, res) {
  try {
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
    if (!findCourse.success) {
      return res
        .status(findCourse.error.status)
        .json({ success: false, message: findCourse.error.message });
    }

    const assignment = await Assignment.create({
      courseId,
      title,
      description,
      dueDate,
      resources,
      createdBy,
      maxGrade: Number(maxGrade),
    });

    return res.status(200).json({
      success: true,
      message: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while creating assignments",
      error: error.message,
    });
  }
}

/**
 * Get all assignments with filtering and pagination
 * @route GET /assignments
 * @access Public
 */
async function findAll(req, res) {
  try {
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
      if (!validation.valid) {
        return res
          .status(validation.error.status)
          .json({ success: false, message: validation.error.message });
      }
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

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      assignments,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all assignments",
      error: error.message,
    });
  }
}

/**
 * Submit assignment
 * @route POST /assignments/:id/submit
 * @access Private (Student)
 */
async function submitAssignment(req, res) {
  try {
    const { id } = req.params;
    const { studentId, files } = req.body;

    const findAssignment = await validateAndFindById(
      Assignment,
      id,
      "Assignment"
    );
    if (!findAssignment.success) {
      return res
        .status(findAssignment.error.status)
        .json({ success: false, message: findAssignment.error.message });
    }

    const currentDate = new Date();
    const dueDate = new Date(findAssignment.data.dueDate);

    if (currentDate > dueDate) {
      return res
        .status(400)
        .json({ success: false, message: "Assignment submission has passed" });
    }

    const existingSubmission = findAssignment.data.submissions.find(
      (sub) => sub.studentId.toString() === studentId
    );
    if (existingSubmission) {
      return res.status(409).json({
        success: false,
        message:
          "You have already submitted this assignment. Cannot submit again",
      });
    }

    const updatedAssignment = await Assignment.findByIdAndUpdate(
      id,
      {
        $push: { submissions: { studentId, files, submittedAt: new Date() } },
      },
      { new: true, runValidators: true }
    ).populate("courseId createdBy submissions.studentId");

    return res.status(200).json({
      success: true,
      message: "Assignment submitted successfully",
      assignment: updatedAssignment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while submitting assignment",
      error: error.message,
    });
  }
}

/**
 * Grade assignment submission
 * @route PATCH /assignments/:id/grade
 * @access Private (Teacher)
 */
async function gradeAssignment(req, res) {
  try {
    const { id } = req.params;
    const { studentId, grade, feedback } = req.body;

    const findAssignment = await validateAndFindById(
      Assignment,
      id,
      "Assignment"
    );
    if (!findAssignment.success) {
      return res
        .status(findAssignment.error.status)
        .json({ success: false, message: findAssignment.error.message });
    }

    const submissionIndex = findAssignment.data.submissions.findIndex(
      (sub) => sub.studentId.toString() === studentId
    );

    if (submissionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student submission not found for this assignment",
      });
    }

    if (grade > findAssignment.data.maxGrade) {
      return res.status(400).json({
        success: false,
        message: `Grade cannot exceed maximum grade of ${findAssignment.data.maxGrade}`,
      });
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

    if (!allGraded && updatedAssignment.status !== "graded") {
      updatedAssignment.status = "graded";
      await updatedAssignment.save();
    }

    return res
      .status(200)
      .json({
        success: true,
        message: "Assignment graded successfully",
        assigment: updatedAssignment,
      });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while grading assignments",
      error: error.message,
    });
  }
}
export { create, findAll, submitAssignment, gradeAssignment };
