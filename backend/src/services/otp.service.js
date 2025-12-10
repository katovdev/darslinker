import bcrypt from "bcrypt";
import Otp from "../models/otp.model.js";
import User from "../models/user.model.js";

import * as emailService from "./mail.service.js";
import * as smsService from "./sms.service.js";

import { generateOtp } from "../utils/generate_otp.utils.js";
import {
  BCRYPT_SALT_ROUNDS,
  HASH_OTP,
  OTP_EXPIRES_SECONDS,
  OTP_LENGTH,
  OTP_MAX_ATTEMPTS,
} from "../../config/env.js";
import logger from "../../config/logger.js";
import { sendTeacherOtpViaTelegram } from "./telegram-teacher-bot.service.js";

/**
 * Create and send OTP via email or SMS
 * @param {Object} options
 * @param {string} options.identifier - Email or phone number
 * @param {string} [options.purpose="register"] - Why OTP is being sent
 * @param {"email"|"sms"} [options.channel="email"] - Channel to send OTP
 * @param {Object} [options.meta={}] - Extra metadata
 * @returns {Promise<Object>} OTP creation result
 */
export async function createAndSendOtp({
  identifier,
  purpose = "register",
  channel = "email",
  meta = {},
}) {
  try {
    logger.info("Creating OTP", { identifier, purpose, channel });

    const otp = generateOtp(parseInt(OTP_LENGTH || "6", 10));
    const expiresInSeconds = parseInt(OTP_EXPIRES_SECONDS || "1800", 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    let otpToStore = otp;
    if (HASH_OTP !== "false") {
      try {
        otpToStore = await bcrypt.hash(
          otp,
          parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
        );
      } catch (hashError) {
        logger.error("Failed to hash OTP Code", {
          error: hashError.message,
          identifier,
          purpose,
        });
        throw new Error("Internal error while securing OTP Code");
      }
    }

    const doc = await Otp.create({
      identifier,
      otpHash: otpToStore,
      purpose,
      expiresAt,
      meta: { ...meta, channel },
    });

    logger.debug("OTP saved to database", {
      otpId: doc._id,
      identifier,
      expiresAt: doc.expiresAt,
    });

    // Shorter message for faster sending
    const message = `Code: <b>${otp}</b> (${Math.floor(expiresInSeconds / 60)}min)`;

    try {
      if (channel === "email") {
        await emailService.sendEmail(identifier, "Verification Code", message);
        logger.info("OTP sent via email", { identifier, purpose });
      } else if (channel === "sms") {
        // Check if user is a teacher - send via Telegram bot
        const user = await User.findOne({
          $or: [{ email: identifier }, { phone: identifier }]
        });
        
        if (user && user.role === 'teacher') {
          // Send via Teacher Telegram Bot
          const sent = await sendTeacherOtpViaTelegram(identifier, otp);
          if (sent) {
            logger.info("OTP sent via Teacher Telegram Bot", { identifier, purpose });
          } else {
            logger.warn("Failed to send via Telegram, user needs to start bot first", { identifier });
            // Don't throw error, just log warning
          }
        } else {
          // Regular SMS for students or if user not found
          await smsService.sendSms(identifier, message);
          logger.info("OTP sent via SMS", { identifier, purpose });
        }
      } else {
        await emailService.sendEmail(identifier, "Verification Code", message);
      }
    } catch (sendError) {
      await Otp.findByIdAndDelete(doc._id);
      logger.error("Failed to send OTP Code", {
        error: sendError.message,
        identifier,
        channel,
        purpose,
      });
      throw new Error("Failed to send OTP Code message");
    }

    return {
      id: doc._id,
      identifier: doc.identifier,
      expiresAt: doc.expiresAt,
      success: true,
      message: `OTP Code sent successfully via ${channel}`,
    };
  } catch (error) {
    logger.error("OTP creation failed", {
      error: error.message,
      identifier,
      purpose,
    });
  }
}

const MAX_ATTEMPTS = parseInt(OTP_MAX_ATTEMPTS || "5", 10);
/**
 * Verify OTP Code (one-time password)
 * @param {Object} options
 * @param {string} options.identifier - Email or phone number
 * @param {string} options.otp - User-entered OTP Code
 * @param {string} [options.purpose="register"] - Purpose of OTP Code
 * @returns {Promise<Object>} Verification result
 */
export async function verifyOtp({ identifier, otp, purpose = "register" }) {
  try {
    // 1. Find latest non-verified OTP for identifier + purpose
    const doc = await Otp.findOne({
      identifier,
      purpose,
      verified: false,
    }).sort({
      createdAt: -1,
    });

    if (!doc) {
      return {
        success: false,
        message: "No OTP Code found. Please request a new one",
      };
    }

    // 2. Check expiry
    if (doc.expiresAt < new Date()) {
      return {
        success: false,
        message: "OTP Code has expired. Please request a new one",
      };
    }

    // 3. Check max attempt limit
    if (doc.attempts >= MAX_ATTEMPTS) {
      return {
        success: false,
        message: "Too many failed attempts. Request a new OTP Code",
      };
    }

    // 4. Compare OTP
    const isMatch =
      HASH_OTP !== "false"
        ? await bcrypt.compare(otp, doc.otpHash)
        : otp === doc.otpHash;

    if (!isMatch) {
      doc.attempts += 1;
      await doc.save();
      return {
        success: false,
        message: "Incorrect OTP Code. Please try again",
      };
    }

    // 5. Mark verified
    doc.verified = true;
    doc.status = "verified";
    await doc.save();

    // 6. Activate user (if purpose is “register”)
    let user = null;
    if (purpose === "register") {
      user = await User.findOneAndUpdate(
        { $or: [{ email: identifier }, { phone: identifier }] },
        { status: "active" },
        { new: true }
      );
    }

    return {
      success: true,
      message: "OTP Code verified successfully",
      data: { user },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to verify OTP Code",
      error: error.message,
    };
  }
}

const OTP_LENGTH_INT = parseInt(OTP_LENGTH || "6", 10);
const OTP_EXPIRES_SEC = parseInt(OTP_EXPIRES_SECONDS || "1800", 10);
/**
 * Resend an OTP for an identifier and purpose
 * @param {Object} options
 * @param {string} options.identifier - email or phone
 * @param {string} [options.purpose="register"] - purpose of OTP
 * @param {"email"|"sms"} [options.channel="email"] - channel to send OTP
 * @param {Object} [options.meta={}] - extra metadata
 * @returns {Promise<Object>}
 */
export async function resendOtp({
  identifier,
  purpose = "register",
  channel = "email",
  meta = {},
}) {
  try {
    // 1. Delete or mark previous unused OTPs for this identifier + purpose
    await Otp.deleteMany({ identifier, purpose, verified: false });

    // 2. Generate new OTP
    const otp = generateOtp(OTP_LENGTH_INT);
    const expiresAt = new Date(Date.now() + OTP_EXPIRES_SEC * 1000);

    const otpToStore =
      HASH_OTP !== "false"
        ? await bcrypt.hash(otp, parseInt(BCRYPT_SALT_ROUNDS || "10", 10))
        : otp;

    // 3. Save new OTP record
    const newDoc = await Otp.create({
      identifier,
      otpHash: otpToStore,
      purpose,
      expiresAt,
      meta: { ...meta, channel },
    });

    // 4. Send via channel
    const message = `Your new verification code is <b>${otp}</b>. It will expire in <b>${Math.floor(
      OTP_EXPIRES_SEC / 60
    )}</b> minutes`;

    if (channel === "email") {
      await emailService.sendEmail(
        identifier,
        "New Verification Code",
        message
      );
    } else {
      // Check if user is a teacher - send via Telegram bot
      const user = await User.findOne({
        $or: [{ email: identifier }, { phone: identifier }]
      });
      
      if (user && user.role === 'teacher') {
        // Send via Teacher Telegram Bot
        await sendTeacherOtpViaTelegram(identifier, otp);
      } else {
        // Regular SMS for students
        await smsService.sendSms(identifier, message);
      }
    }

    return {
      success: true,
      message: `New OTP Code sent successfully via ${channel}`,
      data: { identifier, expiresAt: newDoc.expiresAt },
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to resend OTP Code",
      error: error.message,
    };
  }
}
