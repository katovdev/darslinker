import Module from "../models/module.model.js";
import Course from "../models/course.model.js";
import {
  handleValidationResult,
  validateAndFindById,
  validateObjectId,
} from "../utils/model.utils.js";

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
  const courseData = handleValidationResult(course);

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
    const validationData = handleValidationResult(validation);
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
  const moduleData = handleValidationResult(module);

  res.status(200).json({
    success: true,
    module: moduleData,
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
  const courseData = handleValidationResult(course);

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
  const existingModuleData = handleValidationResult(existingModule);

  if (updateData.title && updateData.title !== existingModuleData.title) {
    const duplicateModule = await Module.findOne({
      courseId: existingModuleData.courseId,
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
  const deletedModuleData = handleValidationResult(deletedModule);

  await Module.findByIdAndDelete(id);

  res.status(200).json({
    success: true,
    message: "Module deleted successfully",
  });
});

export { create, findAll, findOne, findByCourse, update, remove };
