import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    ipAddress: { type: String },
    deviceInfo: {
      deviceType: { type: String },
      deviceModel: { type: String },
      os: { type: String },
      osVersion: { type: String },
      client: { type: String },
      clientVersion: { type: String },
    },
    userAgent: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
    token: { type: String, required: true },
    deviceFingerprint: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

sessionSchema.index({ userId: 1, deviceFingerprint: 1 }, { unique: true });

const Session = mongoose.model("Session", sessionSchema);

export default Session;
