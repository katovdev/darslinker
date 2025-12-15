import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Student from "../models/student.model.js";
import logger from "../../config/logger.js";
import bcrypt from "bcrypt";

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

  const teacher = await Teacher.findById(id)
    .populate({
      path: 'landingPageSettings.featuredCourses',
      select: 'title description thumbnail courseType price discountPrice category totalLessons rating totalStudents enrolledStudents'
    })
    .select('-password');

  if (!teacher) {
    throw new Error("Teacher not found");
  }

  const teacherData = teacher.toObject();

  // Debug: Log raw teacher data before processing
  logger.info("🔍 Raw teacher data from database", {
    teacherId: id,
    hasLandingPageSettings: !!teacherData.landingPageSettings,
    landingPageSettings: JSON.stringify(teacherData.landingPageSettings),
    featuredCoursesRaw: teacherData.landingPageSettings?.featuredCourses
  });

  // Also get landing settings if they exist
  const Landing = (await import("../models/landing.model.js")).default;
  const landingSettings = await Landing.findOne({ teacher: id });
  
  // Add landing settings to teacher data
  if (landingSettings) {
    teacherData.primaryColor = landingSettings.primaryColor;
    teacherData.landingSettings = landingSettings;
  }

  // Add featured courses to teacher data for backward compatibility
  if (teacherData.landingPageSettings?.featuredCourses && teacherData.landingPageSettings.featuredCourses.length > 0) {
    // Use featured courses if they are selected
    teacherData.courses = teacherData.landingPageSettings.featuredCourses;
    logger.info("🎓 Featured courses added to teacher data", {
      teacherId: id,
      coursesCount: teacherData.courses.length,
      courses: teacherData.courses
    });
  } else {
    // If no featured courses, get all active courses from this teacher
    logger.info("⚠️ No featured courses found, loading all active courses", {
      teacherId: id,
      landingPageSettings: JSON.stringify(teacherData.landingPageSettings),
      featuredCoursesLength: teacherData.landingPageSettings?.featuredCourses?.length || 0
    });
    
    const Course = (await import("../models/course.model.js")).default;
    const allCourses = await Course.find({ 
      teacher: id, 
      status: 'active' 
    }).select('title description thumbnail courseType price discountPrice category totalLessons rating totalStudents enrolledStudents');
    
    teacherData.courses = allCourses;
    
    logger.info("✅ All active courses loaded", {
      teacherId: id,
      coursesCount: allCourses.length
    });
  }

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
    certificatesReceived: updates.certificates ? JSON.stringify(updates.certificates) : 'undefined',
    certificatesLength: updates.certificates ? updates.certificates.length : 0,
    landingPageSettings: updates.landingPageSettings ? JSON.stringify(updates.landingPageSettings) : 'undefined',
    featuredCoursesCount: updates.landingPageSettings?.featuredCourses?.length || 0,
    timestamp: new Date().toISOString()
  });

  const existingTeacher = await validateAndFindById(Teacher, id, "Teacher");
  const existingTeacherData = handleValidationResult(existingTeacher);

  // Handle password update separately - update User model directly
  let passwordUpdated = false;
  if (updates.password) {
    const { BCRYPT_SALT_ROUNDS } = await import('../../config/env.js');
    const saltRounds = parseInt(BCRYPT_SALT_ROUNDS || "10", 10);
    const hashedPassword = await bcrypt.hash(updates.password, saltRounds);
    
    // Update password in User model directly
    await User.findByIdAndUpdate(id, { password: hashedPassword });
    passwordUpdated = true;
    
    // Remove password from updates to avoid conflicts
    delete updates.password;
    
    logger.info("🔐 Password updated directly in User model for teacher", { 
      teacherId: id, 
      saltRounds,
      hashedPassword: hashedPassword.substring(0, 10) + "..." 
    });
  }

  const forbiddenFields = [
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
    logger.info("📋 Processing certificates update", {
      certificatesBeforeValidation: JSON.stringify(updates.certificates),
      isArray: Array.isArray(updates.certificates)
    });

    if (!Array.isArray(updates.certificates)) {
      throw new ValidationError("Certificates must be an array");
    }

    const originalLength = updates.certificates.length;
    updates.certificates = updates.certificates.filter((cert) => {
      if (!cert || typeof cert !== "object") {
        logger.info("📋 Filtering out invalid cert:", cert);
        return false;
      }

      if (cert.title) cert.title = String(cert.title).trim();
      if (cert.issuer) cert.issuer = String(cert.issuer).trim();
      if (cert.url) cert.url = String(cert.url).trim();

      const isValid = cert.title && cert.issuer;
      if (!isValid) {
        logger.info("📋 Filtering out cert without title/issuer:", cert);
      }
      return isValid;
    });

    logger.info("📋 Certificates after processing", {
      originalLength,
      processedLength: updates.certificates.length,
      processedCertificates: JSON.stringify(updates.certificates)
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

  // Process landingPageSettings
  if (updates.landingPageSettings !== undefined) {
    logger.info("🎨 Processing landingPageSettings", {
      teacherId: id,
      landingPageSettings: JSON.stringify(updates.landingPageSettings),
      featuredCoursesCount: updates.landingPageSettings.featuredCourses?.length || 0,
      featuredCourses: updates.landingPageSettings.featuredCourses
    });
  }

  logger.info("🔄 About to update teacher with data:", {
    teacherId: id,
    updateFields: Object.keys(updates),
    passwordWasUpdatedSeparately: passwordUpdated
  });

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    id,
    { $set: updates },
    {
      new: true,
      runValidators: true,
      select: "-password",
    }
  );

  // If password was updated, verify it was saved correctly
  if (passwordUpdated) {
    const userWithPassword = await User.findById(id).select('+password');
    logger.info("🔐 Password update verification", {
      teacherId: id,
      passwordHashLength: userWithPassword.password ? userWithPassword.password.length : 0,
      passwordHashPrefix: userWithPassword.password ? userWithPassword.password.substring(0, 10) : 'none',
      passwordUpdated: !!userWithPassword.password
    });
  }

  logger.info("✅ Teacher profile updated successfully", {
    teacherId: id,
    updatedFields: Object.keys(updates),
    newBioValue: updatedTeacher?.bio,
    savedCertificates: updatedTeacher?.certificates ? JSON.stringify(updatedTeacher.certificates) : 'undefined',
    savedCertificatesLength: updatedTeacher?.certificates ? updatedTeacher.certificates.length : 0,
    savedLandingPageSettings: updatedTeacher?.landingPageSettings ? JSON.stringify(updatedTeacher.landingPageSettings) : 'undefined',
    savedFeaturedCoursesCount: updatedTeacher?.landingPageSettings?.featuredCourses?.length || 0,
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
  console.log('🔍 Searching courses for teacher ID:', teacherData._id);
  console.log('🔍 Teacher ID type:', typeof teacherData._id);

  // First, let's see all courses for this teacher
  const allCourses = await Course.find({ teacher: teacherData._id });
  console.log('📚 Found courses:', allCourses.length);
  if (allCourses.length > 0) {
    console.log('📚 First course:', {
      title: allCourses[0].title,
      teacher: allCourses[0].teacher,
      enrolledStudents: allCourses[0].enrolledStudents?.length || 0
    });
  }
  
  const courseStats = await Course.aggregate([
    { $match: { teacher: teacherData._id } },
    {
      $addFields: {
        enrolledCount: { $size: { $ifNull: ["$enrolledStudents", []] } }
      }
    },
    {
      $group: {
        _id: null,
        totalCourses: { $sum: 1 },
        totalEnrollments: { $sum: "$enrolledCount" },
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
  const recentCourses = await Course.find({ teacher: teacherData._id })
    .sort({ createdAt: -1 })
    .limit(5)
    .select("title description price enrollmentCount status createdAt");

  // Get monthly earnings (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyEarnings = await Course.aggregate([
    {
      $match: {
        teacher: teacherData._id,
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
        reviewsCount: teacherData.reviewsCount || 0,
        certificates: teacherData.certificates || []
      }
    }
  });
});

/**
 * Get teacher's public landing page data
 * @route GET /teachers/:id/landing-page
 * @access Public
 */
const getLandingPageData = catchAsync(async (req, res) => {
  const { id } = req.params;

  logger.info("🌐 Getting landing page data", {
    teacherId: id,
    timestamp: new Date().toISOString()
  });

  const teacher = await validateAndFindById(Teacher, id, "Teacher");
  const teacherData = handleValidationResult(teacher);

  // Check if landing page is published
  if (!teacherData.landingPageSettings?.isPublished) {
    logger.warn("Landing page not published", {
      teacherId: id
    });

    return res.status(404).json({
      success: false,
      message: "Landing page not found or not published"
    });
  }

  // Get featured courses with details
  let featuredCourses = [];
  if (teacherData.landingPageSettings.featuredCourses && teacherData.landingPageSettings.featuredCourses.length > 0) {
    const Course = (await import("../models/course.model.js")).default;
    featuredCourses = await Course.find({
      _id: { $in: teacherData.landingPageSettings.featuredCourses },
      status: 'published'
    }).select('title description price enrollmentCount thumbnailImage rating createdAt');
  }

  // Get featured testimonials (reviews)
  let featuredTestimonials = [];
  if (teacherData.landingPageSettings.featuredTestimonials && teacherData.landingPageSettings.featuredTestimonials.length > 0) {
    // For now, use teacher's reviews until we have a separate Review model
    featuredTestimonials = teacherData.reviews.filter(review =>
      teacherData.landingPageSettings.featuredTestimonials.includes(review._id.toString())
    ).slice(0, 5);
  }

  const landingPageData = {
    teacher: {
      _id: teacherData._id,
      firstName: teacherData.firstName,
      lastName: teacherData.lastName,
      email: teacherData.email,
      profileImage: teacherData.profileImage,
      specialization: teacherData.specialization,
      bio: teacherData.bio,
      city: teacherData.city,
      country: teacherData.country,
      ratingAverage: teacherData.ratingAverage || 0,
      reviewsCount: teacherData.reviewsCount || 0,
      socialLinks: teacherData.socialLinks || {},
      certificates: teacherData.certificates || [],
      joinedAt: teacherData.createdAt
    },
    featuredCourses,
    featuredTestimonials,
    themeColor: teacherData.landingPageSettings.themeColor || '#7c3aed',
    stats: {
      totalCourses: teacherData.courseCount || 0,
      totalStudents: teacherData.studentCount || 0,
      averageRating: teacherData.ratingAverage || 0,
      totalReviews: teacherData.reviewsCount || 0
    }
  };

  logger.info("✅ Landing page data retrieved successfully", {
    teacherId: id,
    coursesCount: featuredCourses.length,
    testimonialsCount: featuredTestimonials.length
  });

  res.status(200).json({
    success: true,
    data: landingPageData
  });
});

/**
 * Update teacher's landing page settings
 * @route PUT /teachers/:id/landing-page
 * @access Private (Teacher only)
 */
const updateLandingPageSettings = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  logger.info("🔧 Updating landing page settings", {
    teacherId: id,
    updatesReceived: Object.keys(updates),
    timestamp: new Date().toISOString()
  });

  const teacher = await validateAndFindById(Teacher, id, "Teacher");
  const existingTeacher = handleValidationResult(teacher);

  // Prepare landing page settings update
  const landingPageUpdates = {};

  if (updates.featuredCourses !== undefined) {
    if (!Array.isArray(updates.featuredCourses)) {
      throw new ValidationError("Featured courses must be an array");
    }
    if (updates.featuredCourses.length > 6) {
      throw new ValidationError("Maximum 6 featured courses allowed");
    }
    landingPageUpdates.featuredCourses = updates.featuredCourses;
  }

  if (updates.featuredTestimonials !== undefined) {
    if (!Array.isArray(updates.featuredTestimonials)) {
      throw new ValidationError("Featured testimonials must be an array");
    }
    if (updates.featuredTestimonials.length > 5) {
      throw new ValidationError("Maximum 5 featured testimonials allowed");
    }
    landingPageUpdates.featuredTestimonials = updates.featuredTestimonials;
  }

  if (updates.themeColor !== undefined) {
    if (typeof updates.themeColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(updates.themeColor)) {
      throw new ValidationError("Theme color must be a valid hex color (e.g., #7c3aed)");
    }
    landingPageUpdates.themeColor = updates.themeColor;
  }

  // Prepare main profile updates
  const profileUpdates = {};

  if (updates.firstName !== undefined) profileUpdates.firstName = updates.firstName;
  if (updates.lastName !== undefined) profileUpdates.lastName = updates.lastName;
  if (updates.specialization !== undefined) profileUpdates.specialization = updates.specialization;
  if (updates.bio !== undefined) profileUpdates.bio = updates.bio;

  if (updates.socialLinks !== undefined) {
    if (typeof updates.socialLinks !== 'object') {
      throw new ValidationError("Social links must be an object");
    }
    profileUpdates.socialLinks = {
      ...existingTeacher.socialLinks,
      ...updates.socialLinks
    };
  }

  // Combine updates
  const finalUpdates = {
    ...profileUpdates
  };

  if (Object.keys(landingPageUpdates).length > 0) {
    finalUpdates.landingPageSettings = {
      ...existingTeacher.landingPageSettings,
      ...landingPageUpdates
    };
  }

  // Update teacher profile
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    id,
    { $set: finalUpdates },
    {
      new: true,
      runValidators: true,
      select: "-password"
    }
  );

  logger.info("✅ Landing page settings updated successfully", {
    teacherId: id,
    updatedFields: Object.keys(finalUpdates),
    timestamp: new Date().toISOString()
  });

  res.status(200).json({
    success: true,
    message: "Landing page settings updated successfully",
    teacher: updatedTeacher
  });
});

/**
 * Publish or unpublish teacher's landing page
 * @route POST /teachers/:id/landing-page/publish
 * @access Private (Teacher only)
 */
const publishLandingPage = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isPublished } = req.body;

  if (typeof isPublished !== 'boolean') {
    throw new ValidationError("isPublished must be a boolean value");
  }

  logger.info("📢 Publishing/unpublishing landing page", {
    teacherId: id,
    isPublished,
    timestamp: new Date().toISOString()
  });

  const teacher = await validateAndFindById(Teacher, id, "Teacher");
  const existingTeacher = handleValidationResult(teacher);

  // Update publish status
  const updatedTeacher = await Teacher.findByIdAndUpdate(
    id,
    {
      $set: {
        'landingPageSettings.isPublished': isPublished,
        'landingPageSettings.publishedAt': isPublished ? new Date() : null
      }
    },
    {
      new: true,
      runValidators: true,
      select: "-password"
    }
  );

  const action = isPublished ? 'published' : 'unpublished';

  logger.info(`✅ Landing page ${action} successfully`, {
    teacherId: id,
    isPublished
  });

  res.status(200).json({
    success: true,
    message: `Landing page ${action} successfully`,
    teacher: {
      _id: updatedTeacher._id,
      landingPageSettings: updatedTeacher.landingPageSettings
    }
  });
});

