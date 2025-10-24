import User from "../models/user.model.js";
import mongoose from "mongoose";

async function findAll(req, res) {
  try {
    const teachers = await User.find({ role: "teacher" }).select("-password");

    return res.status(200).json({
      success: true,
      data: {
        count: teachers.length,
        teachers,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all teachers",
      error: error.message,
    });
  }
}

async function findOne(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID format",
      });
    }

    const teacher = await User.findOne({ _id: id, role: "teacher" }).select(
      "-password"
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { teacher },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding only one teacher",
      error: error.message,
    });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID format",
      });
    }

    const forbiddenFields = [
      "password",
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
    ];

    forbiddenFields.forEach((field) => {
      if (updates[field] !== undefined) {
        delete updates[field];
      }
    });

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: "teacher" },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher profile updated successfully",
      data: { teacher },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const errors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    return res.status(400).json({
      success: false,
      message: "An error occurred while updating teachers",
      error: error.message,
    });
  }
}

async function remove(req, res) {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid teacher ID format",
      });
    }

    const teacher = await User.findOneAndUpdate(
      { _id: id, role: "teacher" },
      { $set: { status: "inactive" } },
      { new: true, select: "-password" }
    );

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Teacher account deleted successfully",
      data: { teacher },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while deleting teachers",
      error: error.message,
    });
  }
}

export { findAll, findOne, update, remove };
