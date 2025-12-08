import Student from "../models/student.model.js";
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
 * Create a student profile
 * @route POST /students/create-profile
 * @access Private (Authenticated students only)
 */
const createStudentProfile = catchAsync(async (req, res) => {
  const userId = req.user.userId;
  const userRole = req.user.role;

  // Check if user is a student
  if (userRole !== "student") {
    logger.warn("Profile creation failed - User is not a student", {
      userId,
      role: userRole,
    });
    throw new ValidationError("Only students can create student profiles");
  }

  // Check if student profile already exists
  const existingProfile = await Student.findById(userId);
  if (existingProfile) {
    logger.warn("Profile creation failed - Profile already exists", {
      userId,
    });
    throw new ConflictError("Student profile already exists for this user");
  }

  const { profileImage, bio, interests } = req.body;

  // Get user data from User model
  const user = await User.findById(userId);
  if (!user) {
    throw new ValidationError("User not found");
  }

  // Sanitize interests array - remove duplicates and empty values
  let sanitizedInterests = [];
  if (interests && Array.isArray(interests)) {
    sanitizedInterests = [
      ...new Set(
        interests
          .filter((interest) => interest && String(interest).trim())
          .map((interest) => String(interest).trim())
      ),
    ];
  }

  // Create student profile using the existing user ID
  const newStudent = await Student.findByIdAndUpdate(
    userId,
    {
      $set: {
        profileImage: profileImage || "",
        bio: bio || "",
        interests: sanitizedInterests,
      },
    },
    {
      new: true,
      runValidators: true,
      select: "-password",
    }
  );

  logger.info("Student profile created successfully", {
    studentId: userId,
    interestsCount: sanitizedInterests.length,
  });

  res.status(201).json({
    success: true,
    message: "Student profile created successfully",
    student: newStudent,
  });
});

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

  logger.info("Student profile updated", {
    studentId: id,
    updatedFields: Object.keys(updates),
  });

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

  logger.info("Student account deleted", {
    studentId: id,
  });

  res.status(200).json({
    success: true,
    message: "Student account deleted successfully",
  });
});

/**
 * Save quiz result for student
 * @route POST /students/:id/quiz-result
 * @access Public
 */
const saveQuizResult = catchAsync(async (req, res) => {
  const { id } = req.params;
  const {
    lessonId,
    courseId,
    attemptNumber,
    score,
    totalQuestions,
    correctAnswers,
    passed,
    answers,
    timeElapsed
  } = req.body;

  logger.info("💾 Attempting to save quiz result", {
    studentId: id,
    lessonId,
    attemptNumber,
    score,
    passed
  });

  // Try to find user first (could be any role)
  const User = (await import("../models/user.model.js")).default;
  const user = await User.findById(id);
  
  if (!user) {
    logger.error("❌ User not found in database", { userId: id });
    throw new ValidationError(`User not found with ID: ${id}`);
  }
  
  logger.info("✅ User found", {
    userId: id,
    userName: `${user.firstName} ${user.lastName}`,
    userRole: user.role
  });

  // Find student (discriminator model)
  const student = await Student.findById(id);
  
  if (!student) {
    logger.error("❌ Student profile not found", { 
      userId: id,
      userRole: user.role 
    });
    throw new ValidationError(`Student profile not found. User role: ${user.role}`);
  }
  
  logger.info("✅ Student profile found", {
    studentId: id,
    studentName: `${student.firstName} ${student.lastName}`
  });

  // Initialize testResults array if it doesn't exist
  if (!student.testResults) {
    student.testResults = [];
  }

  // Create quiz result object
  const quizResult = {
    lessonId,
    courseId,
    attemptNumber: attemptNumber || 1,
    score,
    totalQuestions,
    correctAnswers,
    passed,
    answers,
    timeElapsed,
    date: new Date()
  };

  // Add to testResults array
  student.testResults.push(quizResult);
  await student.save();

  logger.info("✅ Quiz result saved", {
    studentId: id,
    lessonId,
    attemptNumber,
    score,
    passed,
    passedType: typeof passed,
    quizResultPassed: quizResult.passed
  });

  res.status(200).json({
    success: true,
    message: "Quiz result saved successfully",
    result: quizResult
  });
});

/**
 * Enroll student in a course
 * @route POST /students/:id/enroll/:courseId
 * @access Public
 */
