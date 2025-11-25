import nodemailer from "nodemailer";
import logger from "../../config/logger.js";

import {
  NODEMAILER_USER_EMAIL,
  NODEMAILER_USER_PASSWORD,
} from "../../config/env.js";

// Create reusable transporter with connection pooling
let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_USER_EMAIL,
        pass: NODEMAILER_USER_PASSWORD,
      },
      // Optimize for speed
      pool: true,                    // Use connection pooling
      maxConnections: 3,             // Limit concurrent connections
      maxMessages: 100,              // Messages per connection
      connectionTimeout: 5000,       // 5 seconds (reduced from 10)
      greetingTimeout: 5000,         // 5 seconds
      socketTimeout: 5000,           // 5 seconds
      // Keep connections alive
      keepAlive: true,
      keepAliveInitialDelay: 300000  // 5 minutes
    });

    // Skip verification in production for faster performance
    if (process.env.NODE_ENV !== "production") {
      transporter.verify().catch(err => {
        logger.warn("Email transporter verification failed", { error: err.message });
      });
    }
  }
  return transporter;
}

export async function sendEmail(to, subject, text) {
  try {
    logger.info("Attempting to send email", {
      to,
      subject,
      from: NODEMAILER_USER_EMAIL,
      hasPassword: !!NODEMAILER_USER_PASSWORD,
      passwordLength: NODEMAILER_USER_PASSWORD?.length || 0,
      nodeEnv: process.env.NODE_ENV,
    });

    // Validate email configuration
    if (!NODEMAILER_USER_EMAIL || !NODEMAILER_USER_PASSWORD) {
      const errorMsg = "Email configuration is missing. Please check NODEMAILER_USER_EMAIL and NODEMAILER_USER_PASSWORD in .env file";
      logger.error(errorMsg, {
        hasEmail: !!NODEMAILER_USER_EMAIL,
        hasPassword: !!NODEMAILER_USER_PASSWORD,
      });
      throw new Error(errorMsg);
    }

    // Use the pooled transporter
    const transporter = getTransporter();

    // Test connection before sending (only in development)
    if (process.env.NODE_ENV !== "production") {
      try {
        await transporter.verify();
        logger.info("Email transporter verified successfully");
      } catch (verifyError) {
        logger.error("Email transporter verification failed", {
          error: verifyError.message,
          code: verifyError.code,
        });
      }
    }

    const result = await transporter.sendMail({
      from: `"DarsLinker" <${NODEMAILER_USER_EMAIL}>`,
      to,
      subject,
      html: text,
      // Add retry options
      priority: 'high',
    });

    logger.info("Email sent successfully", {
      to,
      subject,
      messageId: result.messageId,
      response: result.response,
      accepted: result.accepted,
      rejected: result.rejected,
    });

    return result;
  } catch (error) {
    logger.error("Failed to send email", {
      to,
      subject,
      error: error.message,
      stack: error.stack,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response,
    });

    // Provide more specific error messages
    if (error.code === 'EAUTH') {
      throw new Error('Email authentication failed. Please check your email credentials.');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNECTION') {
      throw new Error('Email server connection timeout. Please try again.');
    } else if (error.responseCode === 535) {
      throw new Error('Invalid email credentials. Please check your app password.');
    }

    throw new Error(`Failed to send email: ${error.message}`);
  }
}
