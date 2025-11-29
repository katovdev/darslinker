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
    codeSent: false,
    attempts: 0
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
  const { phone, firstName, lastName, password, verificationCode } = req.body;

  if (!phone || !firstName || !lastName || !password || !verificationCode) {
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

  // Hash the provided password
  const hashedPassword = await bcrypt.hash(password, parseInt(BCRYPT_SALT_ROUNDS));

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
    refreshToken
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
    codeText: code, // Store unhashed for Telegram sending
    firstName: lastVerification.firstName,
    lastName: lastVerification.lastName,
    expiresAt,
    codeSent: false,
    attempts: 0
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

/**
 * Login with phone and password for landing page users
 * @route POST /landing-auth/login
 * @access Public
 */
const login = catchAsync(async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new BadRequestError("Phone and password are required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔐 Landing page login attempt", { phone: normalizedPhone });

  // Import Student model
  const Student = (await import("../models/student.model.js")).default;

  // Find user (try both User and Student models)
  let user = await User.findOne({ phone: normalizedPhone });
  
  if (!user) {
    // Try Student model
    user = await Student.findOne({ phone: normalizedPhone });
  }
  
  if (!user) {
    throw new UnauthorizedError("Telefon yoki parol noto'g'ri");
  }

  // Check if user status is active
  if (user.status !== 'active') {
    throw new UnauthorizedError("Hisobingiz faol emas. Iltimos, administrator bilan bog'laning.");
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Telefon yoki parol noto'g'ri");
  }

  logger.info("✅ Landing page login successful", { userId: user._id });

  res.json({
    success: true,
    message: "Muvaffaqiyatli kirdingiz",
    user: {
      id: user._id,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role
    }
  });
});

/**
 * Forgot password - send message to Telegram bot
 * @route POST /landing-auth/forgot-password
 * @access Public
 */
const forgotPassword = catchAsync(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new BadRequestError("Phone is required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔑 Forgot password request", { phone: normalizedPhone });

  // Find user
  const user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    throw new BadRequestError("Bu telefon raqam ro'yxatdan o'tmagan");
  }

  // In real implementation, you would send a message via Telegram bot
  // For now, just return success
  logger.info("📱 Forgot password - user should use /login command in Telegram bot", {
    userId: user._id
  });

  res.json({
    success: true,
    message: "Telegram botga /login buyrug'ini yuboring"
  });
});

/**
 * Send reset password code via Telegram
 * @route POST /landing-auth/send-reset-code
 * @access Public
 */
const sendResetCode = catchAsync(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new BadRequestError("Phone is required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔑 Reset password code request", { phone: normalizedPhone });

  // Import Student model
  const Student = (await import("../models/student.model.js")).default;

  // Find user
  let user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    user = await Student.findOne({ phone: normalizedPhone });
  }
  
  if (!user) {
    throw new BadRequestError("Bu telefon raqam ro'yxatdan o'tmagan");
  }

  // Generate 6-digit reset code
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Set expiration time (30 minutes)
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

  // Hash the code
  const hashedCode = await bcrypt.hash(code, parseInt(BCRYPT_SALT_ROUNDS));

  // Check if there's already an active verification code
  const existingVerification = await Verification.findOne({
    phone: normalizedPhone,
    verified: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  // If active code exists, return it instead of creating new one
  if (existingVerification && existingVerification.codeText) {
    logger.info("⚠️ Active reset code already exists", { 
      phone: normalizedPhone, 
      codeAge: Date.now() - existingVerification.createdAt.getTime() 
    });

    const chatId = existingVerification.chatId;
    let sent = false;
    if (chatId) {
      sent = await sendVerificationCodeViaTelegram(normalizedPhone, existingVerification.codeText, user.firstName);
    }

    return res.json({
      success: true,
      message: chatId 
        ? "Avvalgi kod hali amal qilmoqda va qayta yuborildi" 
        : "Avvalgi kod hali amal qilmoqda. Telegram botga /login yuboring va kontaktingizni yuboring",
      needsContact: !chatId,
      codeResent: true
    });
  }

  // Try to find existing chatId from previous verifications
  const oldVerification = await Verification.findOne({
    phone: normalizedPhone,
    chatId: { $exists: true, $ne: null }
  }).sort({ createdAt: -1 });

  const chatId = oldVerification?.chatId;

  // Save verification record
  const newVerification = await Verification.create({
    phone: normalizedPhone,
    code: hashedCode,
    codeText: code,
    firstName: user.firstName,
    lastName: user.lastName,
    chatId: chatId || null,
    expiresAt
  });

  // Send code via Telegram if chatId exists
  let sent = false;
  if (chatId) {
    sent = await sendVerificationCodeViaTelegram(normalizedPhone, code, user.firstName);
  }

  logger.info("✅ Reset code created", { phone: normalizedPhone, hasChatId: !!chatId, sent });

  res.json({
    success: true,
    message: chatId 
      ? "Tasdiqlash kodi Telegram botga yuborildi" 
      : "Telegram botga /login buyrug'ini yuboring va kontaktingizni yuboring",
    needsContact: !chatId
  });
});

