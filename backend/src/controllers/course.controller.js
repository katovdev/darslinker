import Course from "../models/course.model.js";
import logger from "../../config/logger.js";
import { uploadImageToR2, uploadVideoToR2 } from "../services/r2-upload.service.js";
import fs from "fs/promises";
import {
  handleValidationResult,
  validateAndFindById,
} from "../utils/model.utils.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import { BadRequestError, ConflictError } from "../utils/error.utils.js";

/**
 * Create a new course
 * @route POST /courses
 * @access Private (Teacher/Admin)
 */
const create = catchAsync(async (req, res) => {
  const {
    title,
    description,
    category,
    thumbnail,
    courseType,
    price,
    discountPrice,
    status,
    modules,
    teacher,
  } = req.body;

  // Debug: Log received modules data
  console.log('🔵 BACKEND: Received modules:', JSON.stringify(modules, null, 2));
  if (modules && modules[0] && modules[0].lessons) {
    console.log('🔵 BACKEND: First lesson:', JSON.stringify(modules[0].lessons[0], null, 2));
    if (modules[0].lessons[0].questions) {
      console.log('🔵 BACKEND: First question:', JSON.stringify(modules[0].lessons[0].questions[0], null, 2));
    }
  }

  const existingCourse = await Course.findOne({ title: title.trim() });
  if (existingCourse) {
    throw new ConflictError("A course with this title already exists");
  }

  // Calculate total lessons
  let totalLessons = 0;
  if (modules && Array.isArray(modules)) {
    modules.forEach(module => {
      if (module.lessons && Array.isArray(module.lessons)) {
        totalLessons += module.lessons.length;
      }
    });
  }

  const course = await Course.create({
    title,
    description,
    category,
    thumbnail,
    courseType: courseType || "free",
    price: courseType === "paid" ? Number(price) : 0,
    discountPrice: discountPrice ? Number(discountPrice) : 0,
    modules: modules || [],
    teacher,
    totalLessons,
    status: status || "draft", // Use provided status or default to draft
  });

  // Debug: Log saved course data
  console.log('🟢 BACKEND: Course saved to DB');
  if (course.modules && course.modules[0] && course.modules[0].lessons) {
    console.log('🟢 BACKEND: First lesson after save:', JSON.stringify(course.modules[0].lessons[0], null, 2));
    if (course.modules[0].lessons[0].questions) {
      console.log('🟢 BACKEND: First question after save:', JSON.stringify(course.modules[0].lessons[0].questions[0], null, 2));
    }
  }

  logger.info("Course created successfully", {
    courseId: course._id,
    title: course.title,
    category: course.category,
    courseType: course.courseType,
    totalLessons,
  });

  res.status(200).json({
    success: true,
    message: "Course created successfully",
    course,
  });
});

/**
 * Get all courses with filtering and pagination
 * @route GET /courses
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const {
    category,
    courseType,
    search,
    teacher,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  if (page < 1) {
    throw new BadRequestError("Page number must be  greater than 0");
  }

  if (limit < 1 || limit > 100) {
    throw new BadRequestError("Limit must be between 1 and 100");
  }

  const filter = {};

  if (category) {
    filter.category = { $regex: category, $options: "i" };
  }

  if (courseType) {
    filter.courseType = courseType;
  }

  if (teacher) {
    filter.teacher = teacher;
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

  const totalCount = await Course.countDocuments(filter);

  const courses = await Course.find(filter)
    .populate('teacher', 'firstName lastName email profileImage')
    .sort(sort)
    .skip(skip)
    .limit(limitNumber);

  // Sync totalStudents for each course and save
  for (const course of courses) {
    if (course.enrolledStudents) {
      course.totalStudents = course.enrolledStudents.length;
      await course.save();
    }
  }

  // Convert to plain objects for response
  const coursesData = courses.map(c => c.toObject());

  res.status(200).json({
    success: true,
    count: totalCount,
    page: pageNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    courses: coursesData,
  });
});

/**
 * Get single course by ID
 * @route GET /courses/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await Course.findById(id)
    .populate('teacher', 'firstName lastName email profileImage specialization');
  
  if (!course) {
    throw new NotFoundError("Course not found");
  }

  // Sync totalStudents with enrolledStudents length
  if (course.enrolledStudents) {
    course.totalStudents = course.enrolledStudents.length;
    await course.save();
  }

  res.status(200).json({
    success: true,
    course: course,
  });
});

/**
 * Update course by ID
 * @route PATCH /courses/:id
 * @access Private (Teacher/Admin)
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const course = await validateAndFindById(Course, id, "Course");
  const courseData = handleValidationResult(course);

  if (updateData.title && updateData.title !== courseData.title) {
    const duplicateCourse = await Course.findOne({
      title: updateData.title.trim(),
      _id: { $ne: id },
    });

    if (duplicateCourse) {
      throw new ConflictError("A course with this title already exists");
    }
  }

  const updatedCourse = await Course.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  );

  logger.info("Course updated successfully", {
    courseId: id,
    updatedFields: Object.keys(updateData),
  });

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    course: updatedCourse,
  });
});

/**
 * Delete course by ID
 * @route DELETE /courses/:id
 * @access Private (Teacher/Admin)
 */
const remove = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedCourse = await validateAndFindById(Course, id, "Course");
  const deletedCourseData = handleValidationResult(deletedCourse);

  await Course.findByIdAndDelete(id);

  logger.info("Course deleted successfully", {
    courseId: id,
    title: deletedCourseData.title,
  });

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

/**
 * Upload course image to R2
 * @route POST /courses/upload-image
 * @access Private (Teacher/Admin)
 */
const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No image file provided");
  }

  try {
    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadImageToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("Course image uploaded to R2", {
      url: url,
    });

    res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: url,
      },
    });
  } catch (error) {
    logger.error("Course image upload failed", {
      error: error.message,
    });
    throw new BadRequestError("Failed to upload image to R2");
  }
});

/**
 * Upload course video to R2
 * @route POST /courses/upload-video
 * @access Private (Teacher/Admin)
 */
const uploadVideo = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No video file provided");
  }

  try {
    // Read file buffer
    const fileBuffer = await fs.readFile(req.file.path);
    
    // Upload to R2
    const url = await uploadVideoToR2(fileBuffer, req.file.originalname, req.file.mimetype);
    
    // Delete temp file
    await fs.unlink(req.file.path);

    logger.info("Course video uploaded to R2", {
      url: url,
    });

    res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: url,
      },
    });
  } catch (error) {
    logger.error("Course video upload failed", {
      error: error.message,
    });
    throw new BadRequestError("Failed to upload video to R2");
  }
});

export { create, findAll, findOne, update, remove, uploadImage, uploadVideo };
