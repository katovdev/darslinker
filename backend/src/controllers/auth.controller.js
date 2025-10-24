import User from "../models/user.model.js";
import bcrypt from "bcrypt";

import { normalizeEmail, normalizePhone } from "../utils/normalize.utils.js";
import {
  createAndSendOtp,
  resendOtp,
  verifyOtp,
} from "../services/otp.service.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token.utils.js";
import { BCRYPT_SALT_ROUNDS } from "../../config/env.js";

/**
 * Register a new user (student or teacher)
 * @route POST /auth/register
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
      const duplicateField =
        existingUser.email === email ? "email address" : "phone number";
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
      status: "pending",
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
        "User registered successfully. OTP has been sent for verification",
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

    return res.status(400).json({
      success: false,
      message: "An error occurred while registering the user",
      error: error.message,
    });
  }
}

/**
 * Verify register otp code with user email address or phone number
 * @route POST /auth/verify-registration-otp
 * @access Public
 */
async function verifyRegistrationOtp(req, res) {
  try {
    const { identifier, otp } = req.body;

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Identifier (email or phone) and OTP Code are required",
      });
    }

    const result = await verifyOtp({ identifier, otp, purpose: "register" });

    if (!result.success) {
      let status = 400;
      if (result.message.includes("expired")) status = 410;
      if (result.message.includes("Too many")) status = 429;
      return res.status(status).json({
        success: false,
        message: result.message,
      });
    }

    const userResponse = result?.data?.toObject();
    delete userResponse.password;

    return res.status(200).json({
      success: true,
      message: "OTP Code verified successfully",
      data: { user: userResponse },
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while verifying an registration otp code",
      error: error.message,
    });
  }
}

/**
 * Resend registration otp
 * @route POST /auth/resent-registration-otp
 * @access Public
 */
async function resendRegistrationOtp(req, res) {
  try {
    const { email, phone } = req.body;

    // Validate that at least one identifier is provided
    if (!email && !phone) {
      return res.status(400).json({
        success: false,
        message: "Either email or phone number is required",
      });
    }

    const normalizedEmail = email ? normalizeEmail(email) : undefined;
    const normalizedPhone = phone ? normalizePhone(phone) : undefined;

    const identifier = normalizedEmail || normalizedPhone;
    const channel = normalizedEmail ? "email" : "sms";

    // Check if user exists with this identifier
    const existingUser = await User.findOne({
      $or: [
        email ? { email: normalizedEmail } : null,
        phone ? { phone: normalizedPhone } : null,
      ].filter(Boolean),
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email or phone number",
      });
    }

    // Check if user is already active (OTP already verified)
    if (existingUser.status === "active") {
      return res.status(400).json({
        success: false,
        message: "User account is already verified. No need to resend OTP Code",
      });
    }

    const result = await resendOtp({
      identifier,
      purpose: "register",
      channel,
      meta: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.message || "Failed to resend OTP Code",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP Code has been resent successfully for verification",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while resending the registration OTP Code",
      error: error.message,
    });
  }
}

/**
 * User login with email address or phone number
 * @route POST /auth/login
 * @access Public
 */
async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    const isEmail = identifier.includes("@");
    const normalizedIdentifier = isEmail
      ? normalizeEmail(identifier)
      : normalizePhone(identifier);

    const existingUser = await User.findOne({
      [isEmail ? "email" : "phone"]: normalizedIdentifier,
    });

    if (!existingUser) {
      return res.status(401).json({
        success: false,
        message: "Invalid email address or phone number",
      });
    }

    if (existingUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account not active. Please verify your account",
      });
    }

    const isMatch = await bcrypt.compare(password, existingUser.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password",
      });
    }

    const tokenPayload = {
      userId: existingUser._id.toString(),
      email: existingUser.email,
      phone: existingUser.phone,
      role: existingUser.role,
      status: existingUser.status,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return res.status(200).json({
      success: true,
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while log in to system",
      error: error.message,
    });
  }
}

export { register, verifyRegistrationOtp, resendRegistrationOtp, login };
