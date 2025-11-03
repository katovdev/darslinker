import bcrypt from "bcrypt";
import logger from "../../config/logger.js";

import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import Session from "../models/session.model.js";

import {
  parseDeviceInfo,
  getSessionExpiryDate,
  createDeviceFingerprint,
} from "../utils/device.utils.js";

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
import {
  handleValidationResult,
  validateAndFindById,
} from "../utils/model.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "../utils/error.utils.js";

/**
 * Check if user exists with the given identifier (email or phone)
 * @route POST /auth/check-user
 * @access Public
 */
const checkUser = catchAsync(async (req, res) => {
  const { identifier } = req.body;

  if (!identifier) {
    throw new BadRequestError("Identifier is required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmail = emailRegex.test(identifier);
  const normalizedIdentifier = isEmail
    ? normalizeEmail(identifier)
    : normalizePhone(identifier);

  logger.info("Checking user existence", {
    identifier: normalizedIdentifier,
    type: isEmail ? "email" : "phone",
  });

  const existingUser = await User.findOne({
    [isEmail ? "email" : "phone"]: normalizedIdentifier,
  });

  if (existingUser) {
    logger.info("User found", {
      userId: existingUser._id,
      identifier: normalizedIdentifier,
    });

    res.status(200).json({
      success: true,
      exists: true,
      next: "login",
      message: "User found. Please enter your password in a login endpoint",
      user: {
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        phone: existingUser.phone
      }
    });
  } else {
    logger.info("User not found - registration required", {
      identifier: normalizedIdentifier,
    });

    res.status(200).json({
      success: true,
      exists: false,
      next: "register",
      message: "User not found. Please complete registration",
    });
  }
});

/**
 * Register a new user (student or teacher)
 * @route POST /auth/register
 * @access Public
 */
const register = catchAsync(async (req, res) => {
  const { firstName, lastName, phone, email, password, role } = req.body;

  const normalizedEmail = email ? normalizeEmail(email) : undefined;
  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  logger.info("User registration attempt", {
    email: normalizedEmail,
    phone: normalizedPhone,
    role: role || "student",
  });

  const existingUser = await User.findOne({
    $or: [
      normalizedEmail ? { email: normalizedEmail } : null,
      normalizedPhone ? { phone: normalizedPhone } : null,
    ].filter(Boolean),
  });

  if (existingUser) {
    const duplicateField =
      existingUser.email === normalizedEmail ? "email address" : "phone number";
    throw new ConflictError(`User with this ${duplicateField} already exists`);
  }

  const hashedPassword = await bcrypt.hash(
    password,
    parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
  );

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
    throw new BadRequestError("Invalid role. Must be 'student' or 'teacher'");
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

  logger.info("User registered successfully - OTP sent", {
    userId: newUser._id,
    email: normalizedEmail,
    phone: normalizedPhone,
    role: userRole,
  });

  res.status(200).json({
    success: true,
    message: "User registered successfully. OTP has been sent for verification",
    user: userResponse,
  });
});

/**
 * Verify register otp code with user email address or phone number
 * @route POST /auth/verify-registration-otp
 * @access Public
 */
const verifyRegistrationOtp = catchAsync(async (req, res) => {
  const { identifier, otp } = req.body;

  if (!identifier || !otp) {
    throw new BadRequestError(
      "Identifier (email or phone) and OTP Code are required"
    );
  }

  const isEmail = identifier.includes("@");
  const normalizedIdentifier = isEmail
    ? normalizeEmail(identifier)
    : normalizePhone(identifier);

  logger.info("OTP verification attempt", {
    identifier: normalizedIdentifier,
    purpose: "register",
  });

  const result = await verifyOtp({
    identifier: normalizedIdentifier,
    otp,
    purpose: "register",
  });

  if (!result.success) {
    logger.warn("OTP verification failed", {
      identifier: normalizedIdentifier,
      reason: result.message,
    });

    if (result.message.includes("expired")) {
      throw new BadRequestError("OTP has expired. Please request a new one");
    }
    if (result.message.includes("Too many")) {
      throw new BadRequestError(
        "Too many failed attempts. Please try again later"
      );
    }
    throw new BadRequestError(result.message);
  }

  logger.info("OTP verified successfully - Account activated", {
    identifier: normalizedIdentifier,
    userId: result.data?.user?._id,
  });

  res.status(200).json({
    success: true,
    message: "OTP Code verified successfully",
  });
});

/**
 * Resend registration otp
 * @route POST /auth/resent-registration-otp
 * @access Public
 */
const resendRegistrationOtp = catchAsync(async (req, res) => {
  const { email, phone } = req.body;

  if (!email && !phone) {
    throw new BadRequestError("Either email or phone number is required");
  }

  const normalizedEmail = email ? normalizeEmail(email) : undefined;
  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  const identifier = normalizedEmail || normalizedPhone;
  const channel = normalizedEmail ? "email" : "sms";

  logger.info("OTP resend requested", {
    identifier,
    channel,
  });

  const existingUser = await User.findOne({
    $or: [
      email ? { email: normalizedEmail } : null,
      phone ? { phone: normalizedPhone } : null,
    ].filter(Boolean),
  });

  if (!existingUser) {
    throw new NotFoundError("No user found with this email or phone number");
  }

  if (existingUser.status === "active") {
    throw new BadRequestError(
      "User account is already verified. No need to resend OTP Code"
    );
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
    logger.error("Failed to resend OTP", {
      identifier,
      error: result.message,
    });
    throw new BadRequestError(result.message || "Failed to resend OTP Code");
  }

  logger.info("OTP resent successfully", {
    identifier,
    channel,
  });

  res.status(200).json({
    success: true,
    message: "OTP Code has been resent successfully for verification",
  });
});

/**
 * User login with email address or phone number and password
 * @route POST /auth/login
 * @access Public
 */
const login = catchAsync(async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    throw new ValidationError("Identifier and password are required");
  }

  const isEmail = identifier.includes("@");
  const normalizedIdentifier = isEmail
    ? normalizeEmail(identifier)
    : normalizePhone(identifier);

  logger.info("Login attempt", {
    identifier: normalizedIdentifier,
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const existingUser = await User.findOne({
    [isEmail ? "email" : "phone"]: normalizedIdentifier,
  });

  if (!existingUser) {
    logger.warn("Login failed - User not found", {
      identifier: normalizedIdentifier,
      ip: req.ip,
    });
    throw new UnauthorizedError("Invalid email address or phone number");
  }

  const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

  if (!isPasswordMatch) {
    logger.warn("Login failed - Invalid password", {
      userId: existingUser._id,
      identifier: normalizedIdentifier,
      ip: req.ip,
    });
    throw new UnauthorizedError("Invalid credentials");
  }
  if (existingUser.status !== "active") {
    logger.warn("Login failed - Account not active", {
      userId: existingUser._id,
      status: existingUser.status,
      ip: req.ip,
    });
    throw new ForbiddenError(
      "Account not active. Please verify your account first"
    );
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

  logger.info("Login successful", {
    userId: existingUser._id,
    email: existingUser.email,
    role: existingUser.role,
    deviceType: deviceInfo.type,
    ip: req.ip,
  });

  // Prepare user response (without password)
  const userResponse = {
    _id: existingUser._id,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    email: existingUser.email,
    phone: existingUser.phone,
    role: existingUser.role,
    status: existingUser.status,
  };

  res.status(200).json({
    success: true,
    message: "Logged in successfully",
    accessToken,
    refreshToken,
    user: userResponse,
  });
});

/**
 * Change user password
 * @route PATCH /auth/change-password
 * @access Private (requires authentication)
 */
const changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;
  const userId = req.user.userId;

  logger.info("Password change attempt", {
    userId,
  });

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new ValidationError(
      "Current password, new password, and confirmation are required"
    );
  }

  if (newPassword !== confirmPassword) {
    throw new BadRequestError(
      "New password and confirmation password do not match"
    );
  }

  if (currentPassword === newPassword) {
    throw new BadRequestError(
      "New password must be different from current password"
    );
  }

  const result = await validateAndFindById(User, userId, "User");
  const resultData = handleValidationResult(result);

  const user = resultData;

  const isCurrentPasswordValid = await bcrypt.compare(
    currentPassword,
    user.password
  );

  if (!isCurrentPasswordValid) {
    throw new UnauthorizedError("Current password is incorrect");
  }

  const hashedNewPassword = await bcrypt.hash(
    newPassword,
    parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
  );

  user.password = hashedNewPassword;
  await user.save();

  logger.info("Password changed successfully", {
    userId,
    email: user.email,
  });

  res.status(200).json({
    success: true,
    message: "Password changed successfully",
  });
});

/**
 * User logout
 * @route POST /auth/logout
 * @access Private (requires authentication)
 */
const logout = catchAsync(async (req, res) => {
  const userId = req.user.userId;

  logger.info("Logout attempt", {
    userId,
    ip: req.ip,
  });

  const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
  const deviceFingerprint = createDeviceFingerprint(deviceInfo);

  const deletedSession = await Session.findOneAndDelete({
    userId: userId,
    deviceFingerprint: deviceFingerprint,
  });

  if (!deletedSession) {
    logger.warn("Logout failed - Session not found", {
      userId,
      deviceFingerprint,
    });
    throw new NotFoundError("Session not found. You may already be logged out");
  }

  logger.info("Logout successful", {
    userId,
    deviceType: deviceInfo.type,
    sessionId: deletedSession._id,
  });

  res.status(200).json({ success: true, message: "Logged out successfully" });
});

export {
  checkUser,
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  changePassword,
  logout,
};
