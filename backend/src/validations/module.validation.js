import Joi from "joi";

/**
 * Module Creation Validation Schema
 * Validates module data during module creation
 */
export const createModuleSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),

  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Module title is required",
    "string.min": "Module title must be at least 3 characters long",
    "string.max": "Module title cannot exceed 200 characters",
    "any.required": "Module title is required",
  }),

  description: Joi.string().trim().max(1000).optional().allow("").messages({
    "string.max": "Module description cannot exceed 1000 characters",
  }),

  order: Joi.number().integer().min(0).optional().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order cannot be negative",
  }),

  durationMinutes: Joi.number().min(0).required().messages({
    "number.base": "Duration must be a number",
    "number.min": "Duration cannot be negative",
    "any.required": "Duration is required",
  }),
});

/**
 * Module Update Validation Schema
 * Validates module data during module update
 */
export const updateModuleSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
    }),

  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Module title must be at least 3 characters long",
    "string.max": "Module title cannot exceed 200 characters",
  }),

  description: Joi.string().trim().max(1000).optional().allow("").messages({
    "string.max": "Module description cannot exceed 1000 characters",
  }),

  order: Joi.number().integer().min(0).optional().messages({
    "number.base": "Order must be a number",
    "number.integer": "Order must be an integer",
    "number.min": "Order cannot be negative",
  }),

  durationMinutes: Joi.number().min(0).optional().messages({
    "number.base": "Duration must be a number",
    "number.min": "Duration cannot be negative",
  }),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Module ID Validation Schema
 * Validates MongoDB ObjectId format for module
 */
export const moduleIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid module ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Module ID is required",
    }),
});

/**
 * Module Query Validation Schema
 * Validates query parameters for module filtering and pagination
 */
export const moduleQuerySchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
    }),

  search: Joi.string().trim().optional().messages({
    "string.base": "Search query must be a string",
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 100",
    }),

  sortBy: Joi.string()
    .valid("createdAt", "title", "order", "durationMinutes")
    .default("order")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, title, order, durationMinutes",
    }),

  order: Joi.string().valid("asc", "desc").default("asc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});

/**
 * Get Modules by Course ID Validation Schema
 * Validates course ID for getting all modules
 */
export const getModulesByCourseSchema = Joi.object({
  courseId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid course ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Course ID is required",
    }),
});
