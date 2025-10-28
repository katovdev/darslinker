import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";
import { validateAndFindById } from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  ValidationError,
} from "../utils/error.utils.js";

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

  if (!teacher.success) {
    if (teacher.error.status === 400) {
      throw new BadRequestError(teacher.error.message);
    } else if (teacher.error.status === 404) {
      throw new NotFoundError(teacher.error.message);
    }
  }

  res.status(200).json({
    success: true,
    teacher: teacher.data,
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

  if (!existingTeacher.success) {
    if (existingTeacher.error.status === 400) {
      throw new BadRequestError(existingTeacher.error.message);
    } else if (existingTeacher.error.status === 404) {
      throw new NotFoundError(existingTeacher.error.message);
    }
  }

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

  if (updates.email && updates.email !== existingTeacher.data.email) {
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

  if (updates.phone && updates.phone !== existingTeacher.data.phone) {
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

  res.status(200).json({
    success: true,
    message: "Teacher profile updated successfully",
    teacher: updatedTeacher,
  });
});

export { findAll, findOne, update };
