import mongoose from "mongoose";

import Lesson from "../models/lesson.model.js";
import Module from "../models/module.model.js";

import { validateAndFindById, validateObjectId } from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../utils/error.utils.js";

/**
 * Create a new lesson
 * @route POST /lessons
 * @access Private (Teacher/Admin)
 */
const create = catchAsync(async (req, res) => {
  const { moduleId, title, content, videoUrl, order, durationMinutes } =
    req.body;

  const findModule = await validateAndFindById(Module, moduleId, "Module");
  if (!findModule.success) {
    if (findModule.error.status === 400) {
      throw new BadRequestError(findModule.error.message);
    } else if (findModule.error.status === 404) {
      throw new NotFoundError(findModule.error.message);
    }
  }

  const lesson = await Lesson.create({
    moduleId,
    title,
    content,
    videoUrl,
    order: order || 0,
    durationMinutes: durationMinutes || 0,
  });

  res
    .status(200)
    .json({ success: true, message: "Lesson created successfully", lesson });
});

/**
 * Get all lessons with filtering and pagination
 * @route GET /lessons
 * @access Public
 */
const findAll = catchAsync(async (req, res) => {
  const {
    moduleId,
    search,
    page = 1,
    limit = 20,
    sortBy = "order",
    order = "asc",
  } = req.query;

  const filter = {};

  if (moduleId) {
    const validation = validateObjectId(moduleId, "Module");
    if (!validation.valid) {
      if (validation.error.status === 400) {
        throw new BadRequestError(validation.error.message);
      } else if (validation.error.status === 404) {
        throw new NotFoundError(validation.error.message);
      }
    }
    filter.moduleId = moduleId;
  }

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const sortOrder = order === "asc" ? 1 : -1;
  const sort = { [sortBy]: sortOrder };

  const totalCount = await Lesson.countDocuments(filter);

  const lessons = await Lesson.find(filter)
    .populate("moduleId")
    .sort(sort)
    .skip(skip)
    .limit(limitNumber)
    .lean();

  res.status(200).json({
    success: true,
    count: totalCount,
    page: pageNumber,
    totalPages: Math.ceil(totalCount / limitNumber),
    lessons,
  });
});

/**
 * Get single lesson by ID
 * @route GET /lessons/:id
 * @access Public
 */
const findOne = catchAsync(async (req, res) => {
  const { id } = req.params;

  const lesson = await validateAndFindById(Lesson, id, "Lesson", {
    populate: "moduleId",
  });
  if (!lesson.success) {
    if (lesson.error.status === 400) {
      throw new BadRequestError(lesson.error.message);
    } else if (lesson.error.status === 404) {
      throw new NotFoundError(lesson.error.message);
    }
  }

  res.status(200).json({ success: true, lesson: lesson.data });
});

/**
 * Get all lessons by module ID
 * @route GET /lessons/module/:moduleId
 * @access Public
 */
const findByModule = catchAsync(async (req, res) => {
  const { moduleId } = req.params;

  const module = await validateAndFindById(Module, moduleId, "Module");
  if (!module.success) {
    if (module.error.status === 400) {
      throw new BadRequestError(module.error.message);
    } else if (module.error.status === 404) {
      throw new NotFoundError(module.error.message);
    }
  }

  const lessons = await Lesson.find({ moduleId })
    .populate("moduleId")
    .sort({ order: 1 })
    .lean();

  res.status(200).json({
    success: true,
    count: lessons.length,
    lessons,
  });
});

/**
 * Update lesson by ID
 * @route PATCH /lessons/:id
 * @access Private (Teacher/Admin)
 */
const update = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  const existingLesson = await validateAndFindById(Lesson, id, "Lesson", {
    populate: "moduleId",
  });
  if (!existingLesson.success) {
    if (existingLesson.error.status === 400) {
      throw new BadRequestError(existingLesson.error.message);
    } else if (existingLesson.error.status === 404) {
      throw new NotFoundError(existingLesson.error.message);
    }
  }

  if (updateData.title && updateData.title !== existingLesson.data.title) {
    const duplicateLesson = await Lesson.findOne({
      moduleId: existingLesson.data.moduleId,
      title: updateData.title.trim(),
      _id: { $ne: id },
    });

    if (duplicateLesson) {
      throw new ConflictError(
        "A lesson with this title already exists in this module"
      );
    }
  }

  const lesson = await Lesson.findByIdAndUpdate(
    id,
    { $set: updateData },
    { new: true, runValidators: true }
  ).populate("moduleId");

  res
    .status(200)
    .json({ success: true, message: "Lesson updated successfully", lesson });
});

/**
 * Delete lesson by ID
 * @route DELETE /lessons/:id
 * @access Private (Teacher/Admin)
 */
const remove = catchAsync(async (req, res) => {
  const { id } = req.params;

  const deletedLesson = await validateAndFindById(Lesson, id, "Lesson");
  if (!deletedLesson.success) {
    if (deletedLesson.error.status === 400) {
      throw new BadRequestError(deletedLesson.error.message);
    } else if (deletedLesson.error.status === 404) {
      throw new NotFoundError(deletedLesson.error.message);
    }
  }

  await Lesson.findByIdAndDelete(id);

  res
    .status(200)
    .json({ success: true, message: "Lesson deleted successfully" });
});

export { create, findAll, findOne, findByModule, update, remove };
