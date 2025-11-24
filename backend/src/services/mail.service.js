import nodemailer from "nodemailer";
import logger from "../../config/logger.js";

import {
  NODEMAILER_USER_EMAIL,
  NODEMAILER_USER_PASSWORD,
} from "../../config/env.js";

export async function sendEmail(to, subject, text) {
  try {
    logger.info("Attempting to send email", {
      to,
      subject,
      from: NODEMAILER_USER_EMAIL,
      hasPassword: !!NODEMAILER_USER_PASSWORD,
      passwordLength: NODEMAILER_USER_PASSWORD?.length || 0,
    });

    // Validate email configuration
    if (!NODEMAILER_USER_EMAIL || !NODEMAILER_USER_PASSWORD) {
      throw new Error("Email configuration is missing. Please check NODEMAILER_USER_EMAIL and NODEMAILER_USER_PASSWORD in .env file");
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_USER_EMAIL,
        pass: NODEMAILER_USER_PASSWORD,
      },
      // Add timeout for faster response
      connectionTimeout: 10000, // 10 seconds
      greetingTimeout: 10000,   // 10 seconds
      socketTimeout: 10000,     // 10 seconds
    });

    // Skip verification in production for faster performance
    if (process.env.NODE_ENV !== "production") {
      await transporter.verify();
      logger.info("Email transporter verified successfully");
    }

    const result = await transporter.sendMail({
      from: `"DarsLinker" <${NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: text,
    });

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
    });
  } catch (error) {
    logger.error("Failed to send email", {
      to,
      subject,
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }
}
