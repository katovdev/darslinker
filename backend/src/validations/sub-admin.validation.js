import Joi from "joi";

/**
 * Sub-Admin Creation Validation Schema
 * Validates sub-admin creation data
 */
export const createSubAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required().messages({
    "string.empty": "Full name is required",
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name cannot exceed 100 characters",
    "any.required": "Full name is required",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),

  password: Joi.string().min(6).max(50).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters long",
    "string.max": "Password cannot exceed 50 characters",
    "any.required": "Password is required",
  }),

  permissions: Joi.object({
    canViewStudents: Joi.boolean().optional().default(true),
    canViewCourses: Joi.boolean().optional().default(true),
    canViewReports: Joi.boolean().optional().default(false),
  }).optional(),
});

/**
 * Sub-Admin Update Validation Schema
 * Validates sub-admin update data
 */
export const updateSubAdminSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).optional().messages({
    "string.min": "Full name must be at least 2 characters long",
    "string.max": "Full name cannot exceed 100 characters",
  }),

  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[1-9][\d]{0,15}$/)
    .optional()
    .messages({
      "string.pattern.base": "Please provide a valid phone number",
    }),

  isActive: Joi.boolean().optional(),

  permissions: Joi.object({
    canViewStudents: Joi.boolean().optional(),
    canViewCourses: Joi.boolean().optional(),
    canViewReports: Joi.boolean().optional(),
  }).optional(),
})
  .min(1)
  .messages({
    "object.min": "At least one field must be provided for update",
  });

/**
 * Sub-Admin Password Update Validation Schema
 * Validates sub-admin password change
 */
export const updateSubAdminPasswordSchema = Joi.object({
  newPassword: Joi.string().min(6).max(50).required().messages({
    "string.empty": "New password is required",
    "string.min": "New password must be at least 6 characters long",
    "string.max": "New password cannot exceed 50 characters",
    "any.required": "New password is required",
  }),
});

/**
 * Sub-Admin Login Validation Schema
 * Validates sub-admin login credentials
 */
export const subAdminLoginSchema = Joi.object({
  phone: Joi.string()
    .trim()
    .pattern(/^[\+]?[0-9\s\-\(\)]{7,20}$/)
    .required()
    .messages({
      "string.empty": "Phone number is required",
      "string.pattern.base": "Please provide a valid phone number",
      "any.required": "Phone number is required",
    }),

  password: Joi.string().required().messages({
    "string.empty": "Password is required",
    "any.required": "Password is required",
  }),
});

/**
 * Sub-Admin ID Validation Schema
 * Validates MongoDB ObjectId format for sub-admin
 */
export const subAdminIdSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid sub-admin ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Sub-admin ID is required",
    }),
});

/**
 * Teacher ID Param Validation Schema (for teacher routes)
 * Validates MongoDB ObjectId format for teacher
 */
export const teacherIdParamSchema = Joi.object({
  teacherId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Invalid teacher ID format. Must be a valid MongoDB ObjectId",
      "any.required": "Teacher ID is required",
    }),
});

/**
 * Sub-Admin Query Validation Schema
 * Validates query parameters for sub-admin filtering and pagination
 */
export const subAdminQuerySchema = Joi.object({
  search: Joi.string().trim().optional().messages({
    "string.base": "Search query must be a string",
  }),

  isActive: Joi.boolean().optional().messages({
    "boolean.base": "Active status must be a boolean value",
  }),

  page: Joi.number().integer().min(1).default(1).optional().messages({
    "number.base": "Page must be a number",
    "number.integer": "Page must be an integer",
    "number.min": "Page must be at least 1",
  }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(10)
    .optional()
    .messages({
      "number.base": "Limit must be a number",
      "number.integer": "Limit must be an integer",
      "number.min": "Limit must be at least 1",
      "number.max": "Limit cannot exceed 50",
    }),

  sortBy: Joi.string()
    .valid("createdAt", "fullName", "lastLogin", "loginCount")
    .default("createdAt")
    .optional()
    .messages({
      "any.only":
        "Sort field must be one of: createdAt, fullName, lastLogin, loginCount",
    }),

  order: Joi.string().valid("asc", "desc").default("desc").optional().messages({
    "any.only": "Order must be either 'asc' or 'desc'",
  }),
});