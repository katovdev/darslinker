import User from "../models/user.model.js";
import mongoose from "mongoose";

async function findAll(req, res) {
  try {
    const students = await User.find({ role: "student" }).select("-password");

    return res.status(200).json({
      success: true,
      data: {
        count: students.length,
        students,
      },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding all students",
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
        message: "Invalid student ID format",
      });
    }

    const student = await User.findOne({ _id: id, role: "student" }).select(
      "-password"
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { student },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while finding only one student",
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
        message: "Invalid student ID format",
      });
    }

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
    ];

    forbiddenFields.forEach((field) => {
      if (updates[field] !== undefined) {
        delete updates[field];
      }
    });

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    ).populate("enrolledCourses", "title category level");

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: { student },
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
      message: "An error occurred while updating students",
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
        message: "Invalid student ID format",
      });
    }

    const student = await User.findOneAndUpdate(
      { _id: id, role: "student" },
      { $set: { status: "inactive" } },
      { new: true, select: "-password" }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Student account deleted successfully",
      data: { student },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while deleting students",
      error: error.message,
    });
  }
}

export { findAll, findOne, update, remove };
