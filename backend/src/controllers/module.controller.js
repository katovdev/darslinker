import Module from "../models/module.model.js";
import Course from "../models/course.model.js";
import { validateAndFindById, validateObjectId } from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/error.utils.js";

/**
 * Create a new module
 * @route POST /modules
 * @access Private (Teacher/Admin)
 */
const create = catchAsync(async (req, res) => {
  const { courseId, title, description, order, durationMinutes } = req.body;

  const course = await validateAndFindById(Course, courseId, "Course");
  if (!course.success) {
    if (course.error.status === 400) {
      throw new BadRequestError(course.error.message);
    } else if (course.error.status === 404) {
      throw new NotFoundError(course.error.message);
    }
  }

  const existingModule = await Module.findOne({
    courseId,
    title: title.trim(),
  });

  if (existingModule) {
    throw new ConflictError(
      "A module with this title already exists in this course"
    );
  }

  const module = await Module.create({
    courseId,
    title,
    description,
    order: order || 0,
    durationMinutes: durationMinutes || 0,
  });

  res.status(200).json({
    success: true,
    message: "Module created successfully",
    module,
  });
});

/**
 * Get all modules with filtering and pagination
 * @route GET /modules
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const {
    courseId,
    search,
    page = 1,
    limit = 20,
    sortBy = "order",
    order = "asc",
  } = req.query;

  const filter = {};

  if (courseId) {
    const validation = validateObjectId(courseId, "Course");
    if (!validation.valid) {
      if (validation.error.status === 400) {
        throw new BadRequestError(validation.error.message);
      } else if (validation.error.status === 404) {
        throw new NotFoundError(validation.error.message);
      }
    }
    filter.courseId = courseId;
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

  const totalCount = await Module.countDocuments(filter);

  const modules = await Module.find(filter)
    .populate("courseId")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  res.status(200).json({
    success: true,
    count: totalCount,
    page: pageNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    modules,
  });
});

/**
 * Get single module by ID
 * @route GET /modules/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const module = await validateAndFindById(Module, id, "Module", {
    populate: "courseId",
  });

  if (!module.success) {
    if (module.error.status === 400) {
      throw new BadRequestError(module.error.message);
    } else if (module.error.status === 404) {
      throw new NotFoundError(module.error.message);
    }
  }

  res.status(200).json({
    success: true,
    module: module.data,
  });
});

/**
 * Get all modules by course ID
 * @route GET /modules/course/:courseId
 * @access Public
 */
const findByCourse = catchAsync(async (req, res) => {
  const { courseId } = req.params;

  const course = await validateAndFindById(Course, courseId, "Course");
  if (!course.success) {
    if (course.error.status === 400) {
      throw new BadRequestError(course.error.message);
    } else if (course.error.status === 404) {
      throw new NotFoundError(course.error.message);
    }
  }

  const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();

  res.status(200).json({
    success: true,
    count: modules.length,
    modules,
  });
});

/**
 * Update module by ID
 * @route PATCH /modules/:id
 * @access Private (Teacher/Admin)
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingModule = await validateAndFindById(Module, id, "Module");

  if (!existingModule.success) {
    if (existingModule.error.status === 400) {
      throw new BadRequestError(existingModule.error.message);
    } else if (existingModule.error.status === 404) {
      throw new NotFoundError(existingModule.error.message);
    }
  }

  if (updateData.title && updateData.title !== existingModule.data.title) {
    const duplicateModule = await Module.findOne({
      courseId: existingModule.data.courseId,
      title: updateData.title.trim(),
      _id: { $ne: id },
    });

    if (duplicateModule) {
      throw new ConflictError(
        "A module with this title already exists in this course"
      );
    }
  }

  const module = await Module.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("courseId");

  res.status(200).json({
    success: true,
    message: "Module updated successfully",
    module,
  });
});

/**
 * Delete module by ID
 * @route DELETE /modules/:id
 * @access Private (Teacher/Admin)
 */
const remove = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedModule = await validateAndFindById(Module, id, "Module");

  if (!deletedModule.success) {
    if (deletedModule.error.status === 400) {
      throw new BadRequestError(deletedModule.error.message);
    } else if (deletedModule.error.status === 404) {
      throw new NotFoundError(deletedModule.error.message);
    }
  }

  await Module.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Module deleted successfully",
  });
});

export { create, findAll, findOne, findByCourse, update, remove };
