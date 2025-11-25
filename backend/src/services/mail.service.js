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
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use STARTTLS
      auth: {
        user: NODEMAILER_USER_EMAIL,
        pass: NODEMAILER_USER_PASSWORD,
      },
      // Increase timeouts for production servers
      connectionTimeout: 60000,      // 60 seconds
      greetingTimeout: 30000,        // 30 seconds
      socketTimeout: 60000,          // 60 seconds
      logger: true,                  // Enable logging
      debug: true,                   // Enable debug output
    });
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

    // Retry logic for production
    let lastError;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.info(`Email send attempt ${attempt}/${maxRetries}`, { to, subject });
        
        const result = await transporter.sendMail({
          from: `"DarsLinker" <${NODEMAILER_USER_EMAIL}>`,
          to,
          subject,
          html: text,
          priority: 'high',
        });

        logger.info("Email sent successfully", {
          to,
          subject,
          messageId: result.messageId,
          response: result.response,
          accepted: result.accepted,
          rejected: result.rejected,
          attempt,
        });

        return result;
      } catch (error) {
        lastError = error;
        logger.warn(`Email send attempt ${attempt} failed`, {
          to,
          subject,
          error: error.message,
          code: error.code,
          attempt,
        });

        // Wait before retry (exponential backoff)
        if (attempt < maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          logger.info(`Waiting ${waitTime}ms before retry`, { attempt });
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }

    // All retries failed
    throw lastError;


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