/**
 * Get students registered through teacher's landing page
 * @route GET /teachers/:teacherId/students
 * @access Private (Authenticated teachers only)
 */
const getTeacherStudents = catchAsync(async (req, res) => {
  const teacherId = req.params.teacherId || req.user.userId;

  logger.info("📊 Getting students for teacher", { teacherId });

  // Validate teacher existence
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ValidationError("Teacher not found");
  }

  // Check if requesting user is the teacher or has proper access
  if (req.user.userId !== teacherId && req.user.role !== 'admin') {
    throw new ValidationError("Access denied");
  }

  // Import Student model dynamically
  const Student = (await import("../models/student.model.js")).default;

  // Find students linked to this teacher
  const students = await Student.find({ teacherId })
    .select('firstName lastName phone createdAt')
    .sort({ createdAt: -1 });

  // Map students with their _id (first 5 chars will be used as display ID)
  const studentsWithIds = students.map((student) => {
    return {
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      phone: student.phone,
      registrationDate: student.createdAt,
      studentId: student._id,
      _id: student._id
    };
  });

  logger.info("✅ Students retrieved successfully", {
    teacherId,
    studentCount: studentsWithIds.length
  });

  res.status(200).json({
    success: true,
    message: "Students retrieved successfully",
    data: {
      teacher: {
        id: teacher._id,
        name: `${teacher.firstName} ${teacher.lastName}`
      },
      students: studentsWithIds,
      totalStudents: studentsWithIds.length
    }
  });
});

