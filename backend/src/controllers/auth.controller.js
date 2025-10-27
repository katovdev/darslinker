import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import Session from "../models/session.model.js";

import {
  parseDeviceInfo,
  getSessionExpiryDate,
  createDeviceFingerprint,
} from "../utils/device.utils.js";

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
 * Check if user exists with the given identifier (email or phone)
 * @route POST /auth/check-user
 * @access Public
 */
async function checkUser(req, res) {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res.status(400).json({
        success: false,
        message: "Identifier is required",
      });
    }

    const isEmail = identifier.includes("@");
    const normalizedIdentifier = isEmail
      ? normalizeEmail(identifier)
      : normalizePhone(identifier);

    const existingUser = await User.findOne({
      [isEmail ? "email" : "phone"]: normalizedIdentifier,
    });

    if (existingUser) {
      return res.status(200).json({
        success: true,
        exists: true,
        next: "login",
        message: "User found. Please enter your password in a login endpoint",
      });
    } else {
      return res.status(200).json({
        success: true,
        exists: false,
        next: "register",
        message: "User not found. Please complete registration",
      });
    }
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while checking the user",
      error: error.message,
    });
  }
}

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

    // Create user based on role using discriminator models
    const userRole = role || "student";
    let newUser;

    if (userRole === "student") {
      newUser = await Student.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "student",
        status: "pending",
      });
    } else if (userRole === "teacher") {
      newUser = await Teacher.create({
        firstName,
        lastName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "teacher",
        status: "pending",
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Must be 'student' or 'teacher'",
      });
    }

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
      users: userResponse,
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

    return res.status(200).json({
      success: true,
      message: "OTP Code verified successfully",
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
 * User login with email address or phone number and password
 * @route POST /auth/login
 * @access Public
 */
async function login(req, res) {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Identifier and password are required",
      });
    }

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

    const isPasswordMatch = await bcrypt.compare(
      password,
      existingUser.password
    );

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    if (existingUser.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account not active. Please verify your account first",
      });
    }

    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceFingerprint = createDeviceFingerprint(deviceInfo);

    const activeSessions = await Session.find({
      userId: existingUser._id,
    }).sort({ createdAt: 1 });

    if (activeSessions.length >= 2) {
      const oldestSession = activeSessions[0];
      await Session.deleteOne({ _id: oldestSession._id });
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

    const sessionData = {
      userId: existingUser._id,
      ipAddress: req.ip,
      deviceInfo: deviceInfo,
      deviceFingerprint: deviceFingerprint,
      userAgent: req.headers["user-agent"],
      token: refreshToken,
      expiresAt: getSessionExpiryDate(),
    };

    await Session.findOneAndUpdate(
      {
        userId: existingUser._id,
        deviceFingerprint: deviceFingerprint,
      },
      sessionData,
      { upsert: true, new: true }
    );

    return res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while logging in",
      error: error.message,
    });
  }
}

/**
 * Change user password
 * @route PATCH /auth/change-password
 * @access Private (requires authentication)
 */
async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const userId = req.user.userId;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Current password, new password, and confirmation are required",
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "New password and confirmation password do not match",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    const hashedNewPassword = await bcrypt.hash(
      newPassword,
      parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
    );

    user.password = hashedNewPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while changing password",
      error: error.message,
    });
  }
}

async function logout(req, res) {
  try {
    const userId = req.user.userId;

    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceFingerprint = createDeviceFingerprint(deviceInfo);

    const deletedSession = await Session.findOneAndDelete({
      userId: userId,
      deviceFingerprint: deviceFingerprint,
    });

    if (!deletedSession) {
      return res.status(404).json({
        success: false,
        message: "Session not found. You may already be logged out",
      });
    }

    return res
      .status(200)
      .json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "An error occurred while logging out from system",
      error: error.message,
    });
  }
}

export {
  checkUser,
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  changePassword,
  logout,
};
