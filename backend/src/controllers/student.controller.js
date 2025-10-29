import Student from "../models/student.model.js";
import User from "../models/user.model.js";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";
import {
  handleValidationResult,
  validateAndFindById,
} from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/error.utils.js";

/**
 * Get all students with filtering and pagination
 * @route GET /students
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const students = await Student.find({ role: "student" }).select("-password");

  res.status(200).json({
    success: true,
    count: students.length,
    students,
  });
});

/**
 * Get single student by ID
 * @route GET /students/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const student = await validateAndFindById(Student, id, "Student");
  const studentData = handleValidationResult(student);

  res.status(200).json({
    success: true,
    student: studentData,
  });
});

/**
 * Update student profile
 * User can update: firstName, lastName, email, phone, profileImage, bio, interests, dateOfBirth
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const existingStudent = await validateAndFindById(Student, id, "Student");
  const existingStudentData = handleValidationResult(existingStudent);

  const forbiddenFields = [
    "password",
    "role",
    "status",
    "points",
    "level",
    "badges",
    "certificates",
    "payments",
    "enrolledCourses",
    "completedCourses",
    "progress",
    "testResults",
    "assignments",
    "_id",
    "__v",
    "__t",
    "createdAt",
    "updatedAt",
  ];

  forbiddenFields.forEach((field) => {
    if (updates[field] !== undefined) {
      delete updates[field];
    }
  });

  if (updates.email && updates.email !== existingStudentData.email) {
    const normalizedEmail = normalizeEmail(updates.email);

    const emailExists = await User.findOne({
      email: normalizedEmail,
      _id: { $ne: id },
    });

    if (emailExists) {
      throw new ConflictError("This email is already in use by another user");
    }
    updates.email = normalizedEmail;
  }

  if (updates.phone && updates.phone !== existingStudentData.phone) {
    const normalizedPhone = normalizePhone(updates.phone);

    const phoneExists = await User.findOne({
      phone: normalizedPhone,
      _id: { $ne: id },
    });

    if (phoneExists) {
      throw new ConflictError(
        "This phone number is already in use by another user"
      );
    }

    updates.phone = normalizedPhone;
  }

  if (updates.interests !== undefined) {
    if (!Array.isArray(updates.interests)) {
      throw new ValidationError("Interests must be an array");
    }

    updates.interests = [
      ...new Set(
        updates.interests
          .filter((interest) => interest && String(interest).trim())
          .map((interest) => String(interest).trim())
      ),
    ];
  }

  if (updates.dateOfBirth) {
    const birthDate = new Date(updates.dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();

    if (isNaN(birthDate.getTime())) {
      throw new ValidationError("Invalid date format for dateOfBirth");
    }

    if (age < 5 || age > 100) {
      throw new ValidationError("Age must be between 5 and 100 years");
    }
  }

  const updatedStudent = await Student.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      select: "-password",
    }
  );

  res.status(200).json({
    success: true,
    message: "Student profile updated successfully",
    student: updatedStudent,
  });
});

/**
 * Delete student by ID
 * @route DELETE /student/:id
 * @access Public
 */
const remove = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedStudent = await validateAndFindById(Student, id, "Student");
  const deletedStudentData = handleValidationResult(deletedStudent);

  await Student.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Student account deleted successfully",
  });
});

export { findAll, findOne, update, remove };
