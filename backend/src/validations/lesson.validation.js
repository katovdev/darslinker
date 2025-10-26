import Joi from "joi";

/**
 * Lesson Creation Validation Schema
 * Validates lesson data during lesson creation
 */
export const createLessonSchema = Joi.object({
  moduleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid module ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Module ID is required",
    }),

  title: Joi.string().trim().min(3).max(200).required().messages({
    "string.empty": "Lesson title is required",
    "string.min": "Lesson title must be at least 3 characters long",
    "string.max": "Lesson title cannot exceed 200 characters",
    "any.required": "Lesson title is required",
  }),

  content: Joi.string().trim().optional().allow("").messages({
    "string.base": "Content must be a string",
  }),

  videoUrl: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Video URL must be a valid URL",
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
 * Lesson Update Validation Schema
 * Validates lesson data during lesson update
 */
export const updateLessonSchema = Joi.object({
  moduleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Invalid module ID format. Must be a valid MongoDB ObjectId",
    }),

  title: Joi.string().trim().min(3).max(200).optional().messages({
    "string.min": "Lesson title must be at least 3 characters long",
    "string.max": "Lesson title cannot exceed 200 characters",
  }),

  content: Joi.string().trim().optional().allow("").messages({
    "string.base": "Content must be a string",
  }),

  videoUrl: Joi.string().trim().uri().optional().allow("").messages({
    "string.uri": "Video URL must be a valid URL",
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
 * Lesson ID Validation Schema
 * Validates MongoDB ObjectId format for lesson
 */
export const lessonIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid lesson ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Lesson ID is required",
    }),
});

/**
 * Lesson Query Validation Schema
 * Validates query parameters for lesson filtering and pagination
 */
export const lessonQuerySchema = Joi.object({
  moduleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
    .messages({
      "string.pattern.base":
        "Invalid module ID format. Must be a valid MongoDB ObjectId",
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
 * Get Lessons by Module ID Validation Schema
 * Validates module ID for getting all lessons
 */
export const getLessonsByModuleSchema = Joi.object({
  moduleId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid module ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Module ID is required",
    }),
});
