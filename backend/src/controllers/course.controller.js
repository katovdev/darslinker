import Course from "../models/course.model.js";
import {
  uploadToCloudinary,
  uploadVideoToCloudinary,
} from "../../config/cloudinary.js";
import fs from "fs";
import { promisify } from "util";
import { validateAndFindById } from "../utils/model.utils.js";

const unlinkAsync = promisify(fs.unlink);

/**
 * Create a new course
 * @route POST /courses
 * @access Private (Teacher/Admin)
 */
async function create(req, res) {
  try {
    const {
      title,
      shortDesciption,
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
      return res.status(409).json({
        success: false,
        message: "A course with this title already exists",
      });
    }

    const newCourse = await Course.create({
      title: title.trim(),
      shortDesciption: shortDesciption.trim(),
      fullDescription: fullDescription.trim(),
      category: category.trim(),
      level,
      language: language.trim(),
      duration: duration.trim(),
      courseImage,
      videoUrl: videoUrl || "",
      courseType: courseType || "free",
      coursePrice: Number(coursePrice),
      discountPrice: discountPrice ? Number(discountPrice) : null,
    });

    return res.status(200).json({
      success: true,
      message: "Course created successfully",
      data: newCourse,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while creating course",
      error: error.message,
    });
  }
}

/**
 * Get all courses with filtering and pagination
 * @route GET /courses
 * @access Public
 */
async function findAll(req, res) {
  try {
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
        { shortDesciption: { $regex: search, $options: "i" } },
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

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      courses,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all courses",
      error: error.message,
    });
  }
}

/**
 * Get single course by ID
 * @route GET /courses/:id
 * @access Public
 */
async function findOne(req, res) {
  try {
    const { id } = req.params;

    const course = await validateAndFindById(Course, id, "Course");
    if (!course.success) {
      return res
        .status(course.error.status)
        .json({ success: false, message: course.error.message });
    }

    return res.status(200).json({
      success: true,
      message: "Course retrieved successfully",
      data: course.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding only one course",
      error: error.message,
    });
  }
}

/**
 * Update course by ID
 * @route PATCH /courses/:id
 * @access Private (Teacher/Admin)
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const course = await validateAndFindById(Course, id, "Course");
    if (!course.success) {
      return res
        .status(course.error.status)
        .json({ success: false, message: course.error.message });
    }

    if (updateData.title && updateData.title !== course.data.title) {
      const duplicateCourse = await Course.findOne({
        title: updateData.title.trim(),
        _id: { $ne: id },
      });

      if (duplicateCourse) {
        return res.status(409).json({
          success: false,
          message: "A course with this title already exists",
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: updatedCourse,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while updating courses",
      error: error.message,
    });
  }
}

/**
 * Delete course by ID
 * @route DELETE /courses/:id
 * @access Private (Teacher/Admin)
 */
async function remove(req, res) {
  try {
    const { id } = req.params;

    const deletedCourse = await validateAndFindById(Course, id, "Course");
    if (!deletedCourse.success) {
      return res
        .status(deletedCourse.error.status)
        .json({ success: false, message: deletedCourse.error.message });
    }

    await Course.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while deleting courses",
      error: error.message,
    });
  }
}

/**
 * Upload course image to Cloudinary
 * @route POST /courses/upload-image
 * @access Private (Teacher/Admin)
 */
async function uploadImage(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const uploadResult = await uploadToCloudinary(req.file.path, "courses");

    await unlinkAsync(req.file.path);

    if (!uploadResult.success) {
      return res.status(400).json({
        success: false,
        message: "Failed to upload image to Cloudinary",
        error: uploadResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }

    return res.status(400).json({
      success: false,
      message: "An error occurred while uploading image",
      error: error.message,
    });
  }
}

/**
 * Upload course video to Cloudinary
 * @route POST /courses/upload-video
 * @access Private (Teacher/Admin)
 */
async function uploadVideo(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No video file provided",
      });
    }

    const uploadResult = await uploadVideoToCloudinary(
      req.file.path,
      "course-videos"
    );

    await unlinkAsync(req.file.path);

    if (!uploadResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload video to Cloudinary",
        error: uploadResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Video uploaded successfully",
      data: {
        url: uploadResult.url,
        public_id: uploadResult.public_id,
      },
    });
  } catch (error) {
    if (req.file && req.file.path) {
      try {
        await unlinkAsync(req.file.path);
      } catch (unlinkError) {
        console.error("Error deleting temporary file:", unlinkError);
      }
    }

    return res.status(400).json({
      success: false,
      message: "An error occurred while uploading video",
      error: error.message,
    });
  }
}

export { create, findAll, findOne, update, remove, uploadImage, uploadVideo };
