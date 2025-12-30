import bcrypt from "bcrypt";
import logger from "../../config/logger.js";

import User from "../models/user.model.js";
import Student from "../models/student.model.js";
import Teacher from "../models/teacher.model.js";
import Session from "../models/session.model.js";
import SubAdmin from "../models/sub-admin.model.js";

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
  verifyRefreshToken,
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

  // Check in User model first
  const existingUser = await User.findOne({
    [isEmail ? "email" : "phone"]: normalizedIdentifier,
  });

  if (existingUser) {
    // Check if user is verified
    if (existingUser.status === "pending") {
      logger.info("User found but not verified - needs verification", {
        userId: existingUser._id,
        identifier: normalizedIdentifier,
        status: existingUser.status,
      });

      // Automatically send OTP for unverified users
      const channel = isEmail ? "email" : "sms";
      try {
        await createAndSendOtp({
          identifier: normalizedIdentifier,
          purpose: "register",
          channel,
          meta: {
            ip: req.ip,
            userAgent: req.headers["user-agent"],
          },
        });

        logger.info("OTP sent to unverified user", {
          userId: existingUser._id,
          identifier: normalizedIdentifier,
          channel,
        });
      } catch (otpError) {
        logger.error("Failed to send OTP to unverified user", {
          userId: existingUser._id,
          identifier: normalizedIdentifier,
          error: otpError.message,
        });
      }

      res.status(200).json({
        success: true,
        exists: false,
        next: "verify",
        message: "User exists but not verified. OTP has been sent for verification",
        user: {
          firstName: existingUser.firstName,
          lastName: existingUser.lastName,
          email: existingUser.email,
          phone: existingUser.phone
        }
      });
      return;
    }

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
    return;
  }

  // If not found in User model, check SubAdmin model (only for phone, not email)
  if (!isEmail) {
    const existingSubAdmin = await SubAdmin.findOne({
      phone: normalizedIdentifier,
      isActive: true
    });

    if (existingSubAdmin) {
      logger.info("Sub-admin found", {
        subAdminId: existingSubAdmin._id,
        identifier: normalizedIdentifier,
      });

      res.status(200).json({
        success: true,
        exists: true,
        next: "login",
        message: "Sub-admin found. Please enter your password",
        user: {
          fullName: existingSubAdmin.fullName,
          phone: existingSubAdmin.phone,
          role: "subadmin"
        },
        isSubAdmin: true
      });
      return;
    }
  }

  // User not found in either model
  logger.info("User not found - registration required", {
    identifier: normalizedIdentifier,
  });

  res.status(200).json({
    success: true,
    exists: false,
    next: "register",
    message: "User not found. Please complete registration",
  });
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
    // If user exists but not verified, resend OTP
    if (existingUser.status === "pending") {
      logger.info("User exists but not verified - resending OTP", {
        userId: existingUser._id,
        email: normalizedEmail,
        phone: normalizedPhone,
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

      const userResponse = existingUser.toObject();
      delete userResponse.password;

      return res.status(200).json({
        success: true,
        message: "User already registered but not verified. New OTP has been sent",
        user: userResponse,
      });
    }

    // If user is verified, throw error
    const duplicateField =
      existingUser.email === normalizedEmail ? "email address" : "phone number";
    throw new ConflictError(`User with this ${duplicateField} already exists and is verified`);
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

  // Get the activated user for automatic login
  const activatedUser = result.data?.user;

  if (activatedUser) {
    // Generate tokens for immediate login after verification
    const tokenPayload = {
      userId: activatedUser._id.toString(),
      email: activatedUser.email,
      phone: activatedUser.phone,
      role: activatedUser.role,
      status: activatedUser.status,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Create session
    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceFingerprint = createDeviceFingerprint(deviceInfo);

    const sessionData = {
      userId: activatedUser._id,
      ipAddress: req.ip,
      deviceInfo: deviceInfo,
      deviceFingerprint: deviceFingerprint,
      userAgent: req.headers["user-agent"],
      token: refreshToken,
      expiresAt: getSessionExpiryDate(),
    };

    await Session.findOneAndUpdate(
      {
        userId: activatedUser._id,
        deviceFingerprint: deviceFingerprint,
      },
      sessionData,
      { upsert: true, new: true }
    );

    // Return user data with tokens for immediate login
    const userResponse = {
      _id: activatedUser._id,
      firstName: activatedUser.firstName,
      lastName: activatedUser.lastName,
      email: activatedUser.email,
      phone: activatedUser.phone,
      role: activatedUser.role,
      status: activatedUser.status,
    };

    logger.info("OTP verified successfully - Account activated and logged in", {
      identifier: normalizedIdentifier,
      userId: activatedUser._id,
    });

    res.status(200).json({
      success: true,
      message: "Account verified and logged in successfully",
      accessToken,
      refreshToken,
      user: userResponse,
    });
  } else {
    logger.info("OTP verified successfully - Account activated", {
      identifier: normalizedIdentifier,
      userId: result.data?.user?._id,
    });

    res.status(200).json({
      success: true,
      message: "OTP Code verified successfully",
    });
  }
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

  // Check in User model first
  let existingUser = await User.findOne({
    [isEmail ? "email" : "phone"]: normalizedIdentifier,
  });

  // If not found in User model and using phone, check SubAdmin model
  let existingSubAdmin = null;
  if (!existingUser && !isEmail) {
    existingSubAdmin = await SubAdmin.findOne({
      phone: normalizedIdentifier,
      isActive: true
    }).populate('teacher', 'firstName lastName email phone');
  }

  if (!existingUser && !existingSubAdmin) {
    logger.warn("Login failed - User not found", {
      identifier: normalizedIdentifier,
      ip: req.ip,
    });
    throw new UnauthorizedError("Invalid email address or phone number");
  }

  // Handle sub-admin login
  if (existingSubAdmin && !existingUser) {
    const isPasswordMatch = await existingSubAdmin.comparePassword(password);

    if (!isPasswordMatch) {
      logger.warn("Login failed - Invalid password for sub-admin", {
        subAdminId: existingSubAdmin._id,
        identifier: normalizedIdentifier,
        ip: req.ip,
      });
      throw new UnauthorizedError("Invalid credentials");
    }

    // Update login info
    await existingSubAdmin.updateLoginInfo();

    const deviceInfo = parseDeviceInfo(req.headers["user-agent"]);
    const deviceFingerprint = createDeviceFingerprint(deviceInfo);

    const tokenPayload = {
      userId: existingSubAdmin._id.toString(),
      phone: existingSubAdmin.phone,
      role: "subadmin",
      teacherId: existingSubAdmin.teacher._id.toString(),
      status: "active",
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const sessionData = {
      userId: existingSubAdmin._id,
      ipAddress: req.ip,
      deviceInfo: deviceInfo,
      deviceFingerprint: deviceFingerprint,
      userAgent: req.headers["user-agent"],
      token: refreshToken,
      expiresAt: getSessionExpiryDate(),
    };

    await Session.findOneAndUpdate(
      {
        userId: existingSubAdmin._id,
        deviceFingerprint: deviceFingerprint,
      },
      sessionData,
      { upsert: true, new: true }
    );

    logger.info("Sub-admin login successful", {
      subAdminId: existingSubAdmin._id,
      teacherId: existingSubAdmin.teacher._id,
      deviceType: deviceInfo.type,
      ip: req.ip,
    });

    const userResponse = {
      _id: existingSubAdmin._id,
      fullName: existingSubAdmin.fullName,
      phone: existingSubAdmin.phone,
      role: "subadmin",
      teacher: {
        _id: existingSubAdmin.teacher._id,
        firstName: existingSubAdmin.teacher.firstName,
        lastName: existingSubAdmin.teacher.lastName,
        email: existingSubAdmin.teacher.email,
        phone: existingSubAdmin.teacher.phone,
      },
      permissions: existingSubAdmin.permissions,
      lastLogin: existingSubAdmin.lastLogin,
      loginCount: existingSubAdmin.loginCount,
    };

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      accessToken,
      refreshToken,
      user: userResponse,
    });
    return;
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
  let userResponse = {
    _id: existingUser._id,
    firstName: existingUser.firstName,
    lastName: existingUser.lastName,
    email: existingUser.email,
    phone: existingUser.phone,
    role: existingUser.role,
    status: existingUser.status,
  };

  // If teacher, get full teacher profile
  if (existingUser.role === 'teacher') {
    const teacherProfile = await Teacher.findById(existingUser._id).select('-password');
    if (teacherProfile) {
      userResponse = teacherProfile.toObject();
    }
  }

  // If student, get full student profile
  if (existingUser.role === 'student') {
    const studentProfile = await Student.findById(existingUser._id).select('-password');
    if (studentProfile) {
      userResponse = studentProfile.toObject();
    }
  }

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

/**
 * Refresh access token using refresh token
 * @route POST /auth/refresh-token
 * @access Public
 */
const refreshToken = catchAsync(async (req, res) => {
  const { refreshToken: refreshTokenFromBody } = req.body;

  if (!refreshTokenFromBody) {
    throw new BadRequestError("Refresh token is required");
  }

  logger.info("Refresh token attempt", {
    ip: req.ip,
    userAgent: req.headers["user-agent"],
  });

  // Verify the refresh token
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshTokenFromBody);
  } catch (error) {
    logger.warn("Refresh token verification failed", {
      error: error.message,
      ip: req.ip,
    });

    if (error.message.includes("expired")) {
      throw new UnauthorizedError("Refresh token has expired. Please login again");
    }
    throw new UnauthorizedError("Invalid refresh token");
  }

  // Check if refresh token exists in session (stored in DB)
  const session = await Session.findOne({
    userId: decoded.userId,
    token: refreshTokenFromBody,
  });

  if (!session) {
    logger.warn("Refresh token not found in session", {
      userId: decoded.userId,
      ip: req.ip,
    });
    throw new UnauthorizedError("Refresh token not found or invalid. Please login again");
  }

  // Check if session is expired
  if (session.expiresAt && new Date() > new Date(session.expiresAt)) {
    logger.warn("Session expired", {
      userId: decoded.userId,
      sessionId: session._id,
      ip: req.ip,
    });

    // Delete expired session
    await Session.deleteOne({ _id: session._id });
    throw new UnauthorizedError("Session has expired. Please login again");
  }

  // Get user to verify account status
  const user = await User.findById(decoded.userId);
  if (!user) {
    logger.warn("User not found for refresh token", {
      userId: decoded.userId,
      ip: req.ip,
    });
    throw new NotFoundError("User not found");
  }

  if (user.status !== "active") {
    logger.warn("Account not active for refresh token", {
      userId: decoded.userId,
      status: user.status,
      ip: req.ip,
    });
    throw new ForbiddenError("Account is not active. Please verify your account");
  }

  // Generate new access token
  const tokenPayload = {
    userId: user._id.toString(),
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
  };

  const newAccessToken = generateAccessToken(tokenPayload);

  logger.info("Access token refreshed successfully", {
    userId: user._id,
    email: user.email,
    role: user.role,
    ip: req.ip,
  });

  res.status(200).json({
    success: true,
    message: "Access token refreshed successfully",
    accessToken: newAccessToken,
    // Optionally return the same refresh token (no rotation) or generate a new one
    refreshToken: refreshTokenFromBody,
  });
});

export {
  checkUser,
  register,
  verifyRegistrationOtp,
  resendRegistrationOtp,
  login,
  changePassword,
  logout,
  refreshToken,
};