/**
 * Get quiz analytics for teacher's courses
 * @route GET /teachers/:teacherId/quiz-analytics
 * @access Private (Teacher only)
 */
const getQuizAnalytics = catchAsync(async (req, res) => {
  const { teacherId } = req.params;
  const { courseId, lessonId } = req.query;

  logger.info("📊 Getting quiz analytics", { teacherId, courseId, lessonId });

  // Validate teacher
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) {
    throw new ValidationError("Teacher not found");
  }

  // Import models
  const Course = (await import("../models/course.model.js")).default;
  const Student = (await import("../models/student.model.js")).default;

  // Build query for courses
  const courseQuery = { teacher: teacherId };
  if (courseId) {
    courseQuery._id = courseId;
  }

  // Get teacher's courses
  const courses = await Course.find(courseQuery);
  
  if (courses.length === 0) {
    return res.status(200).json({
      success: true,
      data: {
        courses: [],
        analytics: []
      }
    });
  }

  const courseIds = courses.map(c => c._id);

  // Get all students who have taken quizzes in these courses
  const students = await Student.find({
    'testResults.courseId': { $in: courseIds }
  }).select('firstName lastName testResults');

  // Process quiz results
  const analytics = [];

  students.forEach(student => {
    student.testResults.forEach(result => {
      // Filter by course and lesson if specified
      if (courseId && result.courseId.toString() !== courseId) return;
      if (lessonId && result.lessonId.toString() !== lessonId) return;
      
      // Check if course belongs to this teacher
      if (!courseIds.some(id => id.toString() === result.courseId.toString())) return;

      // Skip results with invalid data (null/undefined score)
      if (result.score === null || result.score === undefined) {
        logger.warn("⚠️ Skipping quiz result with null/undefined score", {
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          lessonId: result.lessonId,
          attemptNumber: result.attemptNumber
        });
        return;
      }

      // Calculate passed if not set (for old data)
      let isPassed = result.passed;
      if (isPassed === undefined || isPassed === null) {
        isPassed = result.score >= 70;
      }

      analytics.push({
        studentId: student._id,
        studentName: `${student.firstName} ${student.lastName}`,
        courseId: result.courseId,
        lessonId: result.lessonId,
        attemptNumber: result.attemptNumber || 1,
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        passed: isPassed,
        timeElapsed: result.timeElapsed,
        date: result.date,
        answers: result.answers
      });
    });
  });

  // Group by student and lesson to show only latest attempt
  const latestAttempts = {};
  analytics.forEach(item => {
    const key = `${item.studentId}_${item.lessonId}`;
    if (!latestAttempts[key] || item.attemptNumber > latestAttempts[key].attemptNumber) {
      latestAttempts[key] = item;
    }
  });

  // Convert back to array and sort by date
  const finalAnalytics = Object.values(latestAttempts).sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );

  // Calculate summary statistics
  const passedCount = finalAnalytics.filter(a => a.passed === true).length;
  const totalCount = finalAnalytics.length;
  const passRate = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  logger.info("✅ Quiz analytics retrieved", {
    teacherId,
    totalResults: analytics.length,
    latestAttempts: finalAnalytics.length,
    passedCount,
    totalCount,
    passRate,
    samplePassed: finalAnalytics.slice(0, 3).map(a => ({ passed: a.passed, score: a.score }))
  });

  res.status(200).json({
    success: true,
    data: {
      courses: courses.map(c => ({
        _id: c._id,
        title: c.title
      })),
      analytics: finalAnalytics,
      summary: {
        totalAttempts: analytics.length, // All attempts, not just latest
        uniqueStudents: new Set(finalAnalytics.map(a => a.studentId.toString())).size,
        averageScore: finalAnalytics.length > 0 
          ? Math.round(finalAnalytics.reduce((sum, a) => sum + a.score, 0) / finalAnalytics.length)
          : 0,
        passRate: passRate
      }
    }
  });
});

