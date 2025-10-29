import Course from "../models/course.model.js";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../../config/cloudinary.js";
import fs from "fs";
import { promisify } from "util";
import { validateAndFindById } from "../utils/model.utils.js";
import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/error.utils.js";

const unlinkAsync = promisify(fs.unlink);

/**
 * Create a new course
 * @route POST /courses
 * @access Private (Teacher/Admin)
 */
const create = catchAsync(async (req, res) => {
  const {
    title,
    shortDescription,
    fullDescription,
    category,
    level,
    language,
    duration,
    courseImage,
    videoUrl,
    courseType,
    coursePrice,
    discountPrice,
  } = req.body;

  const existingCourse = await Course.findOne({ title: title.trim() });
  if (existingCourse) {
    throw new ConflictError("A course with this title already exists");
  }

  const newCourse = await Course.create({
    title,
    shortDescription,
    fullDescription,
    category,
    level,
    language,
    duration,
    courseImage,
    videoUrl: videoUrl || "",
    courseType: courseType || "free",
    coursePrice: Number(coursePrice),
    discountPrice: discountPrice ? Number(discountPrice) : null,
  });

  res.status(200).json({
    success: true,
    message: "Course created successfully",
    data: newCourse,
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
    level,
    courseType,
    language,
    search,
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

  if (level) {
    filter.level = level;
  }

  if (courseType) {
    filter.courseType = courseType;
  }

  if (language) {
    filter.language = { $regex: language, $options: "i" };
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { shortDescription: { $regex: search, $options: "i" } },
      { fullDescription: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const totalCount = await Course.countDocuments(filter);

  const courses = await Course.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  res.status(200).json({
    success: true,
    count: totalCount,
    page: pageNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    courses,
  });
});

/**
 * Get single course by ID
 * @route GET /courses/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const course = await validateAndFindById(Course, id, "Course");
  if (!course.success) {
    if (course.error.status === 400) {
      throw new BadRequestError(course.error.message);
    } else if (course.error.status === 404) {
      throw new NotFoundError(course.error.message);
    }
  }

  res.status(200).json({
    success: true,
    data: course.data,
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
  if (!course.success) {
    throw new NotFoundError("Course not found");
  }

  if (updateData.title && updateData.title !== course.data.title) {
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

  res.status(200).json({
    success: true,
    message: "Course updated successfully",
    data: updatedCourse,
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
  if (!deletedCourse.success) {
    throw new NotFoundError("Course not found");
  }

  await Course.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Course deleted successfully",
  });
});

/**
 * Upload course image to Cloudinary
 * @route POST /courses/upload-image
 * @access Private (Teacher/Admin)
 */
const uploadImage = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No image file provided");
  }

  const uploadResult = await uploadToCloudinary(req.file.path, "courses");

  await unlinkAsync(req.file.path);

  if (!uploadResult.success) {
    throw new BadRequestError("Failed to upload image to Cloudinary");
  }

  res.status(200).json({
    success: true,
    message: "Image uploaded successfully",
    data: {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    },
  });
});

/**
 * Upload course video to Cloudinary
 * @route POST /courses/upload-video
 * @access Private (Teacher/Admin)
 */
const uploadVideo = catchAsync(async (req, res) => {
  if (!req.file) {
    throw new BadRequestError("No video file provided");
  }

  const uploadResult = await uploadVideoToCloudinary(
    req.file.path,
    "course-videos"
  );

  await unlinkAsync(req.file.path);

  if (!uploadResult.success) {
    throw new BadRequestError("Failed to upload video to Cloudinary");
  }

  res.status(200).json({
    success: true,
    message: "Video uploaded successfully",
    data: {
      url: uploadResult.url,
      public_id: uploadResult.public_id,
    },
  });
});

export { create, findAll, findOne, update, remove, uploadImage, uploadVideo };
