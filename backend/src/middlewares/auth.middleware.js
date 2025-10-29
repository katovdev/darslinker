import { verifyAccessToken } from "../utils/token.utils.js";
import TokenBlacklist from "../models/token-blacklist.model.js";

import logger from "../../config/logger.js";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Authentication failed - No token provided", {
        ip: req.ip,
        url: req.originalUrl,
        method: req.method,
      });

      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      logger.warn("Authentication failed - Token is blacklisted", {
        ip: req.ip,
        url: req.originalUrl,
        reason: isBlacklisted.reason,
      });

      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again",
      });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.status !== "active") {
      logger.warn("Authentication failed - Account not active", {
        userId: decoded.userId,
        status: decoded.status,
        ip: req.ip,
        url: req.originalUrl,
      });

      return res.status(403).json({
        success: false,
        message: "Account is not active. Please verify your account",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      logger.warn("Authentication failed - Invalid token", {
        ip: req.ip,
        url: req.originalUrl,
        error: error.message,
      });

      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      logger.warn("Authentication failed - Token expired", {
        ip: req.ip,
        url: req.originalUrl,
        expiredAt: error.expiredAt,
      });

      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again",
      });
    }

    logger.error("Authentication error - Unexpected", {
      ip: req.ip,
      url: req.originalUrl,
      error: error.message,
      stack: error.stack,
    });

    return res.status(500).json({
      success: false,
      message: "An error occurred while authenticating",
    });
  }
}

/**
 * Authorization middleware - checks if user has required role(s)
 * @param {string[]} allowedRoles - Array of allowed roles (e.g., ['teacher', 'student'])
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      logger.warn("Authorization failed - User not authenticated", {
        url: req.originalUrl,
        method: req.method,
      });

      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      logger.warn("Authorization failed - Insufficient permissions", {
        userId: req.user.userId,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        url: req.originalUrl,
      });

      return res.status(403).json({
        success: false,
        message: `Access denied. This endpoint is only for ${allowedRoles.join(
          " or "
        )}s`,
      });
    }

    next();
  };
}

/**
 * Middleware to check if authenticated user is the owner or admin
 * Used for update/delete operations where user can only modify their own data
 */
function isOwnerOrAdmin(req, res, next) {
  if (!req.user) {
    logger.warn("Ownership check failed - User not authenticated", {
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const requestedUserId = req.params.id;
  const authenticatedUserId = req.user.userId;

  if (requestedUserId !== authenticatedUserId) {
    logger.warn("Ownership check failed - User not owner", {
      authenticatedUserId,
      requestedUserId,
      url: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource",
    });
  }

  next();
}

export { authenticate, authorize, isOwnerOrAdmin };
