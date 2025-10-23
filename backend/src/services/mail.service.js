import nodemailer from "nodemailer";

import {
  NODEMAILER_USER_EMAIL,
  NODEMAILER_USER_PASSWORD,
} from "../../config/env.js";

export async function sendEmail(to, subject, text) {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: NODEMAILER_USER_EMAIL,
        pass: NODEMAILER_USER_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: NODEMAILER_USER_EMAIL,
      to,
      subject,
      html: text,
    });
  } catch (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
