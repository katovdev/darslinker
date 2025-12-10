import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
  {
    identifier: {
      type: String,
      required: true,
      index: true,
    },
    otpHash: {
      type: String,
      required: true,
    },
    purpose: {
      type: String,
      enum: ["register", "login", "reset_password", "verify_email"],
      required: true,
      default: "register",
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 },
    },
    verified: {
      type: Boolean,
      default: false,
    },
    attempts: {
      type: Number,
      default: 0,
    },
    meta: {
      ip: String,
      userAgent: String,
      channel: {
        type: String,
        enum: ["email", "sms", "telegram"],
      },
      chatId: String,
      botType: String,
    },
    status: {
      type: String,
      enum: ["sent", "verified", "expired"],
      default: "sent",
    },
  },
  { timestamps: true, versionKey: false }
);

const Otp = mongoose.model("Otp", otpSchema);

export default Otp;
