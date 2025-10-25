import Teacher from "../models/teacher.model.js";
import User from "../models/user.model.js";

import mongoose from "mongoose";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";

async function findAll(req, res) {
  try {
    const teachers = await Teacher.find().select("-password");

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

    const teacher = await Teacher.findById(id);

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

/**
 * Update teacher profile
 * User can update: firstName, lastName, email, phone, profileImage, bio, specialization, certificates, paymentMethods
 */
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

    const existingTeacher = await Teacher.findById(id);

    if (!existingTeacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
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

    if (updates.email && updates.email !== existingTeacher.email) {
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

    if (updates.phone && updates.phone !== existingTeacher.phone) {
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

    if (updates.certificates !== undefined) {
      if (!Array.isArray(updates.certificates)) {
        return res.status(400).json({
          success: false,
          message: "Certificates must be an array",
        });
      }

      updates.certificates = updates.certificates.filter((cert) => {
        if (!cert || typeof cert !== "object") return false;

        if (cert.title) cert.title = String(cert.title).trim();
        if (cert.issuer) cert.issuer = String(cert.issuer).trim();
        if (cert.url) cert.url = String(cert.url).trim();

        return cert.title && cert.issuer;
      });
    }

    if (updates.paymentMethods !== undefined) {
      if (
        typeof updates.paymentMethods !== "object" ||
        Array.isArray(updates.paymentMethods)
      ) {
        return res.status(400).json({
          success: false,
          message: "Payment methods must be an object",
        });
      }

      const allowedMethods = ["click", "payme", "uzum", "bankAccount"];
      const sanitized = {};

      allowedMethods.forEach((method) => {
        if (updates.paymentMethods[method]) {
          sanitized[method] = String(updates.paymentMethods[method]).trim();
        }
      });

      updates.paymentMethods = sanitized;
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
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
      message: "Teacher profile updated successfully",
      data: { teacher: updatedTeacher },
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
      message: "An error occurred while updating teacher profile",
      error: error.message,
    });
  }
}

export { findAll, findOne, update };
