import bcrypt from "bcrypt";
import logger from "../../config/logger.js";

import User from "../models/user.model.js";
import Teacher from "../models/teacher.model.js";
import Verification from "../models/verification.model.js";
import Session from "../models/session.model.js";

import { normalizePhone } from "../utils/normalize.utils.js";
import { sendVerificationCodeViaTelegram, generateTelegramDeepLink } from "../utils/telegram.utils.js";
import { generateAccessToken, generateRefreshToken } from "../utils/token.utils.js";
import { BCRYPT_SALT_ROUNDS } from "../../config/env.js";
import { parseDeviceInfo, getSessionExpiryDate, createDeviceFingerprint } from "../utils/device.utils.js";

import { catchAsync } from "../middlewares/error.middleware.js";
import { BadRequestError, ConflictError, UnauthorizedError } from "../utils/error.utils.js";

/**
 * Send verification code via Telegram for landing page registration
 * @route POST /landing-auth/send-verification
 * @access Public
 */
const sendVerificationCode = catchAsync(async (req, res) => {
  const { phone, firstName, lastName } = req.body;

  if (!phone || !firstName || !lastName) {
    throw new BadRequestError("Phone, firstName, and lastName are required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("📱 Landing page verification code request", {
    phone: normalizedPhone,
    firstName,
    lastName
  });

  // Check if user already exists
  const existingUser = await User.findOne({ phone: normalizedPhone });
  if (existingUser) {
    throw new ConflictError("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
  }

  // Generate 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration time (30 minutes)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Delete any existing verification codes for this phone
  await Verification.deleteMany({ phone: normalizedPhone });

  // Hash the code before storing
  const hashedCode = await bcrypt.hash(code, parseInt(BCRYPT_SALT_ROUNDS));

  // Save verification code to database
  const verification = await Verification.create({
    phone: normalizedPhone,
    code: hashedCode,
    codeText: code, // Store unhashed for Telegram sending
    firstName,
    lastName,
    expiresAt,
    codeSent: false
  });

  logger.info("✅ Verification code created", {
    phone: normalizedPhone,
    verificationId: verification._id,
    expiresAt
  });

  // Generate Telegram deep link
  const telegramLink = generateTelegramDeepLink(code);

  // Send verification code via Telegram
  const sent = await sendVerificationCodeViaTelegram(normalizedPhone, code, firstName);

  res.status(200).json({
    success: true,
    message: "Tasdiqlash kodi Telegram botga yuborildi",
    data: {
      phone: normalizedPhone,
      expiresIn: 1800, // 30 minutes in seconds
      telegramBot: process.env.TELEGRAM_BOT_USERNAME,
      telegramLink,
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { code })
    }
  });
});

/**
 * Verify code and complete registration for landing page
 * @route POST /landing-auth/verify-and-register
 * @access Public
 */
