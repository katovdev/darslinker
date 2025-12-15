import logger from "../../config/logger.js";

/**
 * Middleware to validate admin role
 * Requires user to be authenticated first
 */
export function validateAdmin(req, res, next) {
  if (!req.user) {
    logger.warn("Admin validation failed - User not authenticated", {
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  logger.info("Admin validation check", {
    userId: req.user.userId,
    userRole: req.user.role,
    url: req.originalUrl,
  });

  // Check if user has admin role
  if (req.user.role !== 'admin' && req.user.role !== 'super-admin') {
    logger.warn("Admin validation failed - Insufficient permissions", {
      userId: req.user.userId,
      userRole: req.user.role,
      url: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      message: "Access denied. Admin privileges required",
    });
  }

  logger.info("Admin validation successful", {
    userId: req.user.userId,
    userRole: req.user.role,
  });

  next();
}

/**
 * Middleware to validate teacher role
 * Requires user to be authenticated first
 */
export function validateTeacher(req, res, next) {
  if (!req.user) {
    logger.warn("Teacher validation failed - User not authenticated", {
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Check if user has teacher role or admin
  if (!['teacher', 'admin', 'super-admin'].includes(req.user.role)) {
    logger.warn("Teacher validation failed - Insufficient permissions", {
      userId: req.user.userId,
      userRole: req.user.role,
      url: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      message: "Access denied. Teacher privileges required",
    });
  }

  next();
}

/**
 * Middleware to validate student role
 * Requires user to be authenticated first
 */
export function validateStudent(req, res, next) {
  if (!req.user) {
    logger.warn("Student validation failed - User not authenticated", {
      url: req.originalUrl,
      method: req.method,
    });

    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  // Check if user has student role or admin
  if (!['student', 'admin', 'super-admin'].includes(req.user.role)) {
    logger.warn("Student validation failed - Insufficient permissions", {
      userId: req.user.userId,
      userRole: req.user.role,
      url: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      message: "Access denied. Student privileges required",
    });
  }

  next();
}