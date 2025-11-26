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

  // Debug logging
  logger.info("🔧 Teacher profile update request received", {
    teacherId: id,
    updatesReceived: Object.keys(updates),
    bioValue: updates.bio,
    timestamp: new Date().toISOString()
  });

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

  logger.info("✅ Teacher profile updated successfully", {
    teacherId: id,
    updatedFields: Object.keys(updates),
    newBioValue: updatedTeacher?.bio,
    updateResult: !!updatedTeacher,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: "Teacher profile updated successfully",
    teacher: updatedTeacher,
  });
});

/**
 * Get teacher dashboard statistics
 * @route GET /teachers/:id/dashboard
 * @access Private (Teacher only)
 */
const getDashboardStats = catchAsync(async (req, res) => {
  const { id } = req.params;

  const teacher = await validateAndFindById(Teacher, id, "Teacher");
  const teacherData = handleValidationResult(teacher);

  // Import course model for aggregation
  const Course = (await import("../models/course.model.js")).default;
  const Student = (await import("../models/student.model.js")).default;

  // Get course statistics
  const courseStats = await Course.aggregate([
    { $match: { teacherId: teacher._id } },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        totalEnrollments: { $sum: "$enrollmentCount" },
        totalRevenue: { $sum: "$revenue" },
        averagePrice: { $avg: "$price" },
        activeCourses: {
          $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] }
        },
        draftCourses: {
          $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] }
        }
      }
    }
  ]);

  // Get recent courses
  const recentCourses = await Course.find({ teacherId: teacher._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title description price enrollmentCount status createdAt");

  // Get monthly earnings (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyEarnings = await Course.aggregate([
    {
      $match: {
        teacherId: teacher._id,
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" }
        },
        earnings: { $sum: "$revenue" },
        enrollments: { $sum: "$enrollmentCount" }
      }
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } }
  ]);

  // Calculate performance metrics
  const stats = courseStats[0] || {
    totalCourses: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    averagePrice: 0,
    activeCourses: 0,
    draftCourses: 0
  };

  // Calculate growth rates (simplified - you might want more complex calculations)
  const currentMonth = new Date().getMonth();
  const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const currentMonthData = monthlyEarnings.find(item =>
    item._id.month === currentMonth + 1
  );
  const lastMonthData = monthlyEarnings.find(item =>
    item._id.month === lastMonth + 1
  );

  const revenueGrowth = currentMonthData && lastMonthData
    ? ((currentMonthData.earnings - lastMonthData.earnings) / lastMonthData.earnings) * 100
    : 0;

  const enrollmentGrowth = currentMonthData && lastMonthData
    ? ((currentMonthData.enrollments - lastMonthData.enrollments) / lastMonthData.enrollments) * 100
    : 0;

  logger.info("📊 Dashboard statistics retrieved", {
    teacherId: id,
    totalCourses: stats.totalCourses,
    totalRevenue: stats.totalRevenue,
    teacherBio: teacherData.bio,
    teacherName: `${teacherData.firstName} ${teacherData.lastName}`,
    timestamp: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    data: {
      overview: {
        totalCourses: stats.totalCourses,
        totalStudents: stats.totalEnrollments,
        totalRevenue: stats.totalRevenue,
        averageRating: teacherData.ratingAverage || 0,
        activeCourses: stats.activeCourses,
        draftCourses: stats.draftCourses,
        currentBalance: teacherData.balance || 0
      },
      growth: {
        revenueGrowth: Math.round(revenueGrowth * 100) / 100,
        enrollmentGrowth: Math.round(enrollmentGrowth * 100) / 100,
        ratingTrend: 0 // You can implement rating trend calculation
      },
      recentCourses,
      monthlyEarnings: monthlyEarnings.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        earnings: item.earnings,
        enrollments: item.enrollments
      })),
      teacher: {
        _id: teacherData._id,
        firstName: teacherData.firstName,
        lastName: teacherData.lastName,
        profileImage: teacherData.profileImage,
        specialization: teacherData.specialization,
        bio: teacherData.bio,
        city: teacherData.city,
        country: teacherData.country,
        email: teacherData.email,
        phone: teacherData.phone,
        reviewsCount: teacherData.reviewsCount || 0
      }
    }
  });
});

export { createTeacherProfile, findAll, findOne, update, getDashboardStats };
