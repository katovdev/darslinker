import mongoose, { model } from "mongoose";

import Module from "../models/module.model.js";
import Course from "../models/course.model.js";
import { validateAndFindById, validateObjectId } from "../utils/model.utils.js";

/**
 * Create a new module
 * @route POST /modules
 * @access Private (Teacher/Admin)
 */
async function create(req, res) {
  try {
    const { courseId, title, description, order, durationMinutes } = req.body;

    const course = await validateAndFindById(Course, courseId, "Course");
    if (!course.success) {
      return res
        .status(course.error.status)
        .json({ success: false, message: course.error.message });
    }

    const existingModule = await Module.findOne({
      courseId,
      title: title.trim(),
    });

    if (existingModule) {
      return res.status(409).json({
        success: false,
        message: "A module with this title already exists in this course",
      });
    }

    const module = await Module.create({
      courseId,
      title,
      description,
      order: order || 0,
      durationMinutes: durationMinutes || 0,
    });

    return res.status(200).json({
      success: true,
      message: "Module created successfully",
      module,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while creating module",
      error: error.message,
    });
  }
}

/**
 * Get all modules with filtering and pagination
 * @route GET /modules
 * @access Public
 */
async function findAll(req, res) {
  try {
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
        return res
          .status(validation.error.status)
          .json({ success: false, message: validation.error.message });
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

    return res.status(200).json({
      success: true,
      count: totalCount,
      page: pageNumber,
      totalPages: Math.ceil(totalCount / limitNumber),
      modules,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all modules",
      error: error.message,
    });
  }
}

/**
 * Get single module by ID
 * @route GET /modules/:id
 * @access Public
 */
async function findOne(req, res) {
  try {
    const { id } = req.params;

    const module = await validateAndFindById(Module, id, "Module", {
      populate: "courseId",
    });

    if (!module.success) {
      return res.status(module.error.status).json({
        success: false,
        message: module.error.message,
      });
    }

    return res.status(200).json({
      success: true,
      module: module.data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding module",
      error: error.message,
    });
  }
}

/**
 * Get all modules by course ID
 * @route GET /modules/course/:courseId
 * @access Public
 */
async function findByCourse(req, res) {
  try {
    const { courseId } = req.params;

    const course = await validateAndFindById(Course, courseId, "Course");
    if (!course.success) {
      return res.status(course.error.status).json({
        success: false,
        message: course.error.message,
      });
    }

    const modules = await Module.find({ courseId }).sort({ order: 1 }).lean();

    return res.status(200).json({
      success: true,
      count: modules.length,
      modules,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding modules",
      error: error.message,
    });
  }
}

/**
 * Update module by ID
 * @route PATCH /modules/:id
 * @access Private (Teacher/Admin)
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const existingModule = await validateAndFindById(Module, id, "Module");

    if (!existingModule.success) {
      return res.status(existingModule.error.status).json({
        success: false,
        message: existingModule.error.message,
      });
    }

    if (updateData.title && updateData.title !== existingModule.data.title) {
      const duplicateModule = await Module.findOne({
        courseId: existingModule.data.courseId,
        title: updateData.title.trim(),
        _id: { $ne: id },
      });

      if (duplicateModule) {
        return res.status(409).json({
          success: false,
          message: "A module with this title already exists in this course",
        });
      }
    }

    const module = await Module.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("courseId");

    return res.status(200).json({
      success: true,
      message: "Module updated successfully",
      module,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while updating module",
      error: error.message,
    });
  }
}

/**
 * Delete module by ID
 * @route DELETE /modules/:id
 * @access Private (Teacher/Admin)
 */
async function remove(req, res) {
  try {
    const { id } = req.params;

    const deletedModule = await validateAndFindById(Module, id, "Module");

    if (!deletedModule.success) {
      return res.status(deletedModule.error.status).json({
        success: false,
        message: deletedModule.error.message,
      });
    }

    await Module.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Module deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while deleting module",
      error: error.message,
    });
  }
}

export { create, findAll, findOne, findByCourse, update, remove };