// Export moved to end of file

/**
 * Get all teachers for moderator panel
 * @route GET /teachers
 * @access Private (Admin/Moderator only)
 */
const getAllTeachersForModerator = catchAsync(async (req, res) => {
  logger.info('📚 Fetching all teachers for moderator panel');

  try {
    // Get all users with teacher role
    const teachers = await User.find({ role: 'teacher' })
      .select('firstName lastName email phone createdAt isActive')
      .sort({ createdAt: -1 });

    // Get additional stats for each teacher
    const teachersWithStats = await Promise.all(
      teachers.map(async (teacher) => {
        try {
          // Get teacher profile
          const teacherProfile = await Teacher.findById(teacher._id);
          
          // Get courses count
          const coursesCount = await Course.countDocuments({ teacher: teacher._id });
          
          // Get students count - check for students who have enrolled in this teacher's courses
          const teacherCourses = await Course.find({ teacher: teacher._id }).select('enrolledStudents');
          
          // Count unique students across all courses
          const uniqueStudentIds = new Set();
          teacherCourses.forEach(course => {
            if (course.enrolledStudents && course.enrolledStudents.length > 0) {
              course.enrolledStudents.forEach(studentId => {
                uniqueStudentIds.add(studentId.toString());
              });
            }
          });
          
          const studentsCount = uniqueStudentIds.size;
          
          return {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            createdAt: teacher.createdAt,
            isActive: teacher.isActive,
            bio: teacherProfile?.bio || '',
            specialization: teacherProfile?.specialization || '',
            coursesCount: coursesCount,
            studentsCount: studentsCount,
            totalViews: 0, // You can add this later
          };
        } catch (error) {
          logger.error('Error getting teacher stats:', error);
          return {
            _id: teacher._id,
            firstName: teacher.firstName,
            lastName: teacher.lastName,
            email: teacher.email,
            phone: teacher.phone,
            createdAt: teacher.createdAt,
            isActive: teacher.isActive,
            coursesCount: 0,
            studentsCount: 0,
            totalViews: 0,
          };
        }
      })
    );

    logger.info(`📚 Successfully fetched ${teachersWithStats.length} teachers`);

    res.status(200).json({
      success: true,
      message: 'Teachers fetched successfully',
      data: teachersWithStats,
      total: teachersWithStats.length
    });

  } catch (error) {
    logger.error('❌ Error fetching teachers:', error);
    throw error;
  }
});