/**
 * Verify reset code
 * @route POST /landing-auth/verify-reset-code
 * @access Public
 */
const verifyResetCode = catchAsync(async (req, res) => {
  const { phone, code } = req.body;

  if (!phone || !code) {
    throw new BadRequestError("Phone and code are required");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔐 Verify reset code attempt", { phone: normalizedPhone });

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
    throw new UnauthorizedError("Maksimal urinishlar soni oshib ketdi");
  }

  // Increment attempts
  verification.attempts += 1;
  await verification.save();

  // Verify code
  const isValidCode = await bcrypt.compare(code, verification.code);

  if (!isValidCode) {
    logger.warn("❌ Invalid reset code", { phone: normalizedPhone });
    throw new UnauthorizedError("Noto'g'ri tasdiqlash kodi");
  }

  logger.info("✅ Reset code verified", { phone: normalizedPhone });

  res.json({
    success: true,
    message: "Kod tasdiqlandi"
  });
});

/**
 * Reset password with verified code
 * @route POST /landing-auth/reset-password
 * @access Public
 */
const resetPassword = catchAsync(async (req, res) => {
  const { phone, code, newPassword } = req.body;

  if (!phone || !code || !newPassword) {
    throw new BadRequestError("Phone, code, and newPassword are required");
  }

  if (newPassword.length < 6) {
    throw new BadRequestError("Parol kamida 6 ta belgidan iborat bo'lishi kerak");
  }

  // Normalize phone number
  const normalizedPhone = normalizePhone(phone);

  logger.info("🔑 Reset password attempt", { phone: normalizedPhone });

  // Find and verify code again
  const verification = await Verification.findOne({
    phone: normalizedPhone,
    verified: false,
    expiresAt: { $gt: new Date() }
  }).sort({ createdAt: -1 });

  if (!verification) {
    throw new UnauthorizedError("Tasdiqlash kodi topilmadi yoki muddati tugagan");
  }

  // Verify code
  const isValidCode = await bcrypt.compare(code, verification.code);
  if (!isValidCode) {
    throw new UnauthorizedError("Noto'g'ri tasdiqlash kodi");
  }

  // Import Student model
  const Student = (await import("../models/student.model.js")).default;

  // Find user
  let user = await User.findOne({ phone: normalizedPhone });
  if (!user) {
    user = await Student.findOne({ phone: normalizedPhone });
  }
  
  if (!user) {
    throw new BadRequestError("Foydalanuvchi topilmadi");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(newPassword, parseInt(BCRYPT_SALT_ROUNDS));

  // Update password
  user.password = hashedPassword;
  await user.save();

  // Mark verification as verified
  verification.verified = true;
  await verification.save();

  logger.info("✅ Password reset successful", { userId: user._id });

  res.json({
    success: true,
    message: "Parol muvaffaqiyatli o'zgartirildi"
  });
});

export {
  sendVerificationCode,
  verifyAndRegister,
  resendVerificationCode,
  login,
  forgotPassword,
  sendResetCode,
  verifyResetCode,
  resetPassword
};
