import SubAdmin from "../models/sub-admin.model.js";
import Teacher from "../models/teacher.model.js";
import Course from "../models/course.model.js";
import Student from "../models/student.model.js";
import jwt from "jsonwebtoken";
import logger from "../../config/logger.js";

import {
  JWT_ACCESS_TOKEN_SECRET_KEY,
  JWT_REFRESH_TOKEN_SECRET_KEY,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_EXPIRES_IN
} from "../../config/env.js";

import { normalizePhone } from "../utils/normalize.utils.js";
import {
  handleValidationResult,
  validateAndFindById,
} from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  ConflictError,
  ValidationError,
  UnauthorizedError,
  NotFoundError
} from "../utils/error.utils.js";

/**
 * Create a sub-admin
 * @route POST /teachers/:teacherId/sub-admins
 * @access Private (Teacher only)
 */
export const createSubAdmin = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const { fullName, phone, password, permissions } = req.body;

  // Validate teacher exists
  const teacher = await validateAndFindById(Teacher, teacherId, "Teacher");
  const teacherData = handleValidationResult(teacher);

  // Check if teacher can add more sub-admins (max 3)
  const canAdd = await SubAdmin.checkTeacherLimit(teacherId);
  if (!canAdd) {
    const currentCount = await SubAdmin.getTeacherSubAdminCount(teacherId);
    throw new ValidationError(
      `Maximum sub-admin limit reached. You can only have 3 sub-admins (currently: ${currentCount})`
    );
  }

  // Normalize inputs
  const normalizedPhone = normalizePhone(phone);

  // Check if phone already exists
  const existingSubAdmin = await SubAdmin.findOne({
    phone: normalizedPhone
  });

  if (existingSubAdmin) {
    throw new ConflictError("A sub-admin with this phone number already exists");
  }

  // Create new sub-admin
  const newSubAdmin = new SubAdmin({
    fullName: fullName.trim(),
    phone: normalizedPhone,
    password,
    teacher: teacherId,
    permissions: permissions || {
      canViewStudents: true,
      canViewCourses: true,
      canViewReports: false,
    },
  });

  await newSubAdmin.save();

  logger.info("Sub-admin created successfully", {
    subAdminId: newSubAdmin._id,
    teacherId,
    fullName: newSubAdmin.fullName,
    phone: newSubAdmin.phone,
  });

  res.status(201).json({
    success: true,
    message: "Sub-admin created successfully",
    subAdmin: newSubAdmin,
  });
});

/**
 * Get all sub-admins for a teacher
 * @route GET /teachers/:teacherId/sub-admins
 * @access Private (Teacher only)
 */
export const getTeacherSubAdmins = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const {
    search,
    isActive,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    order = "desc"
  } = req.query;

  // Validate teacher exists
  const teacher = await validateAndFindById(Teacher, teacherId, "Teacher");
  handleValidationResult(teacher);

  // Build query
  const query = { teacher: teacherId };

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
    ];
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = order === 'asc' ? 1 : -1;

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get sub-admins with pagination
  const [subAdmins, totalCount] = await Promise.all([
    SubAdmin.find(query)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('teacher', 'firstName lastName'),
    SubAdmin.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.status(200).json({
    success: true,
    message: "Sub-admins retrieved successfully",
    data: {
      subAdmins,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    },
  });
});

/**
 * Get a specific sub-admin
 * @route GET /sub-admins/:id
 * @access Private (Teacher only or Sub-admin owner)
 */
export const getSubAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const subAdmin = await SubAdmin.findById(id).populate('teacher', 'firstName lastName');

  if (!subAdmin) {
    throw new NotFoundError("Sub-admin not found");
  }

  res.status(200).json({
    success: true,
    message: "Sub-admin retrieved successfully",
    subAdmin,
  });
});

/**
 * Update a sub-admin
 * @route PUT /sub-admins/:id
 * @access Private (Teacher only)
 */
export const updateSubAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const subAdmin = await SubAdmin.findById(id);
  if (!subAdmin) {
    throw new NotFoundError("Sub-admin not found");
  }

  // If phone is being updated, check for conflicts
  if (updates.phone) {
    updates.phone = normalizePhone(updates.phone);

    const existingSubAdmin = await SubAdmin.findOne({
      phone: updates.phone,
      _id: { $ne: id }
    });

    if (existingSubAdmin) {
      throw new ConflictError("A sub-admin with this phone number already exists");
    }
  }

  // Update sub-admin
  const updatedSubAdmin = await SubAdmin.findByIdAndUpdate(
    id,
    { $set: updates },
    { new: true, runValidators: true }
  ).populate('teacher', 'firstName lastName');

  logger.info("Sub-admin updated successfully", {
    subAdminId: id,
    updatedFields: Object.keys(updates),
  });

  res.status(200).json({
    success: true,
    message: "Sub-admin updated successfully",
    subAdmin: updatedSubAdmin,
  });
});