/**
 * Get detailed teacher information for moderator
 * @route GET /teachers/:id/details
 * @access Private (Admin/Moderator only)
 */
const getTeacherDetailsForModerator = catchAsync(async (req, res) => {
  const { id } = req.params;
  
  logger.info('👤 Fetching teacher details for moderator:', { teacherId: id });

  try {
    // Get teacher user info
    const teacher = await User.findById(id).select('firstName lastName email phone createdAt isActive');
    
    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Get teacher profile
    const teacherProfile = await Teacher.findById(id);

    // Get teacher's courses
    const courses = await Course.find({ teacher: id })
      .select('title description price createdAt enrolledStudents')
      .sort({ createdAt: -1 });

    // Get teacher's students - find students enrolled in this teacher's courses
    const teacherCourses = await Course.find({ teacher: id })
      .select('_id enrolledStudents')
      .populate('enrolledStudents', 'firstName lastName email phone createdAt');
    
    // Debug log
    logger.info('🔍 Teacher courses found:', { teacherId: id, coursesCount: teacherCourses.length });
    
    // Extract all unique students from all courses
    const allStudents = [];
    const studentIds = new Set();
    
    teacherCourses.forEach(course => {
      if (course.enrolledStudents && course.enrolledStudents.length > 0) {
        course.enrolledStudents.forEach(student => {
          if (!studentIds.has(student._id.toString())) {
            studentIds.add(student._id.toString());
            allStudents.push(student);
          }
        });
      }
    });
    
    const students = allStudents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
    logger.info('🔍 Students found:', { studentsCount: students.length, students: students.map(s => ({ name: s.firstName + ' ' + s.lastName, id: s._id })) });

    const teacherDetails = {
      _id: teacher._id,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      email: teacher.email,
      phone: teacher.phone,
      createdAt: teacher.createdAt,
      isActive: teacher.isActive,
      bio: teacherProfile?.bio || '',
      specialization: teacherProfile?.specialization || '',
      profileImage: teacherProfile?.profileImage || '',
      city: teacherProfile?.city || '',
      country: teacherProfile?.country || '',
      courses: courses.map(course => ({
        ...course.toObject(),
        studentsCount: course.enrolledStudents ? course.enrolledStudents.length : 0
      })) || [],
      students: students || [],
      totalViews: 0,
      totalRevenue: 0,
    };

    logger.info('👤 Successfully fetched teacher details');

    res.status(200).json({
      success: true,
      message: 'Teacher details fetched successfully',
      data: teacherDetails
    });

  } catch (error) {
    logger.error('❌ Error fetching teacher details:', error);
    throw error;
  }
});

export {
  createTeacherProfile,
  findAll,
  findOne,
  update,
  getDashboardStats,
  getLandingPageData,
  updateLandingPageSettings,
  publishLandingPage,
  getTeacherStudents,
  getQuizAnalytics,
  getAllTeachersForModerator,
  getTeacherDetailsForModerator
};