import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";
import logger from "../../config/logger.js";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";
import {
  handleValidationResult,
  validateAndFindById,
} from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import { ConflictError, ValidationError } from "../utils/error.utils.js";

/**
 * Create a teacher profile
 * @route POST /teachers/create-profile
 * @access Private (Authenticated teachers only)
 */
const createTeacherProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  if (userRole !== "teacher") {
    logger.warn("Profile creation failed - User is not a teacher", {
      userId,
      role: userRole,
    });
    throw new ValidationError("Only teachers can create teacher profiles");
  }

  const existingProfile = await Teacher.findById(userId);
  if (existingProfile) {
    logger.warn("Profile creation failed - Profile already exists", {
      userId,
    });
    throw new ConflictError("Teacher profile already exists for this user");
  }

  const { profileImage, specialization, bio, city, country } = req.body;

  const user = await User.findById(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }

  const newTeacher = await Teacher.findByIdAndUpdate(
    userId,
    {
      $set: {
        profileImage: profileImage || "",
        specialization,
        bio: bio || "",
        city: city || "",
        country: country || "",
      },
    },
    {
      new: true,
      runValidators: true,
      select: "-password",
    }
  );

  logger.info("Teacher profile created successfully", {
    teacherId: userId,
    specialization,
  });

  res.status(200).json({
    success: true,
    message: "Teacher profile created successfully",
    teacher: newTeacher,
  });
});

/**
 * Get all teachers with filtering and pagination
 * @route GET /teachers
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const teachers = await Teacher.find().select("-password");

  res.status(200).json({
    success: true,
    count: teachers.length,
    teachers,
  });
});

const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const teacher = await validateAndFindById(Teacher, id, "Teacher");
  const teacherData = handleValidationResult(teacher);

  res.status(200).json({
    success: true,
    teacher: teacherData,
  });
});

/**
 * Update teacher profile
 * User can update: firstName, lastName, email, phone, profileImage, bio, specialization, certificates, paymentMethods
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const existingTeacher = await validateAndFindById(Teacher, id, "Teacher");
  const existingTeacherData = handleValidationResult(existingTeacher);

  const forbiddenFields = [
    "password",
    "role",
    "status",
    "ratingAverage",
    "reviewsCount",
    "reviews",
    "courseCount",
    "studentCount",
    "totalEarnings",
    "balance",
    "payouts",
    "courses",
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

  if (updates.email && updates.email !== existingTeacherData.email) {
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

  if (updates.phone && updates.phone !== existingTeacherData.phone) {
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

  if (updates.certificates !== undefined) {
    if (!Array.isArray(updates.certificates)) {
      throw new ValidationError("Certificates must be an array");
    }

    updates.certificates = updates.certificates.filter((cert) => {
      if (!cert || typeof cert !== "object") return false;

      if (cert.title) cert.title = String(cert.title).trim();
      if (cert.issuer) cert.issuer = String(cert.issuer).trim();
      if (cert.url) cert.url = String(cert.url).trim();

      return cert.title && cert.issuer;
    });
  }

  if (updates.paymentMethods !== undefined) {
    if (
      typeof updates.paymentMethods !== "object" ||
      Array.isArray(updates.paymentMethods)
    ) {
      throw new ValidationError("Payment methods must be an object");
    }

    const allowedMethods = ["click", "payme", "uzum", "bankAccount"];
    const sanitized = {};

    allowedMethods.forEach((method) => {
      if (updates.paymentMethods[method]) {
        sanitized[method] = String(updates.paymentMethods[method]).trim();
      }
    });

    updates.paymentMethods = sanitized;
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      select: "-password",
    }
  );

  logger.info("Teacher profile updated", {
    teacherId: id,
    updatedFields: Object.keys(updates),
  });

  res.status(200).json({
    success: true,
    message: "Teacher profile updated successfully",
    teacher: updatedTeacher,
  });
});

export { createTeacherProfile, findAll, findOne, update };
