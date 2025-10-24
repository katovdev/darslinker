import { verifyAccessToken } from "../utils/token.utils.js";
import TokenBlacklist from "../models/token-blacklist.model.js";

async function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const isBlacklisted = await TokenBlacklist.findOne({ token });
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again",
      });
    }

    const decoded = verifyAccessToken(token);

    if (decoded.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is not active. Please verify your account",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token has expired. Please login again",
      });
    }

    return res.status(400).json({
      success: false,
      message: "An error occurred while authenticating",
      error: error.message,
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
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
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
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  const requestedUserId = req.params.id;
  const authenticatedUserId = req.user.userId;

  if (requestedUserId !== authenticatedUserId) {
    return res.status(403).json({
      success: false,
      message: "You do not have permission to access this resource",
    });
  }

  next();
}

export { authenticate, authorize, isOwnerOrAdmin };
