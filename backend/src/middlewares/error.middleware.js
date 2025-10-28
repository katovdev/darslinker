import { AppError } from "../utils/error.utils.js";

/**
 * Send error response for development environment
 * Includes full error details and stack trace
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Send error response for production environment
 * Hides implementation details for security
 */
const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
  } else {
    console.error("ERROR", err);

    res.status(500).json({
      success: false,
      status: "error",
      message: "Something went wrong!",
    });
  }
};

/**
 * Handle MongoDB CastError (Invalid ObjectId)
 */
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

/**
 * Handle MongoDB Duplicate Key Error
 */
const handleDuplicateFieldsDB = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field value: "${value}". This ${field} already exists`;
  return new AppError(message, 409);
};

/**
 * Handle MongoDB Validation Error
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => ({
    field: el.path,
    message: el.message,
  }));

  const message = "Invalid input data";
  const error = new AppError(message, 400);
  error.errors = errors;
  return error;
};

/**
 * Handle JWT Token Errors
 */
const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/**
 * Handle Joi Validation Errors
 */
const handleJoiValidationError = (err) => {
  const errors = err.details.map((detail) => ({
    field: detail.path.join("."),
    message: detail.message.replace(/"/g, ""),
  }));

  const message = "Validation failed";
  const error = new AppError(message, 400);
  error.errors = errors;
  return error;
};

/**
 * Global Error Handler Middleware
 * Catches all errors in the application and sends appropriate response
 *
 * IMPORTANT: This must be the LAST middleware in app.js
 *
 * @param {Error} err - Error object
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = err;

    if (err.name === "CastError") error = handleCastErrorDB(err);
    if (err.code === 11000) error = handleDuplicateFieldsDB(err);
    if (err.name === "ValidationError") error = handleValidationErrorDB(err);
    if (err.name === "JsonWebTokenError") error = handleJWTError();
    if (err.name === "TokenExpiredError") error = handleJWTExpiredError();
    if (err.isJoi) error = handleJoiValidationError(err);

    sendErrorProd(error, res);
  }
};

/**
 * Async Error Handler Wrapper
 * Wraps async functions to catch errors and pass to global error handler
 *
 * Usage:
 * router.get('/users', catchAsync(async (req, res, next) => {
 *   const users = await User.find();
 *   res.json(users);
 * }));
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};

/**
 * 404 Not Found Handler
 * Catches all undefined routes
 *
 * Usage in app.js:
 * app.use(notFoundHandler);
 */
const notFoundHandler = (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
};

export { globalErrorHandler, catchAsync, notFoundHandler };