const verifyAndRegister = catchAsync(async (req, res) => {
  const { phone, firstName, lastName, verificationCode } = req.body;

  if (!phone || !firstName || !lastName || !verificationCode) {
    throw new BadRequestError("All fields are required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔐 Landing page verification attempt", {
    phone: normalizedPhone,
    firstName,
    lastName
  });

  // Find verification record
  const verification = await Verification.findOne({
    phone: normalizedPhone,
    verified: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!verification) {
    throw new UnauthorizedError("Tasdiqlash kodi topilmadi yoki muddati tugagan");
  }

  // Check max attempts
  if (verification.attempts >= 5) {
    throw new UnauthorizedError("Maksimal urinishlar soni oshib ketdi. Iltimos, yangi kod so'rang");
  }

  // Increment attempts
  verification.attempts += 1;
  await verification.save();

  // Verify code
  const isValidCode = await bcrypt.compare(verificationCode, verification.code);

  if (!isValidCode) {
    logger.warn("❌ Invalid verification code", {
      phone: normalizedPhone,
      attempts: verification.attempts
    });
    throw new UnauthorizedError("Noto'g'ri tasdiqlash kodi");
  }

  // Check if user already exists (double check)
  const existingUser = await User.findOne({ phone: normalizedPhone });
  if (existingUser) {
    throw new ConflictError("Bu telefon raqam allaqachon ro'yxatdan o'tgan");
  }

  // Generate default password (phone number last 6 digits)
  const defaultPassword = normalizedPhone.slice(-6);
  const hashedPassword = await bcrypt.hash(defaultPassword, parseInt(BCRYPT_SALT_ROUNDS));

  // Import Student model
  const Student = (await import("../models/student.model.js")).default;

  // Create new student user (not teacher!)
  const newStudent = await Student.create({
    firstName,
    lastName,
    phone: normalizedPhone,
    password: hashedPassword,
    role: 'student',
    status: 'active'
  });

  // Mark verification as verified
  verification.verified = true;
  await verification.save();

  logger.info("✅ Landing page registration successful - Student created", {
    userId: newStudent._id,
    phone: normalizedPhone,
    firstName,
    lastName,
    role: 'student'
  });

  // Get device info
  const deviceInfo = parseDeviceInfo(req.headers['user-agent']);
  const deviceFingerprint = createDeviceFingerprint(req);

  // Generate tokens - pass object payload
  const tokenPayload = {
    userId: newStudent._id.toString(),
    role: newStudent.role,
    phone: newStudent.phone
  };
  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  // Create session
  const session = await Session.create({
    userId: newStudent._id,
    token: refreshToken,
    deviceFingerprint,
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.headers['user-agent'],
    expiresAt: getSessionExpiryDate(),
  });

  logger.info("✅ Session created for new student", {
    userId: newStudent._id,
    sessionId: session._id,
    deviceType: deviceInfo.type,
  });

  // Return user data and tokens
  const userData = {
    _id: newStudent._id,
    firstName: newStudent.firstName,
    lastName: newStudent.lastName,
    phone: newStudent.phone,
    role: newStudent.role,
    status: newStudent.status,
    profileImage: newStudent.profileImage,
    createdAt: newStudent.createdAt
  };

  res.status(201).json({
    success: true,
    message: "Ro'yxatdan o'tish muvaffaqiyatli yakunlandi",
    user: userData,
    accessToken,
    refreshToken,
    defaultPassword // Send default password so user knows it
  });
});

/**
 * Resend verification code for landing page
 * @route POST /landing-auth/resend-verification
 * @access Public
 */
const resendVerificationCode = catchAsync(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new BadRequestError("Phone is required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔄 Resending verification code", {
    phone: normalizedPhone
  });

  // Find the last verification record
  const lastVerification = await Verification.findOne({
    phone: normalizedPhone
  }).sort({ createdAt: -1 });

  if (!lastVerification) {
    throw new BadRequestError("Avval ro'yxatdan o'tishni boshlang");
  }

  // Generate new 6-digit verification code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration time (30 minutes)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Hash the code before storing
  const hashedCode = await bcrypt.hash(code, parseInt(BCRYPT_SALT_ROUNDS));

  // Delete old verification codes
  await Verification.deleteMany({ phone: normalizedPhone });

  // Create new verification record
  const verification = await Verification.create({
    phone: normalizedPhone,
    code: hashedCode,
    firstName: lastVerification.firstName,
    lastName: lastVerification.lastName,
    expiresAt
  });

  logger.info("✅ New verification code created", {
    phone: normalizedPhone,
    verificationId: verification._id
  });

  // Generate Telegram deep link
  const telegramLink = generateTelegramDeepLink(code);

  // Send verification code via Telegram
  await sendVerificationCodeViaTelegram(normalizedPhone, code, lastVerification.firstName);

  res.status(200).json({
    success: true,
    message: "Yangi tasdiqlash kodi yuborildi",
    data: {
      phone: normalizedPhone,
      expiresIn: 1800,
      telegramBot: process.env.TELEGRAM_BOT_USERNAME,
      telegramLink,
      // For development only - remove in production
      ...(process.env.NODE_ENV === 'development' && { code })
    }
  });
});

export {
  sendVerificationCode,
  verifyAndRegister,
  resendVerificationCode
};
