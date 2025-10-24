import {
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_ACCESS_TOKEN_SECRET_KEY,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_SECRET_KEY,
} from "../../config/env.js";

import jwt from "jsonwebtoken";

/**
 * Generate JWT access token with user payload
 * @param {Object} payload - User data to encode in token (userId, email, phone, role, status)
 * @returns {string} - Signed JWT access token
 * @throws {Error} - If token generation fails
 */
function generateAccessToken(payload) {
  try {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Token payload cannot be empty");
    }

    return jwt.sign(payload, JWT_ACCESS_TOKEN_SECRET_KEY, {
      expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN || "12h",
    });
  } catch (error) {
    throw new Error(`Failed to generate access token: ${error.message}`);
  }
}

/**
 * Generate JWT refresh token with user payload
 * @param {Object} payload - User data to encode in token (userId, email, phone, role, status)
 * @returns {string} - Signed JWT refresh token
 * @throws {Error} - If token generation fails
 */
function generateRefreshToken(payload) {
  try {
    if (!payload || Object.keys(payload).length === 0) {
      throw new Error("Token payload cannot be empty");
    }

    return jwt.sign(payload, JWT_REFRESH_TOKEN_SECRET_KEY, {
      expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN || "7d",
    });
  } catch (error) {
    throw new Error(`Failed to generate refresh token: ${error.message}`);
  }
}

/**
 * Verify and decode JWT access token
 * @param {string} token - JWT access token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyAccessToken(token) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    return jwt.verify(token, JWT_ACCESS_TOKEN_SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Access token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid access token");
    } else {
      throw new Error(`Failed to verify access token: ${error.message}`);
    }
  }
}

/**
 * Verify and decode JWT refresh token
 * @param {string} token - JWT refresh token to verify
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
function verifyRefreshToken(token) {
  try {
    if (!token) {
      throw new Error("Token is required");
    }

    return jwt.verify(token, JWT_REFRESH_TOKEN_SECRET_KEY);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new Error("Refresh token has expired");
    } else if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid refresh token");
    } else {
      throw new Error(`Failed to verify refresh token: ${error.message}`);
    }
  }
}

export {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
