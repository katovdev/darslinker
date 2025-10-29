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
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_USER_EMAIL,
        pass: NODEMAILER_USER_PASSWORD,
      },
    });

    const result = await transporter.sendMail({
      from: NODEMAILER_USER_EMAIL,
      to,
      subject,
      html: text,
    });

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: result.messageId,
      response: result.response,
    });
  } catch (error) {
    logger.error("Failed to send email", {
      to,
      subject,
      error: error.message,
      stack: error.stack,
      code: error.code,
    });

    throw new Error(`Failed to send email: ${error.message}`);
  }
}