/**
 * Update sub-admin password
 * @route PUT /sub-admins/:id/password
 * @access Private (Teacher or Sub-admin owner)
 */
export const updateSubAdminPassword = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  const subAdmin = await SubAdmin.findById(id);
  if (!subAdmin) {
    throw new NotFoundError("Sub-admin not found");
  }

  // Update password (will be hashed by the pre-save middleware)
  subAdmin.password = newPassword;
  await subAdmin.save();

  logger.info("Sub-admin password updated successfully", {
    subAdminId: id,
  });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
  });
});

/**
 * Delete a sub-admin
 * @route DELETE /sub-admins/:id
 * @access Private (Teacher only)
 */
export const deleteSubAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;

  const subAdmin = await SubAdmin.findById(id);
  if (!subAdmin) {
    throw new NotFoundError("Sub-admin not found");
  }

  await SubAdmin.findByIdAndDelete(id);

  logger.info("Sub-admin deleted successfully", {
    subAdminId: id,
    teacherId: subAdmin.teacher,
  });

  res.status(200).json({
    success: true,
    message: "Sub-admin deleted successfully",
  });
});

/**
 * Sub-admin login
 * @route POST /sub-admins/login
 * @access Public
 */
export const loginSubAdmin = catchAsync(async (req, res) => {
  const { phone, password } = req.body;

  const normalizedPhone = normalizePhone(phone);

  // Find sub-admin by phone
  const subAdmin = await SubAdmin.findOne({
    phone: normalizedPhone,
    isActive: true
  }).populate('teacher', 'firstName lastName');

  if (!subAdmin) {
    throw new UnauthorizedError("Invalid phone number or password");
  }

  // Check password
  const isPasswordValid = await subAdmin.comparePassword(password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid phone number or password");
  }

  // Update login info
  await subAdmin.updateLoginInfo();

  // Generate tokens
  const accessToken = jwt.sign(
    {
      userId: subAdmin._id,
      role: "subadmin",
      teacherId: subAdmin.teacher._id,
    },
    JWT_ACCESS_TOKEN_SECRET_KEY,
    { expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    {
      userId: subAdmin._id,
      role: "subadmin",
      teacherId: subAdmin.teacher._id,
    },
    JWT_REFRESH_TOKEN_SECRET_KEY,
    { expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN }
  );

  logger.info("Sub-admin logged in successfully", {
    subAdminId: subAdmin._id,
    teacherId: subAdmin.teacher._id,
    loginCount: subAdmin.loginCount,
  });

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      accessToken,
      refreshToken,
      user: {
        id: subAdmin._id,
        fullName: subAdmin.fullName,
        email: subAdmin.email,
        phone: subAdmin.phone,
        role: "subadmin",
        teacher: subAdmin.teacher,
        permissions: subAdmin.permissions,
        lastLogin: subAdmin.lastLogin,
      },
    },
  });
});

/**
 * Get sub-admin dashboard statistics
 * @route GET /sub-admins/:id/dashboard
 * @access Private (Sub-admin only)
 */
export const getSubAdminDashboard = catchAsync(async (req, res) => {
  const { id } = req.params;

  const subAdmin = await SubAdmin.findById(id).populate('teacher');
  if (!subAdmin) {
    throw new NotFoundError("Sub-admin not found");
  }

  const teacherId = subAdmin.teacher._id;

  // Get teacher's course statistics
  const [
    totalCourses,
    totalStudents,
    recentCourses,
    recentStudents
  ] = await Promise.all([
    Course.countDocuments({ teacher: teacherId }),
    Student.countDocuments({ 'enrolledCourses.course': { $in: await Course.find({ teacher: teacherId }).distinct('_id') } }),
    Course.find({ teacher: teacherId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title description thumbnail createdAt'),
    Student.find({ 'enrolledCourses.course': { $in: await Course.find({ teacher: teacherId }).distinct('_id') } })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('firstName lastName email profileImage enrolledCourses')
  ]);

  const dashboardData = {
    statistics: {
      totalCourses,
      totalStudents,
    },
    teacher: {
      id: subAdmin.teacher._id,
      firstName: subAdmin.teacher.firstName,
      lastName: subAdmin.teacher.lastName,
      specialization: subAdmin.teacher.specialization,
    },
    recentCourses,
    recentStudents: recentStudents.slice(0, 5), // Limit to 5 for dashboard
    subAdmin: {
      fullName: subAdmin.fullName,
      permissions: subAdmin.permissions,
      lastLogin: subAdmin.lastLogin,
    },
  };

  res.status(200).json({
    success: true,
    message: "Dashboard data retrieved successfully",
    data: dashboardData,
  });
});