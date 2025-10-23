import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_SECRET_KEY,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_SECRET_KEY,
} from "../../config/env.js";

import jwt from "jsonwebtoken";

async function generateAccessToken(payload) {
  try {
    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN || "12h",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating access token",
      error: error.message,
    });
  }
}

async function generateRefreshToken(payload) {
  try {
    return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while generating refresh token",
      error: error.message,
    });
  }
}

export { generateAccessToken, generateRefreshToken };
