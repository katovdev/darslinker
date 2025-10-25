import Student from "../models/student.model.js";
import User from "../models/user.model.js";
import mongoose from "mongoose";
import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";

async function findAll(req, res) {
  try {
    const students = await Student.find({ role: "student" }).select(
      "-password"
    );

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

    const student = await Student.findById(id);

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

/**
 * Update student profile
 * User can update: firstName, lastName, email, phone, profileImage, bio, interests, dateOfBirth
 */
async function update(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;

    // 1. Validate student ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid student ID format",
      });
    }

    const existingStudent = await Student.findById(id);

    if (!existingStudent) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
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
      "_id",
      "__v",
      "__t",
      "createdAt",
      "updatedAt",
    ];

    forbiddenFields.forEach((field) => {
      if (updates[field] !== undefined) {
        delete updates[field];
      }
    });

    if (updates.email && updates.email !== existingStudent.email) {
      const normalizedEmail = normalizeEmail(updates.email);

      const emailExists = await User.findOne({
        email: normalizedEmail,
        _id: { $ne: id },
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: "This email is already in use by another user",
        });
      }

      updates.email = normalizedEmail;
    }

    if (updates.phone && updates.phone !== existingStudent.phone) {
      const normalizedPhone = normalizePhone(updates.phone);

      const phoneExists = await User.findOne({
        phone: normalizedPhone,
        _id: { $ne: id },
      });

      if (phoneExists) {
        return res.status(409).json({
          success: false,
          message: "This phone number is already in use by another user",
        });
      }

      updates.phone = normalizedPhone;
    }

    if (updates.interests !== undefined) {
      if (!Array.isArray(updates.interests)) {
        return res.status(400).json({
          success: false,
          message: "Interests must be an array",
        });
      }

      updates.interests = [
        ...new Set(
          updates.interests
            .filter((interest) => interest && String(interest).trim())
            .map((interest) => String(interest).trim())
        ),
      ];
    }

    if (updates.dateOfBirth) {
      const birthDate = new Date(updates.dateOfBirth);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (isNaN(birthDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Invalid date format for dateOfBirth",
        });
      }

      if (age < 5 || age > 100) {
        return res.status(400).json({
          success: false,
          message: "Age must be between 5 and 100 years",
        });
      }
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
        select: "-password",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Student profile updated successfully",
      data: { student: updatedStudent },
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

    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `This ${field} is already in use`,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating student profile",
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

    const student = await Student.findByIdAndDelete(id);

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
