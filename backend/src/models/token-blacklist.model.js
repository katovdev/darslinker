import mongoose from "mongoose";

const tokenBlacklistSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    tokenType: {
      type: String,
      enum: ["access", "refresh"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: Date.now,
    },
    reason: {
      type: String,
      enum: ["logout", "security", "expired", "refresh"],
      default: "logout",
    },
    meta: {
      ip: String,
      userAgent: String,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// TTL Index - Automatically delete expired blacklisted tokens after they expire
tokenBlacklistSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Compound index for faster lookups
tokenBlacklistSchema.index({ token: 1, tokenType: 1 });

const TokenBlacklist = mongoose.model("TokenBlacklist", tokenBlacklistSchema);

export default TokenBlacklist;
