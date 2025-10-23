import bcrypt from "bcrypt";
import Otp from "../models/otp.model.js";

import * as emailService from "./mail.service.js";
import * as smsService from "./sms.service.js";

import { generateOtp } from "../utils/generate_otp.utils.js";
import {
  BCRYPT_SALT_ROUNDS,
  HASH_OTP,
  OTP_EXPIRES_SECONDS,
  OTP_LENGTH,
} from "../../config/env.js";

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
    // --- 1. Generate OTP and expiration time
    const otp = generateOtp(parseInt(OTP_LENGTH || "6", 10));
    const expiresInSeconds = parseInt(OTP_EXPIRES_SECONDS || "300", 10);
    const expiresAt = new Date(Date.now() + expiresInSeconds * 1000);

    // --- 2. Hash OTP if enabled
    let otpToStore = otp;
    if (HASH_OTP !== "false") {
      try {
        otpToStore = await bcrypt.hash(
          otp,
          parseInt(BCRYPT_SALT_ROUNDS || "10", 10)
        );
      } catch (hashError) {
        console.error("Failed to hash OTP:", hashError);
        throw new Error("Internal error while securing OTP");
      }
    }

    // --- 3. Save OTP to DB
    const doc = await Otp.create({
      identifier,
      otpHash: otpToStore,
      purpose,
      expiresAt,
      meta: { ...meta, channel },
    });

    // --- 4. Send OTP based on channel
    const message = `Your verification code is <b>${otp}</b>. It will expire in <b>${Math.floor(
      expiresInSeconds / 60
    )}</b> minutes.`;

    try {
      if (channel === "email") {
        await emailService.sendEmail(identifier, "Verification Code", message);
      } else if (channel === "sms") {
        await smsService.sendSms(identifier, message);
      } else {
        // fallback: email
        await emailService.sendEmail(identifier, "Verification Code", message);
      }
    } catch (sendError) {
      // If sending failed, delete OTP record to avoid useless DB entries
      await Otp.findByIdAndDelete(doc._id);
      console.error("Failed to send OTP:", sendError);
      throw new Error("Failed to send OTP message");
    }

    // --- 5. Return safe response (no otp code returned)
    return {
      id: doc._id,
      identifier: doc.identifier,
      expiresAt: doc.expiresAt,
      success: true,
      message: `OTP sent successfully via ${channel}`,
    };
  } catch (error) {
    console.error("createAndSendOtp error:", error);
    throw new Error(error.message || "Failed to create and send OTP");
  }
}