const enrollInCourse = catchAsync(async (req, res) => {
  const { id, courseId } = req.params;

  // Import Course model
  const Course = (await import('../models/course.model.js')).default;

  // Find student
  const student = await Student.findById(id);
  if (!student) {
    throw new ValidationError("Student not found");
  }

  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ValidationError("Course not found");
  }

  // Check if already enrolled
  if (course.enrolledStudents && course.enrolledStudents.includes(id)) {
    return res.status(200).json({
      success: true,
      message: "Student already enrolled in this course",
      alreadyEnrolled: true
    });
  }

  // Add student to course's enrolledStudents array
  if (!course.enrolledStudents) {
    course.enrolledStudents = [];
  }
  course.enrolledStudents.push(id);
  course.totalStudents = course.enrolledStudents.length;
  await course.save();

  logger.info("Student enrolled in course", {
    studentId: id,
    courseId,
    totalStudents: course.totalStudents
  });

  res.status(200).json({
    success: true,
    message: "Successfully enrolled in course",
    alreadyEnrolled: false,
    totalStudents: course.totalStudents
  });
});

/**
 * Check if student is enrolled in a course
 * @route GET /students/:id/check-enrollment/:courseId
 * @access Public
 */
const checkEnrollment = catchAsync(async (req, res) => {
  const { id, courseId } = req.params;

  // Import Course model
  const Course = (await import('../models/course.model.js')).default;

  // Find course
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ValidationError("Course not found");
  }

  // Check if enrolled
  const isEnrolled = course.enrolledStudents && course.enrolledStudents.includes(id);

  res.status(200).json({
    success: true,
    isEnrolled,
    totalStudents: course.enrolledStudents ? course.enrolledStudents.length : 0
  });
});

/**
 * Mark lesson as complete and update progress
 * @route POST /students/:id/complete-lesson
 * @access Public
 */
const completeLesson = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { courseId, lessonId } = req.body;

  const student = await Student.findById(id);
  if (!student) {
    throw new ValidationError("Student not found");
  }

  // Import Course model
  const Course = (await import('../models/course.model.js')).default;
  const course = await Course.findById(courseId);
  if (!course) {
    throw new ValidationError("Course not found");
  }

  // Find or create course progress
  let courseProgress = student.courseProgress.find(cp => cp.courseId.toString() === courseId);
  
  if (!courseProgress) {
    courseProgress = {
      courseId,
      completedLessons: [],
      lastAccessedLesson: lessonId,
      progressPercentage: 0,
      startedAt: new Date(),
      lastAccessedAt: new Date()
    };
    student.courseProgress.push(courseProgress);
  }

  // Add lesson to completed if not already there
  if (!courseProgress.completedLessons.includes(lessonId)) {
    courseProgress.completedLessons.push(lessonId);
  }

  // Update last accessed
  courseProgress.lastAccessedLesson = lessonId;
  courseProgress.lastAccessedAt = new Date();

  // Calculate progress percentage
  let totalLessons = 0;
  course.modules.forEach(module => {
    if (module.lessons) {
      totalLessons += module.lessons.length;
    }
  });

  courseProgress.progressPercentage = totalLessons > 0 
    ? Math.round((courseProgress.completedLessons.length / totalLessons) * 100)
    : 0;

  await student.save();

  logger.info("Lesson completed", {
    studentId: id,
    courseId,
    lessonId,
    progress: courseProgress.progressPercentage
  });

  res.status(200).json({
    success: true,
    message: "Lesson marked as complete",
    progress: courseProgress.progressPercentage,
    completedLessons: courseProgress.completedLessons.length,
    totalLessons
  });
});

/**
 * Get course progress for student
 * @route GET /students/:id/progress/:courseId
 * @access Public
 */
const getCourseProgress = catchAsync(async (req, res) => {
  const { id, courseId } = req.params;

  const student = await Student.findById(id);
  if (!student) {
    throw new ValidationError("Student not found");
  }

  const courseProgress = student.courseProgress.find(cp => cp.courseId.toString() === courseId);

  if (!courseProgress) {
    return res.status(200).json({
      success: true,
      progress: {
        progressPercentage: 0,
        completedLessons: [],
        lastAccessedLesson: null
      }
    });
  }

  res.status(200).json({
    success: true,
    progress: courseProgress
  });
});

/**
 * Get quiz attempts for a student and lesson
 * @route GET /students/:id/quiz-attempts/:lessonId
 * @access Public
 */
const getQuizAttempts = catchAsync(async (req, res) => {
  const { id, lessonId } = req.params;

  const student = await Student.findById(id).select('testResults');
  
  if (!student) {
    return res.status(200).json({
      success: true,
      attempts: []
    });
  }

  // Filter results for this specific lesson
  const lessonResults = student.testResults.filter(
    r => r.lessonId && r.lessonId.toString() === lessonId.toString()
  );
  
  // Sort by attempt number
  lessonResults.sort((a, b) => a.attemptNumber - b.attemptNumber);

  logger.info("Quiz attempts retrieved", {
    studentId: id,
    lessonId,
    attemptsCount: lessonResults.length
  });

  res.status(200).json({
    success: true,
    attempts: lessonResults
  });
});

export { createStudentProfile, findAll, findOne, update, remove, saveQuizResult, enrollInCourse, checkEnrollment, completeLesson, getCourseProgress, getQuizAttempts };
