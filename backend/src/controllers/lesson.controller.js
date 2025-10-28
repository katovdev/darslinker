import mongoose from "mongoose";

import Lesson from "../models/lesson.model.js";
import Module from "../models/module.model.js";

import { validateAndFindById, validateObjectId } from "../utils/model.utils.js";

/**
 * Create a new lesson
 * @route POST /lessons
 * @access Private (Teacher/Admin)
 */
async function create(req, res) {
  try {
    const { moduleId, title, content, videoUrl, order, durationMinutes } =
      req.body;

    const findModule = await validateAndFindById(Module, moduleId, "Module");
    if (!findModule.success) {
      return res
        .status(findModule.error.status)
        .json({ success: false, message: findModule.error.message });
    }

    const lesson = await Lesson.create({
      moduleId,
      title,
      content,
      videoUrl,
      order: order || 0,
      durationMinutes: durationMinutes || 0,
    });

    return res
      .status(200)
      .json({ success: true, message: "Lesson created successfully", lesson });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while creating lessons",
      error: error.message,
    });
  }
}

/**
 * Get all lessons with filtering and pagination
 * @route GET /lessons
 * @access Public
 */
async function findAll(req, res) {
  try {
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
        return res
          .status(validation.error.status)
          .json({ success: false, message: validation.error.message });
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

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      lessons,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all lessons",
      error: error.message,
    });
  }
}

/**
 * Get single lesson by ID
 * @route GET /lessons/:id
 * @access Public
 */
async function findOne(req, res) {
  try {
    const { id } = req.params;

    const lesson = await validateAndFindById(Lesson, id, "Lesson", {
      populate: "moduleId",
    });
    if (!lesson.success) {
      return res
        .status(lesson.error.status)
        .json({ success: false, message: lesson.error.message });
    }

    return res.status(200).json({ success: true, lesson: lesson.data });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding lesson",
      error: error.message,
    });
  }
}

/**
 * Get all lessons by module ID
 * @route GET /lessons/module/:moduleId
 * @access Public
 */
async function findByModule(req, res) {
  try {
    const { moduleId } = req.params;

    const module = await validateAndFindById(Module, moduleId, "Module");
    if (!module.success) {
      return res
        .status(module.error.status)
        .json({ success: false, message: module.error.message });
    }

    const lessons = await Lesson.find({ moduleId })
      .populate("moduleId")
      .sort({ order: 1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: lessons.length,
      lessons,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding lessons",
      error: error.message,
    });
  }
}

/**
 * Update lesson by ID
 * @route PATCH /lessons/:id
 * @access Private (Teacher/Admin)
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingLesson = await validateAndFindById(Lesson, id, "Lesson", {
      populate: "moduleId",
    });
    if (!existingLesson.success) {
      return res
        .status(existingLesson.error.status)
        .json({ success: false, message: existingLesson.error.message });
    }

    if (updateData.title && updateData.title !== existingLesson.data.title) {
      const duplicateLesson = await Lesson.findOne({
        moduleId: existingLesson.data.moduleId,
        title: updateData.title.trim(),
        _id: { $ne: id },
      });

      if (duplicateLesson) {
        return res.status(409).json({
          success: false,
          message: "A lesson with this title already exists in this module",
        });
      }
    }

    const lesson = await Lesson.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("moduleId");

    return res
      .status(200)
      .json({ success: true, message: "Lesson updated successfully", lesson });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while updating lesson",
      error: error.message,
    });
  }
}

/**
 * Delete lesson by ID
 * @route DELETE /lessons/:id
 * @access Private (Teacher/Admin)
 */
async function remove(req, res) {
  try {
    const { id } = req.params;

    const deletedLesson = await validateAndFindById(Lesson, id, "Lesson");
    if (!deletedLesson.success) {
      return res
        .status(deletedLesson.error.status)
        .json({ success: false, message: deletedLesson.error.message });
    }

    await Lesson.findByIdAndDelete(id);

    return res
      .status(200)
      .json({ success: true, message: "Lesson deleted successfully" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while deleting lesson",
      error: error.message,
    });
  }
}

export { create, findAll, findOne, findByModule, update, remove };
