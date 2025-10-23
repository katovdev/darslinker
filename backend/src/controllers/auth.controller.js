import User from "../models/user.model.js";
import bcrypt from "bcrypt";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";
import { createAndSendOtp } from "../services/otp.service.js";
import { BCRYPT_SALT_ROUNDS } from "../../config/env.js";

/**
 * Register a new user (student or teacher)
 * @route POST /users/register
 * @access Public
 */
async function register(req, res) {
  try {
    const { firstName, lastName, phone, email, password, role } = req.body;

    const normalizedEmail = email ? normalizeEmail(email) : undefined;
    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    const existingUser = await User.findOne({
      $or: [
        email ? { email: email } : null,
        phone ? { phone: phone } : null,
      ].filter(Boolean),
    });

    if (existingUser) {
      const duplicateField = existingUser.email === email ? "email address" : "phone number";
      return res.status(409).json({
        success: false,
        message: `User with this ${duplicateField} already exists`,
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
    );

    const newUser = await User.create({
      firstName,
      lastName,
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      role: role || "student",
      status: "pending", // faqat OTP tasdiqlangach active bo‘ladi
    });

    const identifier = normalizedEmail || normalizedPhone;
    const channel = normalizedEmail ? "email" : "sms";

    await createAndSendOtp({
      identifier,
      purpose: "register",
      channel,
      meta: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    const userResponse = newUser.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message:
        "User registered successfully. OTP has been sent for verification.",
      data: {
        user: userResponse,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyPattern)[0];
      return res.status(409).json({
        success: false,
        message: `User with this ${duplicateField} already exists`,
      });
    }

    if (error.name === "ValidationError") {
      const validationErrors = Object.values(error.errors).map((err) => ({
        field: err.path,
        message: err.message,
      }));
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validationErrors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
}

export { register };
