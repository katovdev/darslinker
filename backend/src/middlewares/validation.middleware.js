/**
 * Validation Middleware Generator
 * Creates a middleware function that validates request data against a schema
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} property - Request property to validate ('body', 'params', 'query')
 * @returns {Function} Express middleware function
 */
export const validate = (schema, property = "body") => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    // Only set the property if it's not 'query' (which is read-only)
    if (property !== 'query') {
      req[property] = value;
    } else {
      // For query parameters, we can't reassign but validation passed
      // The original req.query will be used
    }
    next();
  };
};
